
export type Role = 'GUEST' | 'COMPANY' | 'EMPLOYEE' | 'AUTH_FLOW';
export type View = 'DASHBOARD' | 'EMPLOYEES' | 'IP_MANAGEMENT' | 'LICENSES' | 'CERTIFICATES' | 'SETTINGS';
export type AuthMode = 'LOGIN' | 'REGISTER_COMPANY' | 'JOIN_COMPANY';

export interface Company {
  id: string;
  name: string;
  vatId: string;
  inviteToken: string;
  plan: 'FREE' | 'PREMIUM';
}

export interface Employee {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  email: string;
  joined: string;
  role: 'ADMIN' | 'EMPLOYEE';
  courses: string[];
  documents: AssignedDocument[];
}

export interface AssignedDocument {
  id: string;
  title: string;
  status: 'SIGNED' | 'PENDING';
  date: string;
}

export interface License {
  id: string;
  name: string;
  total: number;
  used: number;
  status: 'ok' | 'low' | 'zero';
}

// Fix: Added QuizQuestion interface for training content
export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  points: number;
}

// Fix: Added TrainingModule interface for training structure
export interface TrainingModule {
  id: string;
  training_id: string;
  title: string;
  content: string;
  video_url?: string;
  quiz_questions?: QuizQuestion[];
  order_index: number;
  module_type: 'text' | 'video' | 'quiz' | 'interactive';
  duration_minutes: number;
  is_mandatory: boolean;
}

// Fix: Added Training interface for the core education entity
export interface Training {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_hours: number;
  difficulty_level: string;
  category: string;
  learning_objectives: string[];
  status: string;
  created_at: string;
  updated_at?: string;
  is_purchasable?: boolean;
}

// Fix: Added EmployeeTraining interface for tracking user progress
export interface EmployeeTraining {
  id: string;
  employee_id: string;
  training_id: string;
  assigned_at: string;
  due_date: string;
  status: 'assigned' | 'in_progress' | 'completed';
  progress_percentage: number;
  completed_at?: string;
  training?: Training;
}
