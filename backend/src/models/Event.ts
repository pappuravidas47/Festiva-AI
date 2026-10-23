import mongoose, { Document, Schema, Types } from 'mongoose';

export type EventType =
  | 'Wedding'
  | 'Birthday'
  | 'Community Event'
  | 'Anniversary'
  | 'Graduation'
  | 'Baby Shower'
  | 'Festival'
  | 'Custom Event';

export type IndoorOutdoorPreference = 'Indoor' | 'Outdoor' | 'Hybrid' | 'Flexible';
export type EventStatus = 'Planning' | 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

export interface IEvent extends Document {
  userId: Types.ObjectId;
  name: string;
  eventType: EventType;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  city: string;
  location?: string;
  budget: number;
  currency: string;
  guestCount: number;
  indoorOutdoor: IndoorOutdoorPreference;
  theme?: string;
  preferredColors: string[];
  culturalPreferences?: string;
  dietaryRequirements: string[];
  priorities: string[];
  additionalNotes?: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: 120,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: [
        'Wedding',
        'Birthday',
        'Community Event',
        'Anniversary',
        'Graduation',
        'Baby Shower',
        'Festival',
        'Custom Event',
      ],
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: {
      type: String,
      default: '18:00',
    },
    endTime: {
      type: String,
      default: '23:00',
    },
    city: {
      type: String,
      required: [true, 'City/Location is required'],
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
      default: 50000,
    },
    currency: {
      type: String,
      default: '₹',
    },
    guestCount: {
      type: Number,
      required: [true, 'Expected guest count is required'],
      min: [1, 'Guest count must be at least 1'],
      default: 50,
    },
    indoorOutdoor: {
      type: String,
      enum: ['Indoor', 'Outdoor', 'Hybrid', 'Flexible'],
      default: 'Indoor',
    },
    theme: {
      type: String,
      default: '',
      trim: true,
    },
    preferredColors: {
      type: [String],
      default: ['#6366F1', '#EC4899', '#F59E0B'],
    },
    culturalPreferences: {
      type: String,
      default: '',
    },
    dietaryRequirements: {
      type: [String],
      default: [],
    },
    priorities: {
      type: [String],
      default: ['Venue', 'Catering', 'Photography'],
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Planning', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's events ordered by date
EventSchema.index({ userId: 1, eventDate: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
