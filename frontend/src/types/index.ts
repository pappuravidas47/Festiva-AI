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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
}

export interface EventItem {
  _id: string;
  userId: string;
  name: string;
  eventType: EventType;
  eventDate: string;
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
  createdAt: string;
  updatedAt: string;
  stats?: {
    taskTotal: number;
    taskCompleted: number;
    actualSpent: number;
    plannedBudget: number;
    guestCount: number;
  };
}

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

export interface EventPlan {
  _id: string;
  eventId: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

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

export interface BudgetItem {
  _id: string;
  eventId: string;
  userId: string;
  category: BudgetCategory;
  description: string;
  estimatedCost: number;
  actualCost: number;
  paidStatus: PaymentStatus;
  dueDate?: string;
  vendorId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalBudget: number;
  currency: string;
  totalEstimated: number;
  totalActual: number;
  remainingBudget: number;
  utilizationRate: number;
  isOverBudget: boolean;
  categoryBreakdown: {
    category: string;
    estimated: number;
    actual: number;
    itemCount: number;
    difference: number;
  }[];
  savingsSuggestions: string[];
}

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

export interface TaskItem {
  _id: string;
  eventId: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  assignedTo?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMetrics {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  overdueCount: number;
  upcomingCount: number;
  completionPercentage: number;
}

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

export interface VendorItem {
  _id: string;
  eventId: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export type RsvpStatus = 'Pending' | 'Attending' | 'Not Attending';
export type GuestGroup = 'Family' | 'Friends' | 'Colleagues' | 'VIP' | 'Neighbors' | 'Other';

export interface GuestItem {
  _id: string;
  eventId: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  group: GuestGroup;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietaryRequirements: string[];
  tableNumber?: string;
  invitationSent: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspirationItem {
  _id: string;
  title: string;
  eventType: 'Wedding' | 'Birthday' | 'Community Event' | 'All';
  style: string;
  budgetTier: 'Low-Budget' | 'Standard' | 'Luxury';
  colorPalette: string[];
  description: string;
  imageUrl: string;
  decorIdeas: string[];
  menuIdeas: string[];
  diyTips: string[];
  isPreset: boolean;
  isFavorited?: boolean;
}
