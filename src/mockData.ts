import { Student } from './types';

export const mockStudents: Student[] = [
  {
    studentId: '1',
    studentName: 'Doe, John',
    goals: [
      {
        goalId: '1',
        title: 'Improve Reading Comprehension',
        description: 'Assess reading comprehension skills at grade level',
        startDate: '2025-08-01',
        endDate: '2026-07-31',
        frequency: 'weekly',
        assessmentResults: [
          { date: '2025-08-15', result: 'pass' },
          { date: '2025-08-15', result: 'fail' },
          { date: '2025-08-15', result: 'pass' },
          { date: '2025-08-22', result: 'fail' },
          { date: '2025-08-22', result: 'pass' },
          { date: '2025-08-29', result: 'pass' },
          { date: '2025-08-29', result: 'pass' },
          { date: '2025-08-29', result: 'fail' },
          { date: '2025-08-30', result: 'pass' }
        ]
      },
      {
        goalId: '2',
        title: 'Math Problem Solving',
        description: 'Solve multi-step math problems independently',
        startDate: '2025-08-01',
        endDate: '2026-07-31',
        frequency: 'biweekly',
        assessmentResults: [
          { date: '2025-08-16', result: 'fail' },
          { date: '2025-08-16', result: 'fail' },
          { date: '2025-08-23', result: 'pass' },
          { date: '2025-08-23', result: 'pass' },
          { date: '2025-08-23', result: 'fail' },
          { date: '2025-08-30', result: 'pass' },
          { date: '2025-08-30', result: 'pass' }
        ]
      }
    ]
  },
  {
    studentId: '2',
    studentName: 'Smith, Jane',
    goals: [
      {
        goalId: '3',
        title: 'Social Communication',
        description: 'Initiate conversations with peers during structured activities',
        startDate: '2025-08-15',
        endDate: '2026-08-14',
        frequency: 'daily',
        assessmentResults: [
          { date: '2025-08-14', result: 'pass' },
          { date: '2025-08-14', result: 'pass' },
          { date: '2025-08-21', result: 'pass' },
          { date: '2025-08-21', result: 'fail' },
          { date: '2025-08-21', result: 'pass' },
          { date: '2025-08-28', result: 'fail' },
          { date: '2025-08-28', result: 'fail' },
          { date: '2025-08-29', result: 'pass' }
        ]
      },
      {
        goalId: '4',
        title: 'Fine Motor Skills',
        description: 'Write legibly using proper letter formation',
        startDate: '2025-08-10',
        endDate: '2026-08-09',
        frequency: 'weekly',
        assessmentResults: [
          { date: '2025-08-17', result: 'fail' },
          { date: '2025-08-17', result: 'pass' },
          { date: '2025-08-24', result: 'pass' },
          { date: '2025-08-24', result: 'pass' },
          { date: '2025-08-30', result: 'fail' },
          { date: '2025-08-30', result: 'pass' },
          { date: '2025-08-30', result: 'pass' }
        ]
      }
    ]
  },
  {
    studentId: '3',
    studentName: 'Johnson, Alex',
    goals: [
      {
        goalId: '5',
        title: 'Attention and Focus',
        description: 'Maintain attention during 15-minute instructional periods',
        startDate: '2025-08-05',
        endDate: '2026-08-04',
        frequency: 'monthly',
        assessmentResults: [
          { date: '2025-08-20', result: 'pass' },
          { date: '2025-08-27', result: 'pass' }
        ]
      }
    ]
  }
];
