import React, { useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleDriveProvider, GoogleDriveContext } from './context/GoogleDriveContext';
import Auth from './components/Auth/Auth';
import StudentList from './components/StudentList/StudentList';
import StudentDetail from './components/StudentDetail/StudentDetail';
import DataManagementDialog from './components/DataManagement/DataManagementDialog';
import { Student } from './types';
import { IEPStorage } from './utils/fileStorage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Box, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  Settings,
  School,
  CloudDone,
  Storage,
  Help
} from '@mui/icons-material';
import './App.css';

const GOOGLE_CLIENT_ID = "771614323675-l9c8db6fb36bjebe76qa4rt7l1fom56l.apps.googleusercontent.com";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const AppContent: React.FC = () => {
  const context = useContext(GoogleDriveContext);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [dataManagementOpen, setDataManagementOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    if (!context) return; // Skip if context not available
    
    const loadData = async () => {
      try {
        console.log('🔄 Loading data with accessToken:', context.accessToken ? 'Present' : 'Missing');
        const savedStudents = await IEPStorage.loadStudents(context.accessToken);
        if (savedStudents.length > 0) {
          setStudents(savedStudents);
          console.log(`✅ Loaded ${savedStudents.length} students from storage`);
        } else {
          console.log('📄 No existing data found - starting fresh');
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Error loading students:', error);
        // Start with empty data if loading fails
        setStudents([]);
        setIsInitialized(true);
      }
    };

    loadData();
  }, [context]); // Re-run when context changes (includes accessToken)

  // Auto-save whenever students data changes (debounced)
  useEffect(() => {
    if (!isInitialized || !context) return; // Don't save during initial load
    
    const saveTimer = setTimeout(async () => {
      try {
        if (context.accessToken) {
          console.log('🔄 Auto-saving to both localStorage and Google Drive');
          await IEPStorage.saveStudents(students, context.accessToken);
          console.log('💾 Auto-saved student data to both localStorage and Google Drive');
        } else {
          console.log('🔄 Auto-saving to localStorage only');
          await IEPStorage.saveStudents(students, null);
          console.log('💾 Auto-saved student data to localStorage');
        }
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, 1000); // Save 1 second after last change

    return () => clearTimeout(saveTimer);
  }, [students, isInitialized, context]); // Include context to re-run when login status changes

  // Early return after all hooks are registered
  if (!context) {
    return null;
  }

  const { isLoggedIn } = context;

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.studentId === updatedStudent.studentId ? updatedStudent : student
      )
    );
    setSelectedStudent(updatedStudent);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prevStudents => [...prevStudents, newStudent]);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prevStudents => prevStudents.filter(student => student.studentId !== studentId));
    setSelectedStudent(null); // Return to list view after deletion
  };

  const handleStudentsChange = (newStudents: Student[]) => {
    setStudents(newStudents);
    setSelectedStudent(null); // Return to list view
  };

  return (
    <div>
      <AppBar position="static" sx={{ 
        '@media print': { display: 'none' },
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
      }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <School sx={{ mr: 2, fontSize: 28 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              IEP Tracker
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.9,
              fontSize: '0.75rem'
            }}>
              Special Education Progress Management
            </Typography>
          </Box>
          
          {/* Storage Status Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            {isLoggedIn ? (
              <Chip
                icon={<CloudDone />}
                label="Cloud Sync"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            ) : (
              <Chip
                icon={<Storage />}
                label="Local Only"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            )}
          </Box>

          <IconButton
            color="inherit"
            onClick={() => setHelpModalOpen(true)}
            sx={{ 
              mr: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            title="Help & Instructions"
          >
            <Help />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setDataManagementOpen(true)}
            sx={{ 
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            title="Data Management"
          >
            <Settings />
          </IconButton>
          <Auth />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ 
        mt: 4,
        '@media print': {
          mt: 0,
          maxWidth: 'none',
          padding: 0,
        }
      }}>
        {selectedStudent ? (
          <StudentDetail 
            student={selectedStudent}
            onBack={handleBackToList}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        ) : (
          <StudentList 
            students={students} 
            onStudentSelect={handleStudentSelect}
            onAddStudent={handleAddStudent}
          />
        )}

        {/* Show welcome message for first-time users */}
        {students.length === 0 && !selectedStudent && (
          <Box sx={{ textAlign: 'center', mt: 6, px: 2 }}>
            {/* Hero Section */}
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Welcome to IEP Tracker
              </Typography>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 300,
                  mb: 4,
                  maxWidth: 800,
                  mx: 'auto'
                }}
              >
                Streamline your special education progress monitoring with comprehensive IEP goal tracking and reporting
              </Typography>
            </Box>

            {/* Feature Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              maxWidth: 1000,
              mx: 'auto',
              mb: 6
            }}>
              <Box sx={{
                backgroundColor: '#f8f9ff',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                border: '1px solid rgba(25, 118, 210, 0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <Typography variant="h2" sx={{ mb: 2 }}>🎯</Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Goal Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, track, and assess IEP goals with detailed progress monitoring and data collection
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#f8f9ff',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                border: '1px solid rgba(25, 118, 210, 0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <Typography variant="h2" sx={{ mb: 2 }}>📊</Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Progress Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate professional progress reports with visual charts and detailed assessment data
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#f8f9ff',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                border: '1px solid rgba(25, 118, 210, 0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)'
                }
              }}>
                <Typography variant="h2" sx={{ mb: 2 }}>☁️</Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Cloud Sync
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Optional Google Drive integration for secure backup and cross-device synchronization
                </Typography>
              </Box>
            </Box>

            {/* Status Card */}
            {!isLoggedIn && (
              <Box sx={{ 
                maxWidth: 700, 
                mx: 'auto', 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9ff 100%)',
                borderRadius: 4, 
                p: 4, 
                mb: 4,
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.1)',
                border: '1px solid rgba(25, 118, 210, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Storage sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Local Storage Mode
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, color: 'text.primary' }}>
                  Your data is securely saved on this device. For enhanced features including cloud backup, 
                  cross-device sync, and team collaboration, connect your organizational Google account.
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary'
                }}>
                  <Typography variant="caption">
                    Click the "Sign in with Google" button in the top-right corner
                  </Typography>
                </Box>
              </Box>
            )}

            {isLoggedIn && (
              <Box sx={{ 
                maxWidth: 700, 
                mx: 'auto', 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                borderRadius: 4, 
                p: 4, 
                mb: 4,
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.1)',
                border: '1px solid rgba(46, 125, 50, 0.2)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <CloudDone sx={{ fontSize: 32, color: 'success.main', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 600 }}>
                    Cloud Sync Active
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, color: 'text.primary' }}>
                  Your data is automatically synchronized to Google Drive and cached locally for offline access. 
                  All changes are saved in real-time across your devices.
                </Typography>
              </Box>
            )}

            {/* Call to Action */}
            <Box sx={{
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
              borderRadius: 3,
              p: 4,
              maxWidth: 600,
              mx: 'auto',
              border: '2px dashed rgba(25, 118, 210, 0.2)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Ready to Get Started?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Add your first student to begin tracking IEP goals and progress assessments.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Look for the "Add Student" button above ↗️
              </Typography>
            </Box>
          </Box>
        )}
      </Container>

      {/* Help Modal */}
      <Dialog
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            '@media print': { display: 'none' }
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Help />
          IEP Tracker - Data Recording Guide
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 1 }}>
            📝 How to Record Assessment Data
          </Typography>
          
          <List sx={{ mb: 3 }}>
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <Typography variant="h6" color="primary.main">1.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Add Students"
                secondary="Click 'Add Student' to create a new student profile with their basic information"
              />
            </ListItem>
            
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <Typography variant="h6" color="primary.main">2.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Create IEP Goals"
                secondary="In the student detail view, add specific, measurable IEP goals using the 'Add Goal' button"
              />
            </ListItem>
            
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <Typography variant="h6" color="primary.main">3.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Record Assessments"
                secondary="For each goal, record performance data by clicking Pass or Fail for each question assessed"
              />
            </ListItem>
            
            <ListItem sx={{ pl: 0 }}>
              <ListItemIcon>
                <Typography variant="h6" color="primary.main">4.</Typography>
              </ListItemIcon>
              <ListItemText
                primary="Track Progress"
                secondary="View progress charts and generate reports to monitor student advancement toward IEP goals"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            📊 Assessment Data Guidelines
          </Typography>
          
          <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Data Entry Format:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Click Pass or Fail for each question assessed
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Percentage will be calculated automatically
            </Typography>
            <Typography variant="body2">
              • Add comments for context or observations
            </Typography>
          </Box>

          <Box sx={{ backgroundColor: '#e8f5e8', borderRadius: 2, p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Best Practices:
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Record data consistently (based on the IEP recommendation)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Include notes about conditions or modifications
            </Typography>
            <Typography variant="body2">
              • Review progress charts regularly for trends
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            ☁️ Data Storage & Sync
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Local Storage:</strong> Your data is automatically saved on this device. No internet required.
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Cloud Sync:</strong> Sign in with Google to enable automatic backup and sync across devices.
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> All data is stored securely and only accessible by you. No data is shared with third parties.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setHelpModalOpen(false)} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Management Dialog */}
      <DataManagementDialog
        open={dataManagementOpen}
        onClose={() => setDataManagementOpen(false)}
        students={students}
        onStudentsChange={handleStudentsChange}
      />
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GoogleDriveProvider>
          <AppContent />
        </GoogleDriveProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
