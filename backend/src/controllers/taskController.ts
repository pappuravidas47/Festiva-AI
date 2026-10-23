import { Response } from 'express';
import { Types } from 'mongoose';
import { Event } from '../models/Event.js';
import { Task, TaskPriority, TaskCategory, TaskStatus } from '../models/Task.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const { category, priority, status, search, sortBy } = req.query;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const query: any = { eventId, userId };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOption: any = { dueDate: 1 };
    if (sortBy === 'priority') {
      sortOption = { priority: -1, dueDate: 1 };
    } else if (sortBy === 'createdAt') {
      sortOption = { createdAt: -1 };
    }

    const tasks = await Task.find(query).sort(sortOption);

    // Compute task metrics for the event
    const now = new Date();
    const allEventTasks = await Task.find({ eventId, userId });
    const totalCount = allEventTasks.length;
    const completedCount = allEventTasks.filter((t) => t.status === 'Completed').length;
    const pendingCount = allEventTasks.filter((t) => t.status === 'Pending').length;
    const inProgressCount = allEventTasks.filter((t) => t.status === 'In Progress').length;
    const overdueCount = allEventTasks.filter(
      (t) => t.status !== 'Completed' && new Date(t.dueDate) < now
    ).length;
    const upcomingCount = allEventTasks.filter(
      (t) => t.status !== 'Completed' && new Date(t.dueDate) >= now
    ).length;

    res.status(200).json({
      success: true,
      metrics: {
        totalCount,
        completedCount,
        pendingCount,
        inProgressCount,
        overdueCount,
        upcomingCount,
        completionPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      },
      tasks,
    });
  } catch (error) {
    console.error('[TaskController.getTasks] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId, title, description, dueDate, priority, category, status, assignedTo, notes } = req.body;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const task = await Task.create({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      category: category || 'Final Preparation',
      status: status || 'Pending',
      assignedTo: assignedTo || '',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Task added to timeline.',
      task,
    });
  } catch (error) {
    console.error('[TaskController.createTask] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const updateData = { ...req.body };
    if (updateData.status === 'Completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    } else if (updateData.status && updateData.status !== 'Completed') {
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    console.error('[TaskController.updateTask] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
};

export const toggleTaskCompletion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found or access denied.' });
      return;
    }

    if (task.status === 'Completed') {
      task.status = 'Pending';
      task.completedAt = undefined;
    } else {
      task.status = 'Completed';
      task.completedAt = new Date();
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.status}.`,
      task,
    });
  } catch (error) {
    console.error('[TaskController.toggleTaskCompletion] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle task.' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    console.error('[TaskController.deleteTask] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
};

export const autoGenerateMilestones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const eventDate = new Date(event.eventDate).getTime();
    const now = Date.now();
    const span = Math.max(7 * 24 * 60 * 60 * 1000, eventDate - now);

    const milestones = [
      {
        title: 'Lock in and deposit venue contract',
        category: 'Venue' as TaskCategory,
        priority: 'Urgent' as TaskPriority,
        dueDate: new Date(now + span * 0.15),
      },
      {
        title: 'Taste testing and confirm caterer menu',
        category: 'Catering' as TaskCategory,
        priority: 'High' as TaskPriority,
        dueDate: new Date(now + span * 0.35),
      },
      {
        title: 'Hire lead photographer & videographer',
        category: 'Vendors' as TaskCategory,
        priority: 'High' as TaskPriority,
        dueDate: new Date(now + span * 0.45),
      },
      {
        title: 'Finalize theme decor, floral concept & lighting',
        category: 'Decoration' as TaskCategory,
        priority: 'Medium' as TaskPriority,
        dueDate: new Date(now + span * 0.55),
      },
      {
        title: 'Design and broadcast event invitations',
        category: 'Invitations' as TaskCategory,
        priority: 'High' as TaskPriority,
        dueDate: new Date(now + span * 0.65),
      },
      {
        title: 'Review playlist and audio equipment with DJ/host',
        category: 'Entertainment' as TaskCategory,
        priority: 'Medium' as TaskPriority,
        dueDate: new Date(now + span * 0.8),
      },
      {
        title: 'Final walkthrough and emergency contact sheet',
        category: 'Final Preparation' as TaskCategory,
        priority: 'Urgent' as TaskPriority,
        dueDate: new Date(Math.max(now, eventDate - 24 * 60 * 60 * 1000)),
      },
    ];

    const created = await Task.insertMany(
      milestones.map((m) => ({
        ...m,
        eventId: event._id,
        userId: new Types.ObjectId(userId),
        status: 'Pending' as TaskStatus,
      }))
    );

    res.status(201).json({
      success: true,
      message: `${created.length} chronological milestones auto-generated!`,
      tasks: created,
    });
  } catch (error) {
    console.error('[TaskController.autoGenerateMilestones] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate milestones.' });
  }
};
