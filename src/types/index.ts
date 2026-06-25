// User & Authentication Types
export type UserRole = 'admin' | 'manager' | 'developer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Project Types
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  progress: number;
  managerId: string;
  teamMembers: string[];
  budget: number;
  createdAt: string;
  updatedAt: string;
}

// Task Types
export type TaskStatus = 'created' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  reporterId: string;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Approval Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalType = 'leave' | 'expense' | 'resource' | 'project';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requesterId: string;
  currentApproverId: string;
  status: ApprovalStatus;
  level: number;
  maxLevel: number;
  comments: ApprovalComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  comment: string;
  action: 'approved' | 'rejected' | 'comment';
  createdAt: string;
}

// Analytics Types
export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  unit?: string;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

// Common Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}

// Team Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  utilization: number;
  activeTasks: number;
  completedTasks: number;
  status: 'active' | 'away' | 'offline';
}

// Activity & Notification Types
export type ActivityType =
  | 'task_completed'
  | 'task_created'
  | 'task_updated'
  | 'project_created'
  | 'project_updated'
  | 'approval_pending'
  | 'approval_approved'
  | 'approval_rejected'
  | 'deadline_warning'
  | 'team_update';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
  link?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'approval' | 'task' | 'project' | 'general';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface UserPreferences {
  notifications: {
    email_tasks: boolean;
    email_approvals: boolean;
    email_deadlines: boolean;
    email_mentions: boolean;
    email_digest: boolean;
  };
  appearance: {
    compactMode: boolean;
    reduceAnimations: boolean;
    highContrast: boolean;
  };
}

export const defaultUserPreferences: UserPreferences = {
  notifications: {
    email_tasks: true,
    email_approvals: true,
    email_deadlines: true,
    email_mentions: true,
    email_digest: false,
  },
  appearance: {
    compactMode: false,
    reduceAnimations: false,
    highContrast: false,
  },
};
