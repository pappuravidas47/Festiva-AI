import { Response } from 'express';
import { Types } from 'mongoose';
import { Event } from '../models/Event.js';
import { Vendor } from '../models/Vendor.js';
import { BudgetItem } from '../models/BudgetItem.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { getQuestionsForVendor } from '../services/ai/geminiService.js';

export const getVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const { category, status, search } = req.query;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const query: any = { eventId, userId };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.bookingStatus = status;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { contactName: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 });

    // Aggregate statistics
    const allVendors = await Vendor.find({ eventId, userId });
    const totalVendors = allVendors.length;
    const bookedVendors = allVendors.filter((v) => v.bookingStatus === 'Booked').length;
    const totalCommittedSpend = allVendors
      .filter((v) => v.bookingStatus === 'Booked')
      .reduce((acc, v) => acc + (v.finalPrice || v.quotedPrice || 0), 0);
    const totalQuotedSpend = allVendors.reduce((acc, v) => acc + (v.quotedPrice || 0), 0);

    res.status(200).json({
      success: true,
      metrics: {
        totalVendors,
        bookedVendors,
        totalCommittedSpend,
        totalQuotedSpend,
      },
      vendors,
    });
  } catch (error) {
    console.error('[VendorController.getVendors] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendors.' });
  }
};

export const createVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId, name, category, contactName, phone, email, address, quotedPrice, finalPrice, bookingStatus, notes, rating } = req.body;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    // Auto-generate suggested AI questions for this vendor category
    const aiQuestions = getQuestionsForVendor(category, event.eventType);

    const vendor = await Vendor.create({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
      name,
      category,
      contactName: contactName || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      quotedPrice: Number(quotedPrice) || 0,
      finalPrice: Number(finalPrice) || 0,
      bookingStatus: bookingStatus || 'To Contact',
      aiQuestions,
      notes: notes || '',
      rating: rating || undefined,
    });

    // If booked, optionally create or update corresponding budget item
    if (bookingStatus === 'Booked' && (finalPrice > 0 || quotedPrice > 0)) {
      await BudgetItem.create({
        eventId: event._id,
        userId: new Types.ObjectId(userId),
        category: category === 'Caterer' ? 'Catering' : category === 'Decorator' ? 'Decoration' : category === 'Photographer' ? 'Photography' : category === 'Transport' ? 'Transportation' : category === 'Venue' ? 'Venue' : 'Miscellaneous',
        description: `${name} (${category})`,
        estimatedCost: Number(quotedPrice) || 0,
        actualCost: Number(finalPrice || quotedPrice) || 0,
        paidStatus: 'Unpaid',
        vendorId: vendor._id,
        notes: `Auto-linked from booked vendor: ${name}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vendor record added successfully.',
      vendor,
    });
  } catch (error) {
    console.error('[VendorController.createVendor] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add vendor.' });
  }
};

export const updateVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const vendor = await Vendor.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Vendor record updated.',
      vendor,
    });
  } catch (error) {
    console.error('[VendorController.updateVendor] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update vendor.' });
  }
};

export const deleteVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const vendor = await Vendor.findOneAndDelete({ _id: id, userId });
    if (!vendor) {
      res.status(404).json({ success: false, message: 'Vendor not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Vendor record removed successfully.',
    });
  } catch (error) {
    console.error('[VendorController.deleteVendor] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete vendor.' });
  }
};

export const getVendorAIQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, eventType } = req.query;
    const questions = getQuestionsForVendor(
      (category as string) || 'General',
      (eventType as string) || 'Celebration'
    );

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('[VendorController.getVendorAIQuestions] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor questions.' });
  }
};
