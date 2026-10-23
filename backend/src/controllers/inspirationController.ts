import { Response } from 'express';
import { Types } from 'mongoose';
import { Inspiration } from '../models/Inspiration.js';
import { Event } from '../models/Event.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const PRESET_INSPIRATIONS = [
  {
    title: 'Emerald Palace & Golden Sangeet',
    eventType: 'Wedding',
    style: 'Royal & Opulent',
    budgetTier: 'Luxury',
    colorPalette: ['#065F46', '#D97706', '#FEF3C7', '#1E293B'],
    description: 'A regal Indian wedding aesthetic with cascading marigolds, brass lanterns, velvet cushions, and warm candle-lit arches.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    decorIdeas: ['Brass hanging urli with floating rose petals and diyas', 'Velvet royal emerald backdrop with gold zardozi motifs', 'Fairy light tunnel entrance'],
    menuIdeas: ['Dal Bukhara with Truffle Naan', 'Saffron Pista Kulfi Shots', 'Rose Petal Thandai Cocktails'],
    diyTips: ['Spray paint glass jars with metallic gold for rustic table centerpieces', 'Handmade fabric tassels for photo booth backdrops'],
  },
  {
    title: 'Boho Sunset Meadow',
    eventType: 'Wedding',
    style: 'Bohemian Chic',
    budgetTier: 'Standard',
    colorPalette: ['#EA580C', '#D97706', '#F59E0B', '#FDF2E9'],
    description: 'Earthy terracotta tones, pampas grass clouds, wooden dining tables, and warm bistro string lights beneath open skies.',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    decorIdeas: ['Pampas grass triangle arbor', 'Terracotta pottery with dried florals', 'Woven rattan hanging chandeliers'],
    menuIdeas: ['Wood-fired sourdough flatbreads', 'Charcuterie & artisan cheese grazing table', 'Sparkling elderflower spritz'],
    diyTips: ['Collect and dry local palm fronds and reeds 3 weeks ahead', 'Hand-calligraphed sea glass place cards'],
  },
  {
    title: 'Neon Cyberpunk Galactic Birthday',
    eventType: 'Birthday',
    style: 'Futuristic & Energetic',
    budgetTier: 'Standard',
    colorPalette: ['#EC4899', '#8B5CF6', '#06B6D4', '#0F172A'],
    description: 'Glowing ultraviolet lights, acrylic LED signs, holographic backdrops, and electrifying beats for a high-energy youth birthday.',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    decorIdeas: ['Custom neon LED sign with birthday name', 'Holographic metallic streamer photo wall', 'UV glow stick party favor buckets'],
    menuIdeas: ['Color-changing butterfly pea lemonade mocktails', 'Black charcoal sliders with cheddar', 'Glow-in-the-dark frosted cupcakes'],
    diyTips: ['Install portable blacklight bulbs in ordinary floor lamps', 'Provide neon body paints for guests at entry'],
  },
  {
    title: 'Pastel Carousel & Teddy Bear Picnic',
    eventType: 'Birthday',
    style: 'Sweet & Whimsical',
    budgetTier: 'Low-Budget',
    colorPalette: ['#FBCFE8', '#BAE6FD', '#FEF08A', '#F3F4F6'],
    description: 'Gentle pastel balloons, vintage picnic baskets, floral bunting, and playful storytelling for toddlers and young children.',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    decorIdeas: ['Pastel balloon garland arch', 'Gingham check picnic rugs on grass', 'Vintage wooden toy props'],
    menuIdeas: ['Fruit skewers with honey-yogurt dip', 'Mini crustless sandwich triangles', 'Vanilla confetti cake pops'],
    diyTips: ['Make tissue paper pom-poms from dollar store supplies', 'Borrow wooden picnic baskets from friends and family'],
  },
  {
    title: 'Autumn Harvest Community Feast',
    eventType: 'Community Event',
    style: 'Rustic & Welcoming',
    budgetTier: 'Low-Budget',
    colorPalette: ['#7C2D12', '#B45309', '#047857', '#FBBF24'],
    description: 'Long communal banquet tables, hay bales for seating, acoustic folk tunes, and potluck style comfort food celebrating togetherness.',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    decorIdeas: ['Hay bale seating with plaid woolen throws', 'Mason jar fairy light lanterns', 'Chalkboard signs for community activity stations'],
    menuIdeas: ['Slow-cooked pumpkin soup bowls', 'Freshly pressed apple cider', 'Community baked pie station'],
    diyTips: ['Encourage neighborhood participants to bring potted plants for centerpieces', 'Repurpose wooden shipping pallets for food counters'],
  },
  {
    title: 'Metropolitan Rooftop Sunset Gala',
    eventType: 'Community Event',
    style: 'Modern & Sophisticated',
    budgetTier: 'Luxury',
    colorPalette: ['#312E81', '#4F46E5', '#E0E7FF', '#F8FAFC'],
    description: 'City skyline panoramas, minimalist glass accents, jazz quartet, and passed artisan hors d’oeuvres for charity fundraisers or community awards.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    decorIdeas: ['Glass mirror pedestals with white calla lilies', 'Linear LED uplighting along rooftop perimeter', 'Clear ghost chairs'],
    menuIdeas: ['Tuna tartare on sesame crisps', 'Artisanal champagne mocktails', 'Smoked brie and fig canapés'],
    diyTips: ['Utilize existing venue architectural backdrops rather than renting heavy construction arches'],
  },
];

