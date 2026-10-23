import { Response } from 'express';
import { Types } from 'mongoose';
import { Event } from '../models/Event.js';
import { EventPlan } from '../models/EventPlan.js';
import { BudgetItem } from '../models/BudgetItem.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  generatePlanWithAI,
  refinePlanWithAI,
  suggestIdeasWithAI,
  isGeminiConfigured,
} from '../services/ai/geminiService.js';

export const getAIStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const configured = isGeminiConfigured();
  res.status(200).json({
    success: true,
    geminiConfigured: configured,
    model: configured ? 'gemini-1.5-flash' : 'curated-festiva-engine',
    message: configured
      ? 'Google Gemini AI is connected and active.'
      : 'GEMINI_API_KEY is not configured in backend/.env. Running with Festiva curated intelligence fallback. All features remain fully functional.',
  });
};

export const generatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.body;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const { plan: generatedContent, isDemo } = await generatePlanWithAI(event);

    // Save or update EventPlan in MongoDB
    let plan = await EventPlan.findOne({ eventId: event._id });
    if (plan) {
      Object.assign(plan, generatedContent);
      plan.isDemoContent = isDemo;
      await plan.save();
    } else {
      plan = await EventPlan.create({
        ...generatedContent,
        eventId: event._id,
        userId: new Types.ObjectId(userId),
        isDemoContent: isDemo,
      });
    }

    // If budget items are empty for this event, auto-populate from AI budgetBreakdown
    const existingBudgetCount = await BudgetItem.countDocuments({ eventId: event._id });
    if (existingBudgetCount === 0 && generatedContent.budgetBreakdown?.items?.length) {
      const budgetItemsToInsert = generatedContent.budgetBreakdown.items.map((item: any) => ({
        eventId: event._id,
        userId: new Types.ObjectId(userId),
        category: item.category,
        description: item.item,
        estimatedCost: item.estimatedCost,
        actualCost: 0,
        paidStatus: 'Unpaid',
        notes: item.notes || '',
      }));
      await BudgetItem.insertMany(budgetItemsToInsert);
    }

    res.status(200).json({
      success: true,
      message: isDemo
        ? 'Curated event plan generated! (Demo preview mode. Set GEMINI_API_KEY for live GenAI)'
        : 'AI plan generated successfully with Gemini AI!',
      plan,
      isDemo,
    });
  } catch (error) {
    console.error('[AIController.generatePlan] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI plan. Please retry.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const refinePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId, instruction } = req.body;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    let currentPlan = await EventPlan.findOne({ eventId: event._id });
    if (!currentPlan) {
      // If plan hasn't been generated yet, generate initial
      const { plan: freshPlan, isDemo } = await generatePlanWithAI(event);
      currentPlan = await EventPlan.create({
        ...freshPlan,
        eventId: event._id,
        userId: new Types.ObjectId(userId),
        isDemoContent: isDemo,
      });
    }

    const { plan: refinedContent, isDemo } = await refinePlanWithAI(
      currentPlan.toObject(),
      event,
      instruction
    );

    Object.assign(currentPlan, refinedContent);
    await currentPlan.save();

    res.status(200).json({
      success: true,
      message: 'Event plan successfully refined!',
      plan: currentPlan,
      isDemo,
    });
  } catch (error) {
    console.error('[AIController.refinePlan] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to refine plan.' });
  }
};

export const suggestIdeas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventType, budget, guestCount, city, theme, prompt } = req.body;

    const { ideas, isDemo } = await suggestIdeasWithAI({
      eventType,
      budget,
      guestCount,
      city,
      theme,
      prompt,
    });

    res.status(200).json({
      success: true,
      ideas,
      isDemo,
    });
  } catch (error) {
    console.error('[AIController.suggestIdeas] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate ideas.' });
  }
};

export const regenerateSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId, section } = req.body;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const plan = await EventPlan.findOne({ eventId: event._id });
    if (!plan) {
      res.status(404).json({ success: false, message: 'No event plan exists to regenerate.' });
      return;
    }

    // Refresh the specific section from demo or AI fresh roll
    const { plan: fresh } = await generatePlanWithAI(event);
    if ((fresh as any)[section]) {
      (plan as any)[section] = (fresh as any)[section];
      await plan.save();
    }

    res.status(200).json({
      success: true,
      message: `Section "${section}" regenerated successfully!`,
      plan,
    });
  } catch (error) {
    console.error('[AIController.regenerateSection] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to regenerate section.' });
  }
};
