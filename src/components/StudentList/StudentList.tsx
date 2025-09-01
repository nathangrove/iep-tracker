import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import {
  Person,
  Assignment,
  CheckCircle,
  Cancel,
  Edit,
  Assessment,
  Add,
  Print
} from '@mui/icons-material';
import { Student } from '../../types';
import { getDaysSince } from '../../utils/dateUtils';
import AddStudentDialog from './AddStudentDialog';
import AllStudentsReport from '../StudentReport/AllStudentsReport';

interface StudentListProps {
  students: Student[];
  onStudentSelect: (student: Student) => void;
  onAddStudent: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onStudentSelect, onAddStudent }) => {
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);

  const handlePrintAllReports = () => {
    setShowAllReports(true);
    // Use setTimeout to allow the component to render before printing
    setTimeout(() => {
      window.print();
      setShowAllReports(false);
    }, 100);
  };

  const getRecentAssessmentStatus = (student: Student) => {
    let totalPasses = 0;
    let totalAssessments = 0;

    student.goals.forEach(goal => {
      totalAssessments += goal.assessmentResults.length;
      totalPasses += goal.assessmentResults.filter(result => result.result === 'pass').length;
    });

    return { totalPasses, totalAssessments };
  };

  const getFrequencyInDays = (frequency: string, customDays?: number) => {
    switch (frequency) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'biweekly': return 14;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'custom': return customDays || 7;
      default: return 7;
    }
  };

  const getLastAssessment = (goal: any) => {
    if (goal.assessmentResults.length === 0) {
      return null;
    }
    
    const sortedResults = [...goal.assessmentResults].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedResults[0];
  };

  const getStudentAssessmentStatus = (student: Student) => {
    let dueToday = 0;
    let overdue = 0;

    student.goals.forEach(goal => {
      const lastAssessment = getLastAssessment(goal);
      
      if (!lastAssessment) {
        overdue++;
        return;
      }

      const lastAssessmentDate = new Date(lastAssessment.date);
      const frequencyDays = getFrequencyInDays(goal.frequency, goal.customFrequencyDays);
      
      // Only exclude weekends for daily assessments
      const excludeWeekends = goal.frequency === 'daily';
      const daysSinceLastAssessment = getDaysSince(lastAssessmentDate, excludeWeekends);
      
      if (daysSinceLastAssessment === frequencyDays) {
        dueToday++;
      } else if (daysSinceLastAssessment > frequencyDays) {
        overdue++;
      }
    });

    return { dueToday, overdue };
  };

  // Sort students alphabetically by last name
  const sortedStudents = [...students].sort((a, b) => {
    const lastNameA = a.studentName.split(',')[0].trim();
    const lastNameB = b.studentName.split(',')[0].trim();
    return lastNameA.localeCompare(lastNameB);
  });

  // Show all reports view when printing
  if (showAllReports) {
    return <AllStudentsReport students={sortedStudents} />;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
          Student List ({sortedStudents.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {students.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrintAllReports}
              size="large"
            >
              Print All Reports
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddStudentDialogOpen(true)}
            size="large"
          >
            Add Student
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        {sortedStudents.map((student) => {
          const { totalPasses, totalAssessments } = getRecentAssessmentStatus(student);
          const successRate = totalAssessments > 0 ? (totalPasses / totalAssessments * 100).toFixed(0) : 0;
          const { dueToday, overdue } = getStudentAssessmentStatus(student);
          
          return (
            <Box key={student.studentId}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => onStudentSelect(student)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h2" fontWeight="bold">
                      {student.studentName}
                    </Typography>
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <Assignment sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
                      {student.goals.length} Goal{student.goals.length !== 1 ? 's' : ''}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <Assessment sx={{ verticalAlign: 'middle', mr: 1, fontSize: 16 }} />
                      {totalAssessments} Total Assessment{totalAssessments !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    {dueToday > 0 && (
                      <Chip
                        icon={<Assessment />}
                        label={`${dueToday} Due Today`}
                        color="warning"
                        variant="filled"
                        size="small"
                      />
                    )}
                    {overdue > 0 && (
                      <Chip
                        icon={<Cancel />}
                        label={`${overdue} Overdue`}
                        color="error"
                        variant="filled"
                        size="small"
                      />
                    )}
                    {dueToday === 0 && overdue === 0 && (
                      <Chip
                        icon={<CheckCircle />}
                        label="All Current"
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  <Box textAlign="center">
                    <Chip
                      label={`${successRate}% Success Rate`}
                      color={Number(successRate) >= 70 ? 'success' : Number(successRate) >= 50 ? 'warning' : 'error'}
                      variant="filled"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
      
      {students.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No students found. Add your first student to get started!
          </Typography>
        </Box>
      )}

      <AddStudentDialog
        open={addStudentDialogOpen}
        onClose={() => setAddStudentDialogOpen(false)}
        onAddStudent={(student) => {
          onAddStudent(student);
          setAddStudentDialogOpen(false);
        }}
      />
    </Box>
  );
};

export default StudentList;
