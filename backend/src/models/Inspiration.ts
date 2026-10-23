import mongoose, { Document, Schema, Types } from 'mongoose';

export type InspirationEventType = 'Wedding' | 'Birthday' | 'Community Event' | 'All';
export type InspirationBudgetTier = 'Low-Budget' | 'Standard' | 'Luxury';

export interface IInspiration extends Document {
  title: string;
  eventType: InspirationEventType;
  style: string;
  budgetTier: InspirationBudgetTier;
  colorPalette: string[];
  description: string;
  imageUrl: string;
  decorIdeas: string[];
  menuIdeas: string[];
  diyTips: string[];
  isPreset: boolean;
  userId?: Types.ObjectId;
  favoritedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const InspirationSchema = new Schema<IInspiration>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['Wedding', 'Birthday', 'Community Event', 'All'],
      default: 'All',
      index: true,
    },
    style: {
      type: String,
      required: true,
      trim: true,
    },
    budgetTier: {
      type: String,
      enum: ['Low-Budget', 'Standard', 'Luxury'],
      default: 'Standard',
      index: true,
    },
    colorPalette: {
      type: [String],
      default: ['#4F46E5', '#9333EA', '#F43F5E'],
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    decorIdeas: {
      type: [String],
      default: [],
    },
    menuIdeas: {
      type: [String],
      default: [],
    },
    diyTips: {
      type: [String],
      default: [],
    },
    isPreset: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    favoritedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

InspirationSchema.index({ eventType: 1, budgetTier: 1 });

export const Inspiration = mongoose.model<IInspiration>('Inspiration', InspirationSchema);
