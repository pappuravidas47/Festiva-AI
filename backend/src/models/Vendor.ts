import mongoose, { Document, Schema, Types } from 'mongoose';

export type VendorCategory =
  | 'Venue'
  | 'Caterer'
  | 'Decorator'
  | 'Photographer'
  | 'Entertainment'
  | 'Transport'
  | 'Other';

export type BookingStatus =
  | 'To Contact'
  | 'Contacted'
  | 'Quotation Received'
  | 'Shortlisted'
  | 'Booked'
  | 'Cancelled';

export interface IVendor extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  category: VendorCategory;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  quotedPrice: number;
  finalPrice?: number;
  bookingStatus: BookingStatus;
  aiQuestions: string[];
  rating?: number;
  notes?: string;
  contractUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
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
      required: [true, 'Vendor name is required'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: [true, 'Vendor category is required'],
      enum: [
        'Venue',
        'Caterer',
        'Decorator',
        'Photographer',
        'Entertainment',
        'Transport',
        'Other',
      ],
    },
    contactName: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: '',
    },
    quotedPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    finalPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    bookingStatus: {
      type: String,
      enum: [
        'To Contact',
        'Contacted',
        'Quotation Received',
        'Shortlisted',
        'Booked',
        'Cancelled',
      ],
      default: 'To Contact',
    },
    aiQuestions: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: '',
    },
    contractUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

VendorSchema.index({ eventId: 1, category: 1 });

export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
