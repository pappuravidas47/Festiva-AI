import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBudgetItemEstimate {
  category: string;
  item: string;
  estimatedCost: number;
  percentageOfBudget: number;
  notes?: string;
}

export interface IVendorItemChecklist {
  role: string;
  description: string;
  keyQuestionsToAsk: string[];
  suggestedTimelineToHire: string;
}

export interface ITimelineMilestone {
  timeframe: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface IDayOfScheduleItem {
  time: string;
  activity: string;
  personInCharge?: string;
  notes?: string;
}

export interface IEventPlan extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  overview: string;
  themeConcept: {
    name: string;
    description: string;
    colorPalette: string[];
    vibeKeywords: string[];
  };
  venueRecommendations: {
    type: string;
    spaceRequirements: string;
    keyFeaturesNeeded: string[];
    layoutTips: string;
  };
  decorations: {
    focalPoint: string;
    lighting: string;
    tableArrangements: string;
    diyIdeas: string[];
  };
  cateringMenu: {
    welcomeDrinks: string[];
    appetizers: string[];
    mainCourse: string[];
    desserts: string[];
    specialDietaryOptions: string[];
  };
  budgetBreakdown: {
    totalEstimatedCost: number;
    currency: string;
    items: IBudgetItemEstimate[];
  };
  vendorChecklist: IVendorItemChecklist[];
  preparationTimeline: ITimelineMilestone[];
  dayOfSchedule: IDayOfScheduleItem[];
  invitationWording: {
    formal: string;
    casual: string;
    whatsappShort: string;
  };
  entertainment: string[];
  guestExperience: string[];
  budgetSavingAlternatives: string[];
  premiumUpgrades: string[];
  planningTips: string[];
  isDemoContent: boolean;
  promptVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventPlanSchema = new Schema<IEventPlan>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overview: {
      type: String,
      required: true,
    },
    themeConcept: {
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      colorPalette: { type: [String], default: [] },
      vibeKeywords: { type: [String], default: [] },
    },
    venueRecommendations: {
      type: { type: String, default: '' },
      spaceRequirements: { type: String, default: '' },
      keyFeaturesNeeded: { type: [String], default: [] },
      layoutTips: { type: String, default: '' },
    },
    decorations: {
      focalPoint: { type: String, default: '' },
      lighting: { type: String, default: '' },
      tableArrangements: { type: String, default: '' },
      diyIdeas: { type: [String], default: [] },
    },
    cateringMenu: {
      welcomeDrinks: { type: [String], default: [] },
      appetizers: { type: [String], default: [] },
      mainCourse: { type: [String], default: [] },
      desserts: { type: [String], default: [] },
      specialDietaryOptions: { type: [String], default: [] },
    },
    budgetBreakdown: {
      totalEstimatedCost: { type: Number, default: 0 },
      currency: { type: String, default: '₹' },
      items: [
        {
          category: { type: String, required: true },
          item: { type: String, required: true },
          estimatedCost: { type: Number, required: true },
          percentageOfBudget: { type: Number, default: 0 },
          notes: { type: String, default: '' },
        },
      ],
    },
    vendorChecklist: [
      {
        role: { type: String, required: true },
        description: { type: String, default: '' },
        keyQuestionsToAsk: { type: [String], default: [] },
        suggestedTimelineToHire: { type: String, default: '' },
      },
    ],
    preparationTimeline: [
      {
        timeframe: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High', 'Urgent'],
          default: 'Medium',
        },
      },
    ],
    dayOfSchedule: [
      {
        time: { type: String, required: true },
        activity: { type: String, required: true },
        personInCharge: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],
    invitationWording: {
      formal: { type: String, default: '' },
      casual: { type: String, default: '' },
      whatsappShort: { type: String, default: '' },
    },
    entertainment: { type: [String], default: [] },
    guestExperience: { type: [String], default: [] },
    budgetSavingAlternatives: { type: [String], default: [] },
    premiumUpgrades: { type: [String], default: [] },
    planningTips: { type: [String], default: [] },
    isDemoContent: { type: Boolean, default: false },
    promptVersion: { type: String, default: 'v1' },
  },
  {
    timestamps: true,
  }
);

// One active plan per event
EventPlanSchema.index({ eventId: 1, createdAt: -1 });

export const EventPlan = mongoose.model<IEventPlan>('EventPlan', EventPlanSchema);
