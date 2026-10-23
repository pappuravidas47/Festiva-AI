import mongoose, { Document, Schema, Types } from 'mongoose';

export type RsvpStatus = 'Pending' | 'Attending' | 'Not Attending';
export type GuestGroup = 'Family' | 'Friends' | 'Colleagues' | 'VIP' | 'Neighbors' | 'Other';

export interface IGuest extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  group: GuestGroup;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietaryRequirements: string[];
  tableNumber?: string;
  invitationSent: boolean;
  invitationSentAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuestSchema = new Schema<IGuest>(
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
    name: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    group: {
      type: String,
      enum: ['Family', 'Friends', 'Colleagues', 'VIP', 'Neighbors', 'Other'],
      default: 'Friends',
    },
    rsvpStatus: {
      type: String,
      enum: ['Pending', 'Attending', 'Not Attending'],
      default: 'Pending',
    },
    plusOnes: {
      type: Number,
      min: 0,
      default: 0,
    },
    dietaryRequirements: {
      type: [String],
      default: [],
    },
    tableNumber: {
      type: String,
      default: '',
    },
    invitationSent: {
      type: Boolean,
      default: false,
    },
    invitationSentAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

GuestSchema.index({ eventId: 1, rsvpStatus: 1 });

export const Guest = mongoose.model<IGuest>('Guest', GuestSchema);