export const getInspirations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { eventType, budgetTier, style } = req.query;

    // Seed preset inspirations if collection is currently empty
    const count = await Inspiration.countDocuments();
    if (count === 0) {
      await Inspiration.insertMany(
        PRESET_INSPIRATIONS.map((item) => ({
          ...item,
          isPreset: true,
          favoritedBy: [],
        }))
      );
    }

    const query: any = {};
    if (eventType && eventType !== 'All') {
      query.eventType = { $in: [eventType, 'All'] };
    }
    if (budgetTier && budgetTier !== 'All') {
      query.budgetTier = budgetTier;
    }
    if (style && style !== 'All') {
      query.style = style;
    }

    const inspirations = await Inspiration.find(query).sort({ createdAt: -1 });

    const formatted = inspirations.map((item) => {
      const isFav = userId ? item.favoritedBy.some((favId) => favId.toString() === userId) : false;
      return {
        ...item.toObject(),
        isFavorited: isFav,
      };
    });

    res.status(200).json({
      success: true,
      inspirations: formatted,
    });
  } catch (error) {
    console.error('[InspirationController.getInspirations] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inspiration studio items.' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const inspiration = await Inspiration.findById(id);
    if (!inspiration) {
      res.status(404).json({ success: false, message: 'Inspiration item not found.' });
      return;
    }

    const userObjId = new Types.ObjectId(userId);
    const existingIndex = inspiration.favoritedBy.findIndex((fid) => fid.toString() === userId);

    let isFavorited = false;
    if (existingIndex >= 0) {
      inspiration.favoritedBy.splice(existingIndex, 1);
      isFavorited = false;
    } else {
      inspiration.favoritedBy.push(userObjId);
      isFavorited = true;
    }

    await inspiration.save();

    res.status(200).json({
      success: true,
      message: isFavorited ? 'Saved to your favorites!' : 'Removed from favorites.',
      isFavorited,
    });
  } catch (error) {
    console.error('[InspirationController.toggleFavorite] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle favorite.' });
  }
};

export const applyToEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { inspirationId, eventId } = req.body;

    const [inspiration, event] = await Promise.all([
      Inspiration.findById(inspirationId),
      Event.findOne({ _id: eventId, userId }),
    ]);

    if (!inspiration || !event) {
      res.status(404).json({ success: false, message: 'Event or inspiration item not found.' });
      return;
    }

    event.theme = inspiration.title;
    event.preferredColors = inspiration.colorPalette;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Inspiration palette & theme applied to "${event.name}"!`,
      event,
    });
  } catch (error) {
    console.error('[InspirationController.applyToEvent] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to apply inspiration to event.' });
  }
};
