import { Response } from 'express';
import { Types } from 'mongoose';
import { Event } from '../models/Event.js';
import { BudgetItem } from '../models/BudgetItem.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getBudgetSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const items = await BudgetItem.find({ eventId, userId }).sort({ createdAt: -1 });

    const totalBudget = Number(event.budget) || 0;
    const totalEstimated = items.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
    const totalActual = items.reduce((sum, item) => sum + (Number(item.actualCost) || 0), 0);
    const remainingBudget = totalBudget - totalActual;
    const utilizationRate = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
    const isOverBudget = totalActual > totalBudget;

    // Category breakdown aggregation
    const categories = [
      'Venue',
      'Catering',
      'Decoration',
      'Photography',
      'Entertainment',
      'Invitations',
      'Transportation',
      'Gifts',
      'Miscellaneous',
      'Contingency',
    ];

    const categoryBreakdown = categories.map((cat) => {
      const catItems = items.filter((i) => i.category === cat);
      const estimated = catItems.reduce((acc, i) => acc + (Number(i.estimatedCost) || 0), 0);
      const actual = catItems.reduce((acc, i) => acc + (Number(i.actualCost) || 0), 0);
      return {
        category: cat,
        estimated,
        actual,
        itemCount: catItems.length,
        difference: estimated - actual,
      };
    }).filter((c) => c.estimated > 0 || c.actual > 0);

    // Savings suggestions
    const savingsSuggestions: string[] = [];
    if (isOverBudget) {
      savingsSuggestions.push(
        `You have exceeded the total budget by ${event.currency}${(totalActual - totalBudget).toLocaleString('en-IN')}. Consider switching decor items to seasonal or DIY options.`
      );
    }

    const cateringCat = categoryBreakdown.find((c) => c.category === 'Catering');
    if (cateringCat && cateringCat.actual > totalBudget * 0.45) {
      savingsSuggestions.push(
        'Catering currently accounts for over 45% of total budget. Review menu options to offer live buffet stations instead of pre-plated courses.'
      );
    }

    const venueCat = categoryBreakdown.find((c) => c.category === 'Venue');
    if (venueCat && venueCat.actual > totalBudget * 0.4) {
      savingsSuggestions.push(
        'Venue expenditure is high. Check if the venue contract permits outside decor vendors without penalty.'
      );
    }

    if (savingsSuggestions.length === 0) {
      savingsSuggestions.push(
        'Great job! Your spending is well within your planned budget allocations.'
      );
      savingsSuggestions.push(
        'Reserve at least 5% in your Contingency category for unforeseen delivery or overtime fees.'
      );
    }

    res.status(200).json({
      success: true,
      summary: {
        totalBudget,
        currency: event.currency,
        totalEstimated,
        totalActual,
        remainingBudget,
        utilizationRate,
        isOverBudget,
        categoryBreakdown,
        savingsSuggestions,
      },
      items,
    });
  } catch (error) {
    console.error('[BudgetController.getBudgetSummary] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget summary.' });
  }
};

export const addBudgetItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId, category, description, estimatedCost, actualCost, paidStatus, dueDate, notes, vendorId } = req.body;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const item = await BudgetItem.create({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
      category,
      description,
      estimatedCost: Number(estimatedCost) || 0,
      actualCost: Number(actualCost) || 0,
      paidStatus: paidStatus || 'Unpaid',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      vendorId: vendorId ? new Types.ObjectId(vendorId) : undefined,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Budget expense item added successfully.',
      item,
    });
  } catch (error) {
    console.error('[BudgetController.addBudgetItem] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add budget item.' });
  }
};

export const updateBudgetItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const item = await BudgetItem.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!item) {
      res.status(404).json({ success: false, message: 'Budget item not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Budget item updated.',
      item,
    });
  } catch (error) {
    console.error('[BudgetController.updateBudgetItem] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update budget item.' });
  }
};

export const deleteBudgetItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const item = await BudgetItem.findOneAndDelete({ _id: id, userId });
    if (!item) {
      res.status(404).json({ success: false, message: 'Budget item not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Budget item deleted successfully.',
    });
  } catch (error) {
    console.error('[BudgetController.deleteBudgetItem] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete budget item.' });
  }
};
