import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../../config/env.js';
import { IEvent } from '../../models/Event.js';
import { IEventPlan } from '../../models/EventPlan.js';
import { buildDemoPlan } from './demoPlanTemplates.js';

let geminiClient: GoogleGenerativeAI | null = null;

const getGeminiClient = (): GoogleGenerativeAI | null => {
  if (ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim() !== '') {
    if (!geminiClient) {
      geminiClient = new GoogleGenerativeAI(ENV.GEMINI_API_KEY.trim());
    }
    return geminiClient;
  }
  return null;
};

export const isGeminiConfigured = (): boolean => {
  return Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim() !== '');
};

const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  // Strip Markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

export const generatePlanWithAI = async (event: IEvent): Promise<{ plan: any; isDemo: boolean }> => {
  const client = getGeminiClient();

  if (!client) {
    console.log('[GeminiService] GEMINI_API_KEY not found. Using curated event plan template.');
    return {
      plan: buildDemoPlan(event),
      isDemo: true,
    };
  }

  const prompt = `
You are Festiva AI, an elite professional celebration planner and master event designer.
Generate a comprehensive, highly personalized event plan in valid JSON format for the following event:

Event Name: "${event.name}"
Event Type: ${event.eventType}
Event Date: ${new Date(event.eventDate).toDateString()}
Start Time: ${event.startTime || '18:00'}
End Time: ${event.endTime || '23:00'}
Location: ${event.city} ${event.location ? '(' + event.location + ')' : ''}
Budget: ${event.currency} ${event.budget}
Expected Guests: ${event.guestCount}
Venue Preference: ${event.indoorOutdoor}
Theme Preference: ${event.theme || 'Open to recommendations'}
Preferred Colors: ${event.preferredColors?.join(', ') || 'Festive curated'}
Cultural Preferences: ${event.culturalPreferences || 'Standard celebration'}
Dietary Requirements: ${event.dietaryRequirements?.join(', ') || 'Mixed'}
Priorities: ${event.priorities?.join(', ') || 'Venue, Catering, Photography'}
Additional Notes: ${event.additionalNotes || 'None'}

Return ONLY a valid JSON object strictly matching this schema with no markdown tags or conversational prefix:
{
  "overview": "Detailed 2-3 sentence summary of the vision and mood",
  "themeConcept": {
    "name": "Creative Theme Name",
    "description": "Theme narrative and aesthetic details",
    "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
    "vibeKeywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4"]
  },
  "venueRecommendations": {
    "type": "Specific recommended venue type",
    "spaceRequirements": "Required square footage / zones",
    "keyFeaturesNeeded": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "layoutTips": "Optimal positioning of stage, dining, bar, photo booth"
  },
  "decorations": {
    "focalPoint": "Main centerpiece or photo backdrop description",
    "lighting": "Lighting setup and ambiance design",
    "tableArrangements": "Table settings and linens",
    "diyIdeas": ["DIY 1", "DIY 2", "DIY 3"]
  },
  "cateringMenu": {
    "welcomeDrinks": ["Drink 1", "Drink 2", "Drink 3"],
    "appetizers": ["App 1", "App 2", "App 3"],
    "mainCourse": ["Main 1", "Main 2", "Main 3", "Main 4"],
    "desserts": ["Dessert 1", "Dessert 2"],
    "specialDietaryOptions": ["Option 1", "Option 2"]
  },
  "budgetBreakdown": {
    "totalEstimatedCost": ${event.budget},
    "currency": "${event.currency}",
    "items": [
      {
        "category": "Venue",
        "item": "Venue Booking & Layout",
        "estimatedCost": ${Math.round(event.budget * 0.35)},
        "percentageOfBudget": 35,
        "notes": "Estimated allowance"
      },
      {
        "category": "Catering",
        "item": "Full Course Catering & Service",
        "estimatedCost": ${Math.round(event.budget * 0.3)},
        "percentageOfBudget": 30,
        "notes": "Food and beverage"
      },
      {
        "category": "Decoration",
        "item": "Theme Décor, Stage & Florals",
        "estimatedCost": ${Math.round(event.budget * 0.15)},
        "percentageOfBudget": 15,
        "notes": "Lighting and props"
      },
      {
        "category": "Photography",
        "item": "Photography & Video Reels",
        "estimatedCost": ${Math.round(event.budget * 0.1)},
        "percentageOfBudget": 10,
        "notes": "Coverage and deliverables"
      },
      {
        "category": "Entertainment",
        "item": "Music / Sound / Host",
        "estimatedCost": ${Math.round(event.budget * 0.05)},
        "percentageOfBudget": 5,
        "notes": "Audio system and entertainer"
      },
      {
        "category": "Contingency",
        "item": "Contingency & Permits",
        "estimatedCost": ${Math.round(event.budget * 0.05)},
        "percentageOfBudget": 5,
        "notes": "Emergency buffer"
      }
    ]
  },
  "vendorChecklist": [
    {
      "role": "Venue Manager",
      "description": "Location contracting and facilities",
      "keyQuestionsToAsk": ["Question 1", "Question 2", "Question 3"],
      "suggestedTimelineToHire": "2-3 months prior"
    },
    {
      "role": "Catering Chef",
      "description": "Menu curation and tasting",
      "keyQuestionsToAsk": ["Question 1", "Question 2"],
      "suggestedTimelineToHire": "6 weeks prior"
    },
    {
      "role": "Decorator & Lighting",
      "description": "Atmosphere and stage setup",
      "keyQuestionsToAsk": ["Question 1", "Question 2"],
      "suggestedTimelineToHire": "1 month prior"
    },
    {
      "role": "Photographer",
      "description": "Capturing timeless memories",
      "keyQuestionsToAsk": ["Question 1", "Question 2"],
      "suggestedTimelineToHire": "6 weeks prior"
    }
  ],
  "preparationTimeline": [
    {
      "timeframe": "6-8 Weeks Prior",
      "title": "Venue & Primary Vendors",
      "description": "Confirm venue contract and reserve photographer",
      "priority": "High"
    },
    {
      "timeframe": "3-4 Weeks Prior",
      "title": "Invitations & Menu Tasting",
      "description": "Send invitations and confirm dinner courses",
      "priority": "Medium"
    },
    {
      "timeframe": "1-2 Weeks Prior",
      "title": "RSVP Lock & Final Fittings",
      "description": "Collate final guest count for caterer",
      "priority": "High"
    },
    {
      "timeframe": "1-2 Days Prior",
      "title": "Final Rehearsal & Vendor Check",
      "description": "Confirm arrival times and audio checks",
      "priority": "Urgent"
    }
  ],
  "dayOfSchedule": [
    {
      "time": "14:00",
      "activity": "Vendor setup and venue walkthrough",
      "personInCharge": "Coordinator / Lead",
      "notes": "Check lighting and power outlets"
    },
    {
      "time": "17:00",
      "activity": "Host arrival and pre-event portrait photos",
      "personInCharge": "Photographer",
      "notes": "Golden hour portraits"
    },
    {
      "time": "18:00",
      "activity": "Guest arrival and welcome refreshments",
      "personInCharge": "Host",
      "notes": "Background music playing"
    },
    {
      "time": "19:30",
      "activity": "Celebration highlight / toast / speeches",
      "personInCharge": "MC / Family",
      "notes": "Main spotlight moment"
    },
    {
      "time": "20:30",
      "activity": "Dinner feast opens and music celebration",
      "personInCharge": "Catering Staff",
      "notes": "Open buffet and dessert bar"
    },
    {
      "time": "22:30",
      "activity": "Farewell and distribution of favors",
      "personInCharge": "Host",
      "notes": "Thank guests for coming"
    }
  ],
  "invitationWording": {
    "formal": "Formal invitation card text",
    "casual": "Warm and friendly invitation message",
    "whatsappShort": "Short, punchy WhatsApp / SMS invitation with emojis"
  },
  "entertainment": ["Idea 1", "Idea 2", "Idea 3"],
  "guestExperience": ["Touchpoint 1", "Touchpoint 2", "Touchpoint 3"],
  "budgetSavingAlternatives": ["Money saver 1", "Money saver 2", "Money saver 3"],
  "premiumUpgrades": ["Luxury upgrade 1", "Luxury upgrade 2", "Luxury upgrade 3"],
  "planningTips": ["Tip 1", "Tip 2", "Tip 3"]
}
`;

  try {
    const model = client.getGenerativeModel({ model: ENV.GEMINI_MODEL || 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleaned);

    return {
      plan: {
        ...parsed,
        isDemoContent: false,
        promptVersion: 'gemini-1.5-flash',
      },
      isDemo: false,
    };
  } catch (error) {
    console.error('[GeminiService] Live generation failed. Falling back to structured demo template:', error);
    return {
      plan: buildDemoPlan(event),
      isDemo: true,
    };
  }
};

export const refinePlanWithAI = async (
  currentPlan: any,
  event: IEvent,
  instruction: string
): Promise<{ plan: any; isDemo: boolean }> => {
  const client = getGeminiClient();

  if (!client) {
    // If no client, simulate intelligent refinement locally
    const updated = JSON.parse(JSON.stringify(currentPlan));
    updated.overview = `${updated.overview} (Refined according to instruction: "${instruction}")`;
    updated.planningTips = [
      `Refinement focus applied: "${instruction}"`,
      ...updated.planningTips,
    ];
    return { plan: updated, isDemo: true };
  }

  const prompt = `
You are Festiva AI. The user has an existing event plan for "${event.name}" (${event.eventType}, budget: ${event.currency}${event.budget}, ${event.guestCount} guests).
User Instruction for Refinement: "${instruction}"

Here is the current plan:
${JSON.stringify(currentPlan, null, 2)}

Apply the requested modifications carefully. Recalculate any budget items if budget changes were requested.
Return the entire updated plan strictly as valid JSON matching the same schema without markdown markers.
`;

  try {
    const model = client.getGenerativeModel({ model: ENV.GEMINI_MODEL || 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const cleaned = cleanJsonResponse(result.response.text());
    const parsed = JSON.parse(cleaned);
    return {
      plan: {
        ...parsed,
        isDemoContent: false,
        promptVersion: 'gemini-refined-v1',
      },
      isDemo: false,
    };
  } catch (error) {
    console.error('[GeminiService] Refinement failed:', error);
    // Return updated locally with error note
    const fallback = JSON.parse(JSON.stringify(currentPlan));
    fallback.overview = `${fallback.overview} [Refinement requested: "${instruction}"]`;
    return { plan: fallback, isDemo: true };
  }
};

export const suggestIdeasWithAI = async (params: {
  eventType: string;
  budget?: number;
  guestCount?: number;
  city?: string;
  theme?: string;
  prompt: string;
}): Promise<{ ideas: any[]; isDemo: boolean }> => {
  const client = getGeminiClient();

  if (!client) {
    return {
      ideas: [
        {
          title: `Curated Concept for ${params.eventType}`,
          concept: `Interactive sensory elements suited for ${params.guestCount || 50} guests.`,
          budgetTier: 'Smart Value',
          colorPalette: ['#4F46E5', '#F59E0B', '#10B981'],
          decorHighlights: ['Custom LED monogram centerpiece', 'Eucalyptus leaf table runners'],
          culinaryHighlights: ['Live artisan mocktail counter', 'Mini dessert sliders'],
          budgetTip: 'Source florals from wholesale morning markets to cut decor costs by 30%.',
        },
        {
          title: 'Royal Heritage & Twilight Radiance',
          concept: 'Atmospheric twilight ambiance with glowing fairy light draping.',
          budgetTier: 'Premium Glamour',
          colorPalette: ['#831843', '#D97706', '#1E1B4B'],
          decorHighlights: ['Chandelier canopy over main stage', 'Mirrored welcome aisle'],
          culinaryHighlights: ['Chef-curated live carving station', 'Flambé dessert show'],
          budgetTip: 'Bundle audio-visual sound systems with the venue rather than hiring third-party.',
        },
      ],
      isDemo: true,
    };
  }

  const promptText = `
You are Festiva AI. Suggest 3 creative, high-impact event concepts for:
Event Type: ${params.eventType}
Budget: ₹${params.budget || 'Flexible'}
Guests: ${params.guestCount || 50}
Location: ${params.city || 'Any'}
User Inquiry: "${params.prompt}"

Return ONLY a JSON array with 3 objects strictly matching:
[
  {
    "title": "Catchy Concept Title",
    "concept": "Detailed description of the vibe and experience",
    "budgetTier": "Budget-Friendly | Smart Value | Premium Luxury",
    "colorPalette": ["#HEX1", "#HEX2", "#HEX3"],
    "decorHighlights": ["Item 1", "Item 2"],
    "culinaryHighlights": ["Item 1", "Item 2"],
    "budgetTip": "Specific money-saving advice"
  }
]
`;

  try {
    const model = client.getGenerativeModel({ model: ENV.GEMINI_MODEL || 'gemini-1.5-flash' });
    const result = await model.generateContent(promptText);
    const cleaned = cleanJsonResponse(result.response.text());
    const ideas = JSON.parse(cleaned);
    return { ideas, isDemo: false };
  } catch (error) {
    console.error('[GeminiService] Suggest ideas error:', error);
    return {
      ideas: [
        {
          title: `Creative Concept for ${params.eventType}`,
          concept: `A celebration focused on intimate guest connections.`,
          budgetTier: 'Smart Value',
          colorPalette: ['#4F46E5', '#EC4899', '#F59E0B'],
          decorHighlights: ['Ambient fairy light curtain', 'Personalized table signs'],
          culinaryHighlights: ['Gourmet tasting platters', 'Signature welcome drink'],
          budgetTip: 'Book vendors 60 days ahead for early-bird discounts.',
        },
      ],
      isDemo: true,
    };
  }
};

export const getQuestionsForVendor = (category: string, eventType: string): string[] => {
  const common = [
    'Are you available on our exact event date and what backup arrangements exist if your lead is unavailable?',
    'What is your cancellation and payment reschedule policy?',
    'What additional fees (taxes, overtime, transport) are not included in your quotation?',
  ];

  switch (category) {
    case 'Venue':
      return [
        'What is the maximum legal guest capacity for our setup?',
        'What are the sound and alcohol permit restrictions and curfew hours?',
        'Is dedicated power generator backup included for lights and DJ?',
        'Do we have access the night or morning before for decor setup?',
        ...common,
      ];
    case 'Caterer':
      return [
        'Can we schedule a complimentary tasting session for 2-3 people?',
        'What is your staff-to-guest ratio during peak dinner buffet hours?',
        'How do you handle dietary restrictions (Jain, vegan, gluten-free)?',
        'Do you provide crockery, cutlery, table linens, and cleanup staff?',
        ...common,
      ];
    case 'Decorator':
      return [
        'Can you provide a 3D sketch or moodboard of the stage and entrance?',
        'Are flowers fresh seasonal blooms or artificial/hybrid silk?',
        'What is your team’s setup timeline and dismantle timeline?',
        'Are hanging ceiling lights and trussing supported by the venue ceilings?',
        ...common,
      ];
    case 'Photographer':
      return [
        'How many photographers/videographers will be on site?',
        'What is the exact turnaround time for teaser highlights vs full edited album?',
        'Do you provide raw footage and vertical reels formatted for social media?',
        'What equipment and drone cameras will be used?',
        ...common,
      ];
    default:
      return [
        `What specific experience do you have with ${eventType} events?`,
        'What setup requirements or electricity connections do you need from the venue?',
        ...common,
      ];
  }
};
