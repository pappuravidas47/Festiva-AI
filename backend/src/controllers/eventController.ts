import { Response } from 'express';
import { Types } from 'mongoose';
import { Event } from '../models/Event.js';
import { EventPlan } from '../models/EventPlan.js';
import { BudgetItem } from '../models/BudgetItem.js';
import { Task } from '../models/Task.js';
import { Vendor } from '../models/Vendor.js';
import { Guest } from '../models/Guest.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const eventData = req.body;

    const event = await Event.create({
      ...eventData,
      userId: new Types.ObjectId(userId),
    });

    // Auto-generate standard starter milestone tasks for the event
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    const daysUntilEvent = Math.max(1, Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const starterTasks = [
      {
        title: 'Book primary venue and confirm date slot',
        category: 'Venue',
        priority: 'Urgent',
        dueDate: new Date(now.getTime() + Math.min(daysUntilEvent * 0.25, 14) * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Finalize catering menu and dietary counts',
        category: 'Catering',
        priority: 'High',
        dueDate: new Date(now.getTime() + Math.min(daysUntilEvent * 0.5, 30) * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Select theme decor palette and lighting setup',
        category: 'Decoration',
        priority: 'Medium',
        dueDate: new Date(now.getTime() + Math.min(daysUntilEvent * 0.65, 45) * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Send invitations and track RSVPs',
        category: 'Invitations',
        priority: 'High',
        dueDate: new Date(now.getTime() + Math.min(daysUntilEvent * 0.75, 50) * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Conduct final briefing with all hired vendors',
        category: 'Vendors',
        priority: 'Urgent',
        dueDate: new Date(eventDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    await Task.insertMany(
      starterTasks.map((t) => ({
        ...t,
        eventId: event._id,
        userId: new Types.ObjectId(userId),
        status: 'Pending',
      }))
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      event,
    });
  } catch (error) {
    console.error('[EventController.createEvent] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
};

export const getMyEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const events = await Event.find({ userId }).sort({ eventDate: 1 });

    // Collate quick summary stats for each event
    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const [taskTotal, taskCompleted, budgetItems, guestCount] = await Promise.all([
          Task.countDocuments({ eventId: ev._id }),
          Task.countDocuments({ eventId: ev._id, status: 'Completed' }),
          BudgetItem.find({ eventId: ev._id }),
          Guest.countDocuments({ eventId: ev._id }),
        ]);

        const actualSpent = budgetItems.reduce((acc, curr) => acc + (curr.actualCost || 0), 0);
        const plannedBudget = ev.budget || 0;

        return {
          ...ev.toObject(),
          stats: {
            taskTotal,
            taskCompleted,
            actualSpent,
            plannedBudget,
            guestCount,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      events: eventsWithStats,
    });
  } catch (error) {
    console.error('[EventController.getMyEvents] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const event = await Event.findOne({ _id: id, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const latestPlan = await EventPlan.findOne({ eventId: event._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      event,
      plan: latestPlan,
    });
  } catch (error) {
    console.error('[EventController.getEventById] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const event = await Event.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    console.error('[EventController.updateEvent] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

export const duplicateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const original = await Event.findOne({ _id: id, userId });
    if (!original) {
      res.status(404).json({ success: false, message: 'Original event not found or access denied.' });
      return;
    }

    const clonedData = original.toObject();
    delete (clonedData as any)._id;
    delete (clonedData as any).createdAt;
    delete (clonedData as any).updatedAt;

    clonedData.name = `${original.name} (Copy)`;
    clonedData.status = 'Planning';

    const newEvent = await Event.create(clonedData);

    // Duplicate tasks
    const originalTasks = await Task.find({ eventId: original._id });
    if (originalTasks.length > 0) {
      const clonedTasks = originalTasks.map((t) => {
        const obj = t.toObject();
        delete (obj as any)._id;
        delete (obj as any).createdAt;
        delete (obj as any).updatedAt;
        return {
          ...obj,
          eventId: newEvent._id,
          status: 'Pending' as const,
        };
      });
      await Task.insertMany(clonedTasks);
    }

    // Duplicate latest AI plan if exists
    const originalPlan = await EventPlan.findOne({ eventId: original._id }).sort({ createdAt: -1 });
    if (originalPlan) {
      const planObj = originalPlan.toObject();
      delete (planObj as any)._id;
      delete (planObj as any).createdAt;
      delete (planObj as any).updatedAt;
      planObj.eventId = newEvent._id;
      await EventPlan.create(planObj);
    }

    res.status(201).json({
      success: true,
      message: 'Event duplicated successfully.',
      event: newEvent,
    });
  } catch (error) {
    console.error('[EventController.duplicateEvent] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate event.' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const event = await Event.findOneAndDelete({ _id: id, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    // Cascading delete of all related resources
    await Promise.all([
      EventPlan.deleteMany({ eventId: event._id }),
      BudgetItem.deleteMany({ eventId: event._id }),
      Task.deleteMany({ eventId: event._id }),
      Vendor.deleteMany({ eventId: event._id }),
      Guest.deleteMany({ eventId: event._id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Event and all associated records deleted successfully.',
    });
  } catch (error) {
    console.error('[EventController.deleteEvent] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
};
