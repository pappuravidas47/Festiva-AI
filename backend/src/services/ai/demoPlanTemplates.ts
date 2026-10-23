import { IEvent } from '../../models/Event.js';

export const buildDemoPlan = (event: IEvent) => {
  const currency = event.currency || '₹';
  const budget = event.budget || 50000;
  const guestCount = event.guestCount || 50;
  const city = event.city || 'Local Area';
  const eventType = event.eventType || 'Celebration';

  // Calculate estimated budget breakdown percentages
  const venueCost = Math.round(budget * 0.35);
  const cateringCost = Math.round(budget * 0.3);
  const decorCost = Math.round(budget * 0.15);
  const photoCost = Math.round(budget * 0.1);
  const entertainmentCost = Math.round(budget * 0.05);
  const miscCost = budget - (venueCost + cateringCost + decorCost + photoCost + entertainmentCost);

  let themeName = event.theme || `${eventType} Elegance`;
  let vibeKeywords = ['Memorable', 'Sophisticated', 'Joyous', 'Seamless'];

  if (eventType === 'Wedding') {
    themeName = event.theme || 'Royal Blossom & Golden Hour';
    vibeKeywords = ['Romantic', 'Traditional-Modern Fusion', 'Opulent', 'Heartfelt'];
  } else if (eventType === 'Birthday') {
    themeName = event.theme || 'Vibrant Neon Carnival & Glamour';
    vibeKeywords = ['Energetic', 'Fun', 'Instagrammable', 'Lively'];
  } else if (eventType === 'Community Event') {
    themeName = event.theme || 'Unity & Cultural Harmony';
    vibeKeywords = ['Inclusive', 'Festive', 'Community-driven', 'Warm'];
  }

  return {
    overview: `A bespoke, curated celebration concept for "${event.name}" in ${city}. Designed specifically for ${guestCount} guests with an optimal budget allocation of ${currency}${budget.toLocaleString('en-IN')}, balancing aesthetic grandeur with cost efficiency. (Note: This is a structured demo template. Configure GEMINI_API_KEY in backend/.env for live real-time Gemini AI generation).`,
    themeConcept: {
      name: themeName,
      description: `A harmonious aesthetic blending ${event.indoorOutdoor.toLowerCase()} spaces with warm ambient highlights, styled around ${event.preferredColors?.join(', ') || 'crimson and gold'}.`,
      colorPalette: event.preferredColors?.length ? event.preferredColors : ['#4F46E5', '#9333EA', '#F59E0B', '#10B981'],
      vibeKeywords,
    },
    venueRecommendations: {
      type: event.indoorOutdoor === 'Outdoor' ? 'Lawn or Open-Air Courtyard' : 'Banquet Hall / Boutique Heritage Space',
      spaceRequirements: `Minimum 2,500 - 3,500 sq.ft capacity comfortably accommodating ${guestCount} seated guests with dedicated food stalls and stage.`,
      keyFeaturesNeeded: [
        'Climate control / sheltered rain backup area',
        'Ample guest parking with valet assistance',
        'Dedicated green room / bride-groom preparation suite',
        'In-house acoustic and generator backup power',
      ],
      layoutTips: 'Position the focal photo stage opposite the main entrance with food stations along perimeter to ensure fluid guest circulation.',
    },
    decorations: {
      focalPoint: `Grand floral/lighting arch with custom monogram for "${event.name}" backdrop.`,
      lighting: 'Fairy light ceiling canopy, warm amber uplighting on trees/pillars, and glowing candle centerpieces.',
      tableArrangements: 'Round tables with satin runners, personalized botanical menu cards, and petite floral bouquets.',
      diyIdeas: [
        'Handmade Polaroid memory wall where guests clip instant photos with handwritten notes.',
        'Custom chalkboard welcome easel decorated with fresh eucalyptus foliage.',
        'Mason jar warm fairy light luminaries lining the walkway.',
      ],
    },
    cateringMenu: {
      welcomeDrinks: ['Spiced Cranberry Mocktail', 'Fresh Mint Mojito', 'Traditional Saffron Badam Milk'],
      appetizers: ['Paneer Tikka Skewers with Mint Chutney', 'Crispy Corn & Water Chestnut Cones', 'Chicken Seekh Kebabs / Falafel Bites'],
      mainCourse: ['Paneer Butter Masala', 'Slow-cooked Dal Makhani', 'Dum Biryani with Burani Raita', 'Assorted Artisan Kulchas & Naans'],
      desserts: ['Warm Gulab Jamun with Rabri', 'Classic Sizzling Brownie with Vanilla Bean Gelato', 'Kulfi Falooda Shots'],
      specialDietaryOptions: [
        'Dedicated Jain vegetarian counters without root vegetables',
        'Gluten-free grain bowls and vegan desserts clearly marked',
      ],
    },
    budgetBreakdown: {
      totalEstimatedCost: budget,
      currency,
      items: [
        {
          category: 'Venue',
          item: 'Venue Rental & Basic Infrastructure',
          estimatedCost: venueCost,
          percentageOfBudget: 35,
          notes: 'Estimated benchmark based on average tier in ' + city,
        },
        {
          category: 'Catering',
          item: `Food & Beverage Buffet for ${guestCount} Guests`,
          estimatedCost: cateringCost,
          percentageOfBudget: 30,
          notes: `Estimated at approx ${currency}${Math.round(cateringCost / guestCount)}/plate`,
        },
        {
          category: 'Decoration',
          item: 'Stage Backdrop, Table Décor & Entrance Gate',
          estimatedCost: decorCost,
          percentageOfBudget: 15,
          notes: 'Includes lighting and seasonal floral highlights',
        },
        {
          category: 'Photography',
          item: 'Candid Photographer & Highlight Video Reel',
          estimatedCost: photoCost,
          percentageOfBudget: 10,
          notes: 'Full event coverage with 150+ edited high-res photos',
        },
        {
          category: 'Entertainment',
          item: 'DJ / Acoustic Live Music & Sound System',
          estimatedCost: entertainmentCost,
          percentageOfBudget: 5,
          notes: '4-hour setup with wireless microphones and DJ console',
        },
        {
          category: 'Contingency',
          item: 'Contingency & Unforeseen Expenses',
          estimatedCost: miscCost,
          percentageOfBudget: 5,
          notes: 'Recommended emergency buffer for last-minute needs',
        },
      ],
    },
    vendorChecklist: [
      {
        role: 'Venue Coordinator',
        description: 'Secures booking contract, sound license, and setup timings.',
        keyQuestionsToAsk: [
          'What is the sound curfew limit for outdoor speakers?',
          'Are outside caterers or decorators permitted without surcharge?',
          'What is the electricity backup capacity during power cuts?',
        ],
        suggestedTimelineToHire: '3 - 6 months prior to event',
      },
      {
        role: 'Caterer & Mixologist',
        description: 'Provides food tasting session, service staff, and cutlery.',
        keyQuestionsToAsk: [
          'Can we arrange a food tasting session before finalizing the contract?',
          'What is your staff-to-guest ratio during peak dining hours?',
          'How do you manage leftover food hygiene and disposal?',
        ],
        suggestedTimelineToHire: '2 - 3 months prior to event',
      },
      {
        role: 'Decorator / Florist',
        description: 'Brings theme concept to life with photobooth and lighting.',
        keyQuestionsToAsk: [
          'Are the flowers fresh or faux-silk hybrid?',
          'What time will your team begin onsite assembly?',
          'Is dismantling included in the quoted fee?',
        ],
        suggestedTimelineToHire: '1 - 2 months prior to event',
      },
      {
        role: 'Photographer / Videographer',
        description: 'Captures candid emotions, group portraits, and event reels.',
        keyQuestionsToAsk: [
          'How many photographers will be present on the day?',
          'What is the turnaround timeline for receiving digital deliverables?',
          'Do you provide 30-second vertical social media reels?',
        ],
        suggestedTimelineToHire: '2 months prior to event',
      },
    ],
    preparationTimeline: [
      {
        timeframe: '8 Weeks Prior',
        title: 'Lock Venue & Send Save The Dates',
        description: 'Finalize contracts, make advance deposit, and alert VIP guests.',
        priority: 'Urgent' as const,
      },
      {
        timeframe: '4 Weeks Prior',
        title: 'Menu Tasting & Theme Finalization',
        description: 'Sample appetizers and confirm color swatches with decorator.',
        priority: 'High' as const,
      },
      {
        timeframe: '2 Weeks Prior',
        title: 'Finalize RSVP Headcount & Playlist',
        description: 'Collate final guest numbers for caterer and curate song selections.',
        priority: 'Medium' as const,
      },
      {
        timeframe: '1 Week Prior',
        title: 'Vendor Run-Through & Wardrobe Check',
        description: 'Reconfirm delivery schedules and ensure outfits/accessories are ready.',
        priority: 'High' as const,
      },
      {
        timeframe: '1 Day Prior',
        title: 'On-site Rehearsal & Payment Envelopes',
        description: 'Walk through the venue, test audiovisual mics, prepare vendor tips.',
        priority: 'Urgent' as const,
      },
    ],
    dayOfSchedule: [
      {
        time: '14:00',
        activity: 'Decorator & Sound Setup begins at venue',
        personInCharge: 'Lead Decorator',
        notes: 'Check stage lighting and microphone audio levels',
      },
      {
        time: '17:00',
        activity: 'Hosts and family arrive for early portraits',
        personInCharge: 'Lead Photographer',
        notes: 'Take golden hour portraits before guests arrive',
      },
      {
        time: '18:00',
        activity: 'Guest Arrival & Welcome Cocktails',
        personInCharge: 'Hospitality Team',
        notes: 'Lobby music playing, welcome drinks and passed canapés',
      },
      {
        time: '19:30',
        activity: 'Main Ceremony / Welcome Toast & Speeches',
        personInCharge: 'Master of Ceremonies',
        notes: 'Dim lights for spotlight spotlight and cake cutting or stage toast',
      },
      {
        time: '20:30',
        activity: 'Dinner Buffet Opens & Dance Floor Unleashed',
        personInCharge: 'Catering Captain & DJ',
        notes: 'Open buffet stations smoothly without queue bottlenecks',
      },
      {
        time: '22:30',
        activity: 'Farewell Favors & Closing Warm Sendoff',
        personInCharge: 'Event Host',
        notes: 'Distribute personalized thank-you gifts to departing guests',
      },
    ],
    invitationWording: {
      formal: `Together with their families, you are cordially invited to celebrate the joyful occasion of "${event.name}" on ${new Date(event.eventDate).toLocaleDateString('en-IN', { dateStyle: 'full' })} at ${event.city}. Your esteemed presence will make our joy complete.`,
      casual: `Join us as we raise a toast to good times and unforgettable memories! We are celebrating "${event.name}" and can't imagine this milestone without you. Save the date: ${new Date(event.eventDate).toLocaleDateString('en-IN')}.`,
      whatsappShort: `✨ You're Invited! Join us for *${event.name}* on ${new Date(event.eventDate).toLocaleDateString('en-IN')} in ${event.city}! RSVP at your earliest. Can't wait to celebrate together! 🥂🎉`,
    },
    entertainment: [
      'Interactive Live Acoustic Duo during dinner hour',
      'High-energy Bollywood & Retro DJ set for post-dinner dancing',
      '360-degree slow motion video photobooth with instant phone download',
    ],
    guestExperience: [
      'Personalized welcome drink tag with each guest’s name',
      'Custom artisan fragrance favors (scented soy candles)',
      'Digital QR code at each table to upload guest selfies directly to a shared live gallery',
    ],
    budgetSavingAlternatives: [
      'Opt for seasonal local blooms over imported orchids to save up to 40% on floral costs.',
      'Serve signature mocktails and wine instead of a fully stocked open spirits bar.',
      'Utilize digital invitations with video animations rather than heavy foil-embossed paper prints.',
    ],
    premiumUpgrades: [
      'Cold pyro sparkler machines and dry-ice fog effect during grand entry or cake cutting.',
      'Live gourmet dessert bar featuring custom nitrogen ice cream or artisanal crêpes.',
      'Drone aerial cinematography for dramatic group and venue wide-angle shots.',
    ],
    planningTips: [
      'Always keep a 5-10% contingency fund untouched until 48 hours before the event.',
      'Nominate one trusted friend or coordinator as point-of-contact for vendors on the day of the event so the host remains stress-free.',
      'Reconfirm dietary preferences 5 days ahead to avoid wasted catering costs.',
    ],
    isDemoContent: true,
    promptVersion: 'demo-template-v1',
  };
};
