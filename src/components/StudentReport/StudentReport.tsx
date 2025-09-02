import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  TrendingUp,
  CalendarToday,
  Print,
} from '@mui/icons-material';
import { Student, Goal, AssessmentResult } from '../../types';

interface StudentReportProps {
  student: Student;
  onBack: () => void;
}

interface GoalSummary {
  goal: Goal;
  totalAssessments: number;
  totalPasses: number;
  passPercentage: number;
  lastAssessmentDate: string | null;
  dailyPassRates: Array<{ date: string; passRate: number }>;
}

const StudentReport: React.FC<StudentReportProps> = ({ student, onBack }) => {
  
  const handlePrint = () => {
    window.print();
  };
  
  const generateGoalSummary = (goal: Goal): GoalSummary => {
    const totalAssessments = goal.assessmentResults.length;
    const totalPasses = goal.assessmentResults.filter(result => result.result === 'pass').length;
    const overallPassPercentage = totalAssessments > 0 ? Math.round((totalPasses / totalAssessments) * 100) : 0;
    
    const lastAssessmentDate = totalAssessments > 0 
      ? goal.assessmentResults
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : null;

    // Group assessments by date and calculate daily pass rates
    const assessmentsByDate: { [key: string]: AssessmentResult[] } = {};
    goal.assessmentResults.forEach(result => {
      if (!assessmentsByDate[result.date]) {
        assessmentsByDate[result.date] = [];
      }
      assessmentsByDate[result.date].push(result);
    });

    const dailyPassRates = Object.entries(assessmentsByDate)
      .map(([date, results]) => {
        const dayPasses = results.filter(r => r.result === 'pass').length;
        const dayTotal = results.length;
        const passRate = dayTotal > 0 ? (dayPasses / dayTotal) * 100 : 0;
        return { date, passRate };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get the last assessment day's success rate for the badge
    const lastAssessmentPassRate = dailyPassRates.length > 0 
      ? dailyPassRates[dailyPassRates.length - 1].passRate 
      : overallPassPercentage;

    return {
      goal,
      totalAssessments,
      totalPasses,
      passPercentage: Math.round(lastAssessmentPassRate), // Use last assessment day's rate for the badge
      lastAssessmentDate,
      dailyPassRates,
    };
  };

  // Calculate percentage of goals where last assessment day was > 75%
  const getGoalsAbove75Percent = () => {
    const goalSummaries = student.goals.map(generateGoalSummary);
    
    if (goalSummaries.length === 0) return 0;

    const goalsAbove75 = goalSummaries.filter(summary => {
      if (summary.dailyPassRates.length === 0) return false;
      
      // Get the most recent assessment day's pass rate
      const lastDayPassRate = summary.dailyPassRates[summary.dailyPassRates.length - 1].passRate;
      return lastDayPassRate > 75;
    });

    return Math.round((goalsAbove75.length / goalSummaries.length) * 100);
  };

  const SimpleLineGraph: React.FC<{ data: Array<{ date: string; passRate: number }> }> = ({ data }) => {
    if (data.length === 0) {
      return (
        <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    const maxWidth = 300;
    const maxHeight = 80;
    const padding = 10;

    // Calculate positions
    const points = data.map((item, index) => {
      const x = padding + (index / Math.max(data.length - 1, 1)) * (maxWidth - 2 * padding);
      const y = maxHeight - padding - (item.passRate / 100) * (maxHeight - 2 * padding);
      return { x, y, ...item };
    });

    // Create SVG path
    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    return (
      <Box sx={{ 
        width: '100%', 
        height: 100, 
        position: 'relative',
        '@media print': {
          pb: 2,
        }
      }}>
        <svg width={maxWidth} height={maxHeight} style={{ width: '100%', height: '100%' }}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="16" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 16" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Y-axis labels */}
          <text x="5" y="15" fontSize="10" fill="#666">100%</text>
          <text x="5" y={maxHeight - 5} fontSize="10" fill="#666">0%</text>
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#1976d2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#1976d2"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>
        
        {/* Date labels */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 1, 
          px: 1,
          '@media print': {
            mb: 1, // Add margin bottom for print
          }
        }}>
          {data.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary">
                {new Date(data[0].date).toLocaleDateString()}
              </Typography>
              {data.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(data[data.length - 1].date).toLocaleDateString()}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    );
  };

  const goalSummaries = student.goals.map(generateGoalSummary);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFrequencyText = (goal: Goal) => {
    switch (goal.frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'custom': return `Every ${goal.customFrequencyDays} days`;
      default: return goal.frequency;
    }
  };

  return (
    <Box sx={{ 
      padding: 3,
      '@media print': {
        padding: 1,
        '& .no-print': {
          display: 'none !important',
        },
        '& .print-break': {
          pageBreakAfter: 'always',
        },
      }
    }}>
      {/* Header */}
      <Box sx={{ mb: 3, '@media print': { mb: 2 } }}>
        {/* Button Row */}
        <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </Box>
        
        {/* Title Row */}
        <Box>
          <Typography variant="h4" component="h1" sx={{ '@media print': { fontSize: '1.5rem' } }}>
            Progress Report
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ '@media print': { fontSize: '1rem' } }}>
            {student.studentName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ '@media print': { display: 'block' } }}>
            Generated on {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        '@media print': {
          boxShadow: 'none',
          border: '1px solid #ccc',
          mb: 2,
        }
      }}>
        <Typography variant="h6" gutterBottom sx={{ '@media print': { fontSize: '1.1rem' } }}>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Overall Summary
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h3" color="primary" sx={{ '@media print': { fontSize: '2rem', color: '#000 !important' } }}>
              {student.goals.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ '@media print': { color: '#000 !important' } }}>
              Active Goals
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h3" color="success.main" sx={{ '@media print': { fontSize: '2rem', color: '#000 !important' } }}>
              {goalSummaries.reduce((sum, g) => sum + g.dailyPassRates.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ '@media print': { color: '#000 !important' } }}>
              Total Assessments
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 120 }}>
            <Typography variant="h3" color="info.main" sx={{ '@media print': { fontSize: '2rem', color: '#000 !important' } }}>
              {getGoalsAbove75Percent()}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ '@media print': { color: '#000 !important' } }}>
              Goals Above 75% (Last Assessment)
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Goal Reports */}
      <Typography variant="h6" gutterBottom sx={{ 
        mt: 3, 
        mb: 2,
        '@media print': { 
          mt: 2, 
          mb: 1,
          fontSize: '1.1rem',
        }
      }}>
        <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
        Goal Progress Reports
      </Typography>

      {goalSummaries.map((summary, index) => (
        <Card key={summary.goal.goalId} sx={{ 
          mb: 2, // Reduced from 3
          '@media print': {
            mb: 1, // Reduced from 2
            boxShadow: 'none',
            border: '1px solid #ccc',
            pageBreakInside: 'avoid',
          }
        }}>
          <CardContent sx={{ 
            '@media print': { 
              p: 1.5, // Reduced from 2
              pb: 2, // Reduced from 3
            }
          }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, '@media print': { flexDirection: 'column', gap: 1.5 } }}>
              {/* Goal Info */}
                    <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ '@media print': { fontSize: '0.95rem', mb: 0.5 } }}>
                  {summary.goal.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ '@media print': { color: '#333 !important', mb: 1 } }}>
                  {summary.goal.description}
                </Typography>

                {/* Notes Section */}
                {summary.goal.notes && summary.goal.notes.length > 0 && (
                  <Box sx={{ mb: 2, '@media print': { mb: 1.5 } }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ 
                      fontWeight: 600, 
                      color: 'primary.main',
                      '@media print': { color: '#333 !important', fontSize: '0.85rem', mb: 0.5 }
                    }}>
                      Teacher Notes:
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: 1, 
                      p: 1.5,
                      '@media print': { 
                        backgroundColor: '#f9f9f9 !important',
                        border: '1px solid #ddd',
                        p: 1
                      }
                    }}>
                      {summary.goal.notes
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5) // Show only the 5 most recent notes in report
                        .map((note, index) => (
                          <Box key={note.noteId} sx={{ 
                            mb: index < Math.min(4, summary.goal.notes!.length - 1) ? 1 : 0,
                            '@media print': { mb: index < Math.min(4, summary.goal.notes!.length - 1) ? 0.5 : 0 }
                          }}>
                            <Typography variant="body2" sx={{ 
                              mb: 0.25,
                              '@media print': { fontSize: '0.8rem', lineHeight: 1.3 }
                            }}>
                              {note.note}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              fontStyle: 'italic',
                              '@media print': { color: '#666 !important', fontSize: '0.7rem' }
                            }}>
                              — {formatDate(note.date)}
                            </Typography>
                          </Box>
                        ))}
                      {summary.goal.notes.length > 5 && (
                        <Typography variant="caption" color="text.secondary" sx={{
                          fontStyle: 'italic',
                          display: 'block',
                          mt: 0.5,
                          '@media print': { color: '#666 !important', fontSize: '0.7rem' }
                        }}>
                          ... and {summary.goal.notes.length - 5} more notes
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip 
                    size="small" 
                    label={getFrequencyText(summary.goal)}
                    color="primary"
                    variant="outlined"
                    sx={{ '@media print': { backgroundColor: '#f5f5f5', color: '#000 !important', border: '1px solid #ccc' } }}
                  />
                  <Chip 
                    size="small" 
                    label={`${summary.passPercentage}% Last Session`}
                    color={summary.passPercentage >= 80 ? 'success' : summary.passPercentage >= 60 ? 'warning' : 'error'}
                    sx={{ '@media print': { backgroundColor: '#f5f5f5', color: '#000 !important', border: '1px solid #ccc' } }}
                  />
                  <Chip 
                    size="small" 
                    label={`${summary.dailyPassRates.length} Assessments`}
                    variant="outlined"
                    sx={{ '@media print': { backgroundColor: '#f5f5f5', color: '#000 !important', border: '1px solid #ccc' } }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ '@media print': { color: '#333 !important' } }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Goal Period: {formatDate(summary.goal.startDate)} - {formatDate(summary.goal.endDate)}
                  </Typography>
                  {summary.lastAssessmentDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ '@media print': { color: '#333 !important' } }}>
                      Last Assessment: {formatDate(summary.lastAssessmentDate)}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Progress Graph */}
              <Box sx={{ 
                flex: 1, 
                minWidth: 300,
                '@media print': { 
                  minWidth: 'auto',
                  mt: 2,
                  pb: 2,
                }
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ '@media print': { fontSize: '0.9rem' } }}>
                  Daily Success Rate Trend
                </Typography>
                <SimpleLineGraph data={summary.dailyPassRates} />
                {summary.dailyPassRates.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, '@media print': { color: '#333 !important' } }}>
                    No assessment data available yet
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {student.goals.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No goals have been set for this student yet.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default StudentReport;
