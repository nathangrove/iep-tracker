import React, { useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleDriveProvider, GoogleDriveContext } from './context/GoogleDriveContext';
import Auth from './components/Auth/Auth';
import StudentList from './components/StudentList/StudentList';
import StudentDetail from './components/StudentDetail/StudentDetail';
import DataManagementDialog from './components/DataManagement/DataManagementDialog';
import { mockStudents } from './mockData';
import { Student } from './types';
import { IEPStorage } from './utils/fileStorage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { Settings } from '@mui/icons-material';
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
          // If no saved data, use mock data for demo
          setStudents(mockStudents);
          console.log('📄 Using mock data for demo');
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Error loading students:', error);
        // Fall back to mock data if loading fails
        setStudents(mockStudents);
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
        console.log('🔄 Auto-saving with accessToken:', context.accessToken ? 'Present' : 'Missing');
        await IEPStorage.saveStudents(students, context.accessToken);
        console.log('💾 Auto-saved student data to both localStorage and Google Drive');
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
      <AppBar position="static" sx={{ '@media print': { display: 'none' } }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IEP Tracker
          </Typography>
          {isLoggedIn && (
            <IconButton
              color="inherit"
              onClick={() => setDataManagementOpen(true)}
              sx={{ mr: 2 }}
              title="Data Management"
            >
              <Settings />
            </IconButton>
          )}
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
        {isLoggedIn ? (
          selectedStudent ? (
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
          )
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
            <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
              IEP Tracking System
            </Typography>
            
            <Box sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              backgroundColor: '#f8f9fa', 
              borderRadius: 3, 
              p: 4, 
              mb: 3,
              boxShadow: 2
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                🔒 Your Data Stays in Your Google Drive
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, mb: 3, lineHeight: 1.7 }}>
                This application stores all student information and IEP data directly in 
                <strong> your organization's Google Drive</strong>. No data is stored on external 
                servers, ensuring complete privacy and compliance with FERPA and other educational 
                data protection requirements.
              </Typography>
            </Box>

            <Box sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              backgroundColor: '#fff3e0', 
              borderRadius: 3, 
              p: 4, 
              mb: 4,
              border: '2px solid #ff9800',
              boxShadow: 1
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#e65100', fontWeight: 'bold' }}>
                ⚠️ Organizational Account Required
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7, color: '#bf360c' }}>
                You <strong>must log in with the Google account provided by your school district 
                or educational organization</strong>. Personal Gmail accounts will not have access 
                to the shared student data storage folders.
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ready to get started? Click the "Login with Google" button in the top-right corner.
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 4, 
              mt: 4,
              flexWrap: 'wrap'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'medium' }}>
                  📊 Track Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor student assessments with visual progress indicators
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'medium' }}>
                  📄 OCR Upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload IEP documents and extract goals automatically
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'medium' }}>
                  ☁️ Cloud Sync
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All data synced securely to your Google Drive
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Container>

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
