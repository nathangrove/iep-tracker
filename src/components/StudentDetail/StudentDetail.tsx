import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Add,
  Assessment,
  Person,
  Assignment,
  Edit,
  ExpandMore,
  Delete,
  Notes
} from '@mui/icons-material';
import { Student, Goal, AssessmentResult, GoalNote } from '../../types';
import { getDaysSince } from '../../utils/dateUtils';
import StudentReport from '../StudentReport/StudentReport';

interface StudentDetailProps {
  student: Student;
  onBack: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onBack, onUpdateStudent, onDeleteStudent }) => {
  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalStartDate, setNewGoalStartDate] = useState('');
  const [newGoalEndDate, setNewGoalEndDate] = useState('');
  const [newGoalFrequency, setNewGoalFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom'>('weekly');
  const [newGoalCustomDays, setNewGoalCustomDays] = useState<number>(7);
  const [expandedGoal, setExpandedGoal] = useState<string | false>(false);
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [selectedGoalForNote, setSelectedGoalForNote] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<GoalNote | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const addAssessment = (goalId: string, result: 'pass' | 'fail') => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const updatedStudent = {
      ...student,
      goals: student.goals.map(goal => 
        goal.goalId === goalId
          ? {
              ...goal,
              assessmentResults: [
                ...goal.assessmentResults,
                { date: today, result }
              ]
            }
          : goal
      )
    };
    
    onUpdateStudent(updatedStudent);
  };

  const addNewGoal = () => {
    if (newGoalTitle.trim() && newGoalDescription.trim() && newGoalStartDate && newGoalEndDate) {
      const newGoal: Goal = {
        goalId: Date.now().toString(), // Simple ID generation
        title: newGoalTitle.trim(),
        description: newGoalDescription.trim(),
        startDate: newGoalStartDate,
        endDate: newGoalEndDate,
        frequency: newGoalFrequency,
        ...(newGoalFrequency === 'custom' && { customFrequencyDays: newGoalCustomDays }),
        assessmentResults: [],
        notes: []
      };

      const updatedStudent = {
        ...student,
        goals: [...student.goals, newGoal]
      };

      onUpdateStudent(updatedStudent);
      setAddGoalDialogOpen(false);
      setNewGoalTitle('');
      setNewGoalDescription('');
      setNewGoalStartDate('');
      setNewGoalEndDate('');
      setNewGoalFrequency('weekly');
      setNewGoalCustomDays(7);
    }
  };

  const deleteDayAssessments = (goalId: string, dateToDelete: string) => {
    const updatedStudent = {
      ...student,
      goals: student.goals.map(goal => 
        goal.goalId === goalId
          ? {
              ...goal,
              assessmentResults: goal.assessmentResults.filter(result => result.date !== dateToDelete)
            }
          : goal
      )
    };
    
    onUpdateStudent(updatedStudent);
  };

  const addNote = (goalId: string, noteText: string) => {
    if (!noteText.trim()) return;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const newNote: GoalNote = {
      noteId: Date.now().toString(),
      date: today,
      note: noteText.trim()
    };

    const updatedStudent = {
      ...student,
      goals: student.goals.map(goal => 
        goal.goalId === goalId
          ? {
              ...goal,
              notes: [...(goal.notes || []), newNote] // Handle existing goals without notes array
            }
          : goal
      )
    };
    
    onUpdateStudent(updatedStudent);
  };

  const deleteNote = (goalId: string, noteId: string) => {
    const updatedStudent = {
      ...student,
      goals: student.goals.map(goal => 
        goal.goalId === goalId
          ? {
              ...goal,
              notes: (goal.notes || []).filter(note => note.noteId !== noteId) // Handle existing goals without notes array
            }
          : goal
      )
    };
    
    onUpdateStudent(updatedStudent);
  };

  const openAddNoteDialog = (goalId: string) => {
    setSelectedGoalForNote(goalId);
    setNewNoteText('');
    setAddNoteDialogOpen(true);
  };

  const handleAddNote = () => {
    if (selectedGoalForNote && newNoteText.trim()) {
      addNote(selectedGoalForNote, newNoteText);
      setAddNoteDialogOpen(false);
      setNewNoteText('');
      setSelectedGoalForNote(null);
    }
  };

  const openEditNoteDialog = (goalId: string, note: GoalNote) => {
    setSelectedGoalForNote(goalId);
    setEditingNote(note);
    setEditNoteText(note.note);
    setEditNoteDialogOpen(true);
  };

  const handleEditNote = () => {
    if (selectedGoalForNote && editingNote && editNoteText.trim()) {
      editNote(selectedGoalForNote, editingNote.noteId, editNoteText);
      setEditNoteDialogOpen(false);
      setEditNoteText('');
      setEditingNote(null);
      setSelectedGoalForNote(null);
    }
  };

  const editNote = (goalId: string, noteId: string, newText: string) => {
    if (!newText.trim()) return;
    
    const updatedStudent = {
      ...student,
      goals: student.goals.map(goal => 
        goal.goalId === goalId
          ? {
              ...goal,
              notes: (goal.notes || []).map(note => 
                note.noteId === noteId
                  ? { ...note, note: newText.trim() }
                  : note
              )
            }
          : goal
      )
    };
    
    onUpdateStudent(updatedStudent);
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

  const getAssessmentStatus = (goal: Goal) => {
    const lastAssessment = getLastAssessment(goal);
    
    if (!lastAssessment) {
      return { status: 'overdue', message: 'No assessments yet', daysOverdue: 0 };
    }

    const lastAssessmentDate = new Date(lastAssessment.date);
    const frequencyDays = getFrequencyInDays(goal.frequency, goal.customFrequencyDays);
    
    // Only exclude weekends for daily assessments
    const excludeWeekends = goal.frequency === 'daily';
    const daysSinceLastAssessment = getDaysSince(lastAssessmentDate, excludeWeekends);
    
    if (daysSinceLastAssessment < frequencyDays) {
      const daysUntilDue = frequencyDays - daysSinceLastAssessment;
      return { status: 'current', message: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`, daysOverdue: 0 };
    } else if (daysSinceLastAssessment === frequencyDays) {
      return { status: 'due', message: 'Due today', daysOverdue: 0 };
    } else {
      const daysOverdue = daysSinceLastAssessment - frequencyDays;
      return { status: 'overdue', message: `${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`, daysOverdue };
    }
  };

  const getLastAssessment = (goal: Goal) => {
    if (goal.assessmentResults.length === 0) {
      return null;
    }
    
    // Sort by date and get the most recent assessment
    const sortedResults = [...goal.assessmentResults].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedResults[0];
  };

  const getTodayStats = (goal: Goal) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const todayAssessments = goal.assessmentResults.filter(result => result.date === today);
    const todayPasses = todayAssessments.filter(result => result.result === 'pass').length;
    const todayFails = todayAssessments.filter(result => result.result === 'fail').length;
    
    return { todayPasses, todayFails, todayTotal: todayAssessments.length };
  };

  const groupAssessmentsByDate = (assessmentResults: AssessmentResult[]) => {
    const grouped = assessmentResults.reduce((acc, assessment) => {
      const date = assessment.date;
      if (!acc[date]) {
        acc[date] = { passes: 0, fails: 0, total: 0 };
      }
      acc[date].total++;
      if (assessment.result === 'pass') {
        acc[date].passes++;
      } else {
        acc[date].fails++;
      }
      return acc;
    }, {} as Record<string, { passes: number; fails: number; total: number }>);

    // Convert to array and sort by date (newest first)
    return Object.entries(grouped)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const formatFrequency = (frequency: string, customDays?: number) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'custom': return `Every ${customDays} days`;
      default: return frequency;
    }
  };

  const handleAccordionChange = (goalId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedGoal(isExpanded ? goalId : false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatGoalDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      {showReport ? (
        <StudentReport 
          student={student} 
          onBack={() => setShowReport(false)} 
        />
      ) : (
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={onBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                {student.studentName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Student ID: {student.studentId}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => setShowReport(true)}
              >
                View Report
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddGoalDialogOpen(true)}
              >
                Add Goal
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete Student
              </Button>
            </Box>
          </Box>

      {/* Goals List */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Assignment sx={{ mr: 1 }} />
        Goals ({student.goals.length})
      </Typography>

      {student.goals.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              No goals found for this student
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add the first goal to start tracking assessments
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {student.goals.map((goal) => {
            const todayStats = getTodayStats(goal);
            const assessmentStatus = getAssessmentStatus(goal);
            
            return (
              <Accordion 
                key={goal.goalId}
                expanded={expandedGoal === goal.goalId}
                onChange={handleAccordionChange(goal.goalId)}
                sx={{ 
                  border: '1px solid #e0e0e0',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  '&.Mui-expanded': {
                    margin: 0,
                    boxShadow: 2
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&.Mui-expanded': {
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" fontWeight="bold">
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {goal.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {formatGoalDate(goal.startDate)} - {formatGoalDate(goal.endDate)} • {formatFrequency(goal.frequency, goal.customFrequencyDays)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={(e) => {
                          e.stopPropagation();
                          addAssessment(goal.goalId, 'pass');
                        }}
                        size="small"
                        sx={{ minWidth: 90 }}
                      >
                        Pass {todayStats.todayPasses > 0 && `(${todayStats.todayPasses})`}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={(e) => {
                          e.stopPropagation();
                          addAssessment(goal.goalId, 'fail');
                        }}
                        size="small"
                        sx={{ minWidth: 90 }}
                      >
                        Fail {todayStats.todayFails > 0 && `(${todayStats.todayFails})`}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Notes />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddNoteDialog(goal.goalId);
                        }}
                        size="small"
                        sx={{ minWidth: 90 }}
                      >
                        Note
                      </Button>
                      <Chip
                        label={assessmentStatus.message}
                        color={
                          assessmentStatus.status === 'current' ? 'success' :
                          assessmentStatus.status === 'due' ? 'warning' : 'error'
                        }
                        variant={assessmentStatus.status === 'current' ? 'outlined' : 'filled'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Box>
                    {/* Today's Stats and Edit Button */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                      {todayStats.todayTotal > 0 && (
                        <Chip
                          label={`Today: ${todayStats.todayTotal} assessment${todayStats.todayTotal !== 1 ? 's' : ''}`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      <Box sx={{ flexGrow: 1 }} />
                    </Box>

                    {/* Assessment History */}
                    {goal.assessmentResults.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                          Assessment History by Date:
                        </Typography>
                        <List dense sx={{ maxHeight: 300, overflow: 'auto', backgroundColor: '#fafafa', borderRadius: 1 }}>
                          {groupAssessmentsByDate(goal.assessmentResults)
                            .slice(0, 15) // Limit to last 15 days
                            .map((dayStats, index) => {
                              const successRate = dayStats.total > 0 ? (dayStats.passes / dayStats.total * 100).toFixed(0) : 0;
                              return (
                                <ListItem key={index} sx={{ px: 2, py: 1 }}>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" fontWeight="medium">
                                          {formatDate(dayStats.date)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                          <Chip
                                            label={`${dayStats.passes}P`}
                                            color="success"
                                            size="small"
                                            variant="outlined"
                                            sx={{ minWidth: 45, fontSize: '0.7rem' }}
                                          />
                                          <Chip
                                            label={`${dayStats.fails}F`}
                                            color="error"
                                            size="small"
                                            variant="outlined"
                                            sx={{ minWidth: 45, fontSize: '0.7rem' }}
                                          />
                                          <Chip
                                            label={`${successRate}%`}
                                            color={Number(successRate) >= 70 ? 'success' : Number(successRate) >= 50 ? 'warning' : 'error'}
                                            size="small"
                                            variant="filled"
                                            sx={{ minWidth: 50, fontSize: '0.7rem', fontWeight: 'bold' }}
                                          />
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => deleteDayAssessments(goal.goalId, dayStats.date)}
                                            sx={{ ml: 1 }}
                                            title={`Delete all assessments from ${formatDate(dayStats.date)}`}
                                          >
                                            <Delete fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    }
                                    secondary={
                                      <Typography variant="caption" color="text.secondary">
                                        {dayStats.total} assessment{dayStats.total !== 1 ? 's' : ''} on this day
                                      </Typography>
                                    }
                                  />
                                  {index < groupAssessmentsByDate(goal.assessmentResults).slice(0, 15).length - 1 && (
                                    <Divider sx={{ mt: 1 }} />
                                  )}
                                </ListItem>
                              );
                            })}
                        </List>
                      </Box>
                    )}

                    {/* Notes Section */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Notes:
                      </Typography>
                      {goal.notes && goal.notes.length > 0 ? (
                        <List dense sx={{ maxHeight: 200, overflow: 'auto', backgroundColor: '#fafafa', borderRadius: 1, mb: 2 }}>
                          {goal.notes
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first
                            .map((note, index) => (
                              <ListItem key={note.noteId} sx={{ 
                                flexDirection: 'column', 
                                alignItems: 'flex-start',
                                borderBottom: goal.notes && index < goal.notes.length - 1 ? '1px solid #e0e0e0' : 'none'
                              }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      {note.note}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatGoalDate(note.date)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => openEditNoteDialog(goal.goalId, note)}
                                      sx={{ ml: 1 }}
                                      title="Edit note"
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => deleteNote(goal.goalId, note.noteId)}
                                      title="Delete note"
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </ListItem>
                            ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                          No notes yet. Click "Note" to add observations or comments.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Add Goal Dialog */}
      <Dialog 
        open={addGoalDialogOpen} 
        onClose={() => setAddGoalDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Goal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Goal Title"
            fullWidth
            variant="outlined"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Goal Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGoalDescription}
            onChange={(e) => setNewGoalDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              variant="outlined"
              value={newGoalStartDate}
              onChange={(e) => setNewGoalStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              variant="outlined"
              value={newGoalEndDate}
              onChange={(e) => setNewGoalEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Assessment Frequency</InputLabel>
            <Select
              value={newGoalFrequency}
              label="Assessment Frequency"
              onChange={(e) => setNewGoalFrequency(e.target.value as any)}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="biweekly">Bi-weekly (Every 2 weeks)</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>

          {newGoalFrequency === 'custom' && (
            <TextField
              margin="dense"
              label="Custom Frequency (Days)"
              type="number"
              variant="outlined"
              value={newGoalCustomDays}
              onChange={(e) => setNewGoalCustomDays(Number(e.target.value))}
              inputProps={{ min: 1, max: 365 }}
              helperText="Number of days between assessments"
              fullWidth
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGoalDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={addNewGoal}
            variant="contained"
            disabled={!newGoalTitle.trim() || !newGoalDescription.trim() || !newGoalStartDate || !newGoalEndDate}
          >
            Add Goal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog 
        open={addNoteDialogOpen} 
        onClose={() => setAddNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add observations, comments, or context about this goal's progress.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Enter your observations, modifications, context, or any other relevant information..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNoteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddNote}
            variant="contained"
            disabled={!newNoteText.trim()}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog 
        open={editNoteDialogOpen} 
        onClose={() => setEditNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update your observations, comments, or context about this goal's progress.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editNoteText}
            onChange={(e) => setEditNoteText(e.target.value)}
            placeholder="Enter your observations, modifications, context, or any other relevant information..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNoteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditNote}
            variant="contained"
            disabled={!editNoteText.trim()}
          >
            Update Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Student
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{student.studentName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This action cannot be undone. All student data including {student.goals.length} goal(s) and associated assessment results will be permanently deleted.
          </Typography>
          <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
            This will remove the student from all connected systems and storage.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onDeleteStudent(student.studentId);
              setDeleteConfirmOpen(false);
            }}
            variant="contained"
            color="error"
          >
            Delete Student
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
      )}
    </>
  );
};

export default StudentDetail;
