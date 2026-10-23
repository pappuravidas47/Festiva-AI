import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskCategory =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Invitations'
  | 'Vendors'
  | 'Entertainment'
  | 'Final Preparation';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ITask extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  assignedTo?: string;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
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
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: [
        'Venue',
        'Catering',
        'Decoration',
        'Invitations',
        'Vendors',
        'Entertainment',
        'Final Preparation',
      ],
      default: 'Final Preparation',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    assignedTo: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ eventId: 1, dueDate: 1 });
TaskSchema.index({ eventId: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
