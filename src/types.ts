export interface AssessmentResult {
  date: string;
  result: 'pass' | 'fail';
}

export interface GoalNote {
  noteId: string;
  date: string; // YYYY-MM-DD format
  note: string;
}

export interface Goal {
  goalId: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom';
  customFrequencyDays?: number; // For custom frequency, number of days between assessments
  assessmentResults: AssessmentResult[];
  notes?: GoalNote[]; // Optional for backward compatibility
}

export interface Student {
  studentId: string;
  studentName: string;
  goals: Goal[];
}
