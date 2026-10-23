import { Response } from 'express';
import { Types } from 'mongoose';
import { Event } from '../models/Event.js';
import { Guest } from '../models/Guest.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getGuests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const { rsvpStatus, group, search } = req.query;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const query: any = { eventId, userId };
    if (rsvpStatus && rsvpStatus !== 'All') {
      query.rsvpStatus = rsvpStatus;
    }
    if (group && group !== 'All') {
      query.group = group;
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const guests = await Guest.find(query).sort({ createdAt: -1 });

    // Aggregate statistics
    const allGuests = await Guest.find({ eventId, userId });
    const totalCount = allGuests.length;
    const attendingCount = allGuests.filter((g) => g.rsvpStatus === 'Attending').length;
    const pendingCount = allGuests.filter((g) => g.rsvpStatus === 'Pending').length;
    const notAttendingCount = allGuests.filter((g) => g.rsvpStatus === 'Not Attending').length;
    const totalHeadcount = allGuests
      .filter((g) => g.rsvpStatus === 'Attending')
      .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);

    res.status(200).json({
      success: true,
      metrics: {
        totalGuests: totalCount,
        attendingGuests: attendingCount,
        pendingGuests: pendingCount,
        notAttendingGuests: notAttendingCount,
        totalHeadcountWithPlusOnes: totalHeadcount,
        expectedCapacity: event.guestCount,
      },
      guests,
    });
  } catch (error) {
    console.error('[GuestController.getGuests] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch guests.' });
  }
};

export const createGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId, name, email, phone, group, rsvpStatus, plusOnes, dietaryRequirements, tableNumber, notes } = req.body;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found or access denied.' });
      return;
    }

    const guest = await Guest.create({
      eventId: new Types.ObjectId(eventId),
      userId: new Types.ObjectId(userId),
      name,
      email: email || '',
      phone: phone || '',
      group: group || 'Friends',
      rsvpStatus: rsvpStatus || 'Pending',
      plusOnes: Number(plusOnes) || 0,
      dietaryRequirements: dietaryRequirements || [],
      tableNumber: tableNumber || '',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Guest added to celebration list.',
      guest,
    });
  } catch (error) {
    console.error('[GuestController.createGuest] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add guest.' });
  }
};

export const updateGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const guest = await Guest.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Guest updated successfully.',
      guest,
    });
  } catch (error) {
    console.error('[GuestController.updateGuest] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update guest.' });
  }
};

export const deleteGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const guest = await Guest.findOneAndDelete({ _id: id, userId });
    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found or access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Guest removed from event list.',
    });
  } catch (error) {
    console.error('[GuestController.deleteGuest] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete guest.' });
  }
};

export const exportGuestsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const guests = await Guest.find({ eventId, userId });

    const headers = ['Name', 'Group', 'RSVP Status', 'Plus Ones', 'Dietary Requirements', 'Email', 'Phone', 'Table Number', 'Notes'];
    const rows = guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.group}"`,
      `"${g.rsvpStatus}"`,
      g.plusOnes,
      `"${(g.dietaryRequirements || []).join('; ').replace(/"/g, '""')}"`,
      `"${g.email || ''}"`,
      `"${g.phone || ''}"`,
      `"${g.tableNumber || ''}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Guests.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('[GuestController.exportGuestsCSV] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
};

export const generateInvitationDrafts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;

    const event = await Event.findOne({ _id: eventId, userId });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const dateFormatted = new Date(event.eventDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const drafts = {
      formal: `Together with our families, we take immense joy in inviting you to honor us with your gracious presence at "${event.name}".\n\nDate: ${dateFormatted}\nTime: ${event.startTime || '6:00 PM'} onwards\nVenue: ${event.city} ${event.location ? ' - ' + event.location : ''}\n\nKindly RSVP at your earliest convenience.`,
      warmCasual: `We're celebrating "${event.name}" and it simply wouldn't be the same without you!\n\nJoin us on ${dateFormatted} at ${event.startTime || '6:00 PM'} in ${event.city}.\nExpect wonderful food, joyful laughter, and great music. Let us know if you can make it! 🥂✨`,
      shortWhatsApp: `🎉 *You're Invited!* 🎊\n\nPlease join us to celebrate *${event.name}*!\n\n📅 Date: ${dateFormatted}\n📍 Place: ${event.city}\n⏰ Time: ${event.startTime || '6:00 PM'}\n\nCan't wait to see you there! Please send your RSVP. 🙏`,
    };

    res.status(200).json({
      success: true,
      drafts,
    });
  } catch (error) {
    console.error('[GuestController.generateInvitationDrafts] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invitation drafts.' });
  }
};
