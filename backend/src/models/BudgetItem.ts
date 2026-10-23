import mongoose, { Document, Schema, Types } from 'mongoose';

export type BudgetCategory =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Photography'
  | 'Entertainment'
  | 'Invitations'
  | 'Transportation'
  | 'Gifts'
  | 'Miscellaneous'
  | 'Contingency';

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid';

export interface IBudgetItem extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  category: BudgetCategory;
  description: string;
  estimatedCost: number;
  actualCost: number;
  paidStatus: PaymentStatus;
  dueDate?: Date;
  vendorId?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetItemSchema = new Schema<IBudgetItem>(
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Venue',
        'Catering',
        'Decoration',
        'Photography',
        'Entertainment',
        'Invitations',
        'Transportation',
        'Gifts',
        'Miscellaneous',
        'Contingency',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    estimatedCost: {
      type: Number,
      required: [true, 'Estimated cost is required'],
      min: [0, 'Cost cannot be negative'],
      default: 0,
    },
    actualCost: {
      type: Number,
      min: [0, 'Actual cost cannot be negative'],
      default: 0,
    },
    paidStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid'],
      default: 'Unpaid',
    },
    dueDate: {
      type: Date,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
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

BudgetItemSchema.index({ eventId: 1, category: 1 });

export const BudgetItem = mongoose.model<IBudgetItem>('BudgetItem', BudgetItemSchema);
