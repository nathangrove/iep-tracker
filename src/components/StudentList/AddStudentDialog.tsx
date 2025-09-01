import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Upload,
  Delete,
  DocumentScanner
} from '@mui/icons-material';
import { createWorker } from 'tesseract.js';
import { Student, Goal } from '../../types';

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({ open, onClose, onAddStudent }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [extractedGoals, setExtractedGoals] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setUploadStatus('Please upload a PDF or image file');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setUploadStatus('Processing file...');

    try {
      let imageFile = file;
      
      // If it's a PDF, we'll need to convert it to image first
      // For now, we'll handle images directly and show a message for PDFs
      if (file.type === 'application/pdf') {
        setUploadStatus('PDF upload detected. For best results, please convert to image first or upload an image of the IEP document.');
        setIsProcessing(false);
        return;
      }

      // Process image with Tesseract
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();

      // Extract student information and goals
      extractStudentInfo(text);
      setUploadStatus('Text extraction completed!');
      
    } catch (error) {
      console.error('OCR Error:', error);
      setUploadStatus('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractStudentInfo = (text: string) => {
    // Simple regex patterns to extract common IEP information
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Try to find student name patterns
    const namePatterns = [
      /(?:student|child|pupil)[\s:]*([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
      /name[\s:]*([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
      /([A-Z][a-z]+),\s*([A-Z][a-z]+)/
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes(',')) {
          // Last, First format
          setLastName(match[1]);
          setFirstName(match[2]);
        } else {
          // First Last format
          setFirstName(match[1]);
          setLastName(match[2]);
        }
        break;
      }
    }

    // Try to find student ID
    const idPattern = /(?:id|student\s*id|identification)[\s:]*(\d+)/i;
    const idMatch = text.match(idPattern);
    if (idMatch) {
      setStudentId(idMatch[1]);
    }

    // Extract goals - look for common goal indicators
    const goals: string[] = [];
    const goalKeywords = [
      'goal', 'objective', 'will', 'by the end of', 'measurable', 
      'annual goal', 'iep goal', 'student will'
    ];

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Check if line contains goal keywords and is substantial
      if (goalKeywords.some(keyword => lowerLine.includes(keyword)) && line.length > 20) {
        // Clean up the goal text
        let cleanGoal = line.replace(/^\d+\.\s*/, ''); // Remove numbering
        cleanGoal = cleanGoal.replace(/^goal\s*\d*\s*:?\s*/i, ''); // Remove "Goal X:"
        cleanGoal = cleanGoal.trim();
        
        if (cleanGoal.length > 10) {
          goals.push(cleanGoal);
        }
      }
    });

    setExtractedGoals(goals);
  };

  const removeGoal = (index: number) => {
    setExtractedGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (firstName.trim() && lastName.trim() && studentId.trim()) {
      const goals: Goal[] = extractedGoals.map((goalText, index) => ({
        goalId: `${Date.now()}-${index}`,
        title: goalText.length > 50 ? goalText.substring(0, 50) + '...' : goalText,
        description: goalText,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // One year from now
        frequency: 'weekly' as const,
        assessmentResults: []
      }));

      const newStudent: Student = {
        studentId: studentId.trim(),
        studentName: `${lastName.trim()}, ${firstName.trim()}`,
        goals
      };

      onAddStudent(newStudent);
      handleClose();
    }
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setStudentId('');
    setExtractedGoals([]);
    setSelectedFile(null);
    setUploadStatus('');
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Add New Student
        {selectedFile && (
          <Typography variant="caption" display="block" color="text.secondary">
            File: {selectedFile.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* File Upload Section */}
          <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
            <DocumentScanner sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Upload IEP Document
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload an image of the IEP document to automatically extract student information and goals
            </Typography>
            
            <input
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<Upload />}
                disabled={isProcessing}
              >
                Choose File
              </Button>
            </label>
            
            {isProcessing && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Processing document...
                </Typography>
              </Box>
            )}
            
            {uploadStatus && (
              <Alert 
                severity={uploadStatus.includes('Error') ? 'error' : 'info'} 
                sx={{ mt: 2 }}
              >
                {uploadStatus}
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Student Information
            </Typography>
          </Divider>

          {/* Manual Input Fields */}
          <TextField
            label="Student ID"
            variant="outlined"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g., 12345"
            helperText="Unique identifier for the student"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              variant="outlined"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g., John"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g., Doe"
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Extracted Goals */}
          {extractedGoals.length > 0 && (
            <Box>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Extracted Goals ({extractedGoals.length})
                </Typography>
              </Divider>
              
              <List dense>
                {extractedGoals.map((goal, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => removeGoal(index)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`Goal ${index + 1}`}
                      secondary={goal}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="caption" color="text.secondary">
                These goals will be added to the student's profile. You can remove unwanted goals or edit them later.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!firstName.trim() || !lastName.trim() || !studentId.trim() || isProcessing}
        >
          Add Student
          {extractedGoals.length > 0 && ` with ${extractedGoals.length} Goals`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudentDialog;
