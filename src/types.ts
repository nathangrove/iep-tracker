export interface AssessmentResult {
  date: string;
  result: 'pass' | 'fail';
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
}

export interface Student {
  studentId: string;
  studentName: string;
  goals: Goal[];
}
