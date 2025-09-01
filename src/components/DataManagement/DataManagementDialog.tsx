import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  CloudDownload,
  CloudUpload,
  Save,
  Restore,
  Delete,
  Info,
  Backup,
  Warning
} from '@mui/icons-material';
import { IEPStorage } from '../../utils/fileStorage';
import { Student } from '../../types';

interface DataManagementDialogProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  onStudentsChange: (students: Student[]) => void;
  accessToken?: string | null;
}

const DataManagementDialog: React.FC<DataManagementDialogProps> = ({
  open,
  onClose,
  students,
  onStudentsChange,
  accessToken
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backups, setBackups] = useState<Array<{ key: string; date: string; studentCount: number }>>([]);

  React.useEffect(() => {
    if (open) {
      loadBackups();
    }
  }, [open]);

  const loadBackups = () => {
    const availableBackups = IEPStorage.getAvailableBackups();
    setBackups(availableBackups);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await IEPStorage.saveStudents(students, accessToken);
      setMessage({ type: 'success', text: 'Data saved successfully!' });
      loadBackups(); // Refresh backup list
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const loadedStudents = await IEPStorage.loadStudents(accessToken);
      onStudentsChange(loadedStudents);
      setMessage({ type: 'success', text: `Loaded ${loadedStudents.length} students successfully!` });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setLoading(true);
    setMessage(null);
    try {
      IEPStorage.exportStudents(students, undefined, accessToken);
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoading(true);
      setMessage(null);
      try {
        const importedStudents = await IEPStorage.importStudents(file);
        onStudentsChange(importedStudents);
        setMessage({ type: 'success', text: `Imported ${importedStudents.length} students successfully!` });
      } catch (error) {
        setMessage({ type: 'error', text: (error as Error).message });
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const handleRestoreBackup = (backupKey: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const restoredStudents = IEPStorage.restoreFromBackup(backupKey);
      onStudentsChange(restoredStudents);
      setMessage({ type: 'success', text: `Restored ${restoredStudents.length} students from backup!` });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
      setLoading(true);
      setMessage(null);
      try {
        await IEPStorage.clearAllData(accessToken);
        onStudentsChange([]);
        setMessage({ type: 'success', text: 'All data cleared successfully!' });
        loadBackups();
      } catch (error) {
        setMessage({ type: 'error', text: (error as Error).message });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateGoogleBackup = async () => {
    if (!accessToken) {
      setMessage({ type: 'error', text: 'Please log in to Google Drive first' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await IEPStorage.createGoogleDriveBackup(accessToken);
      setMessage({ type: 'success', text: 'Google Drive backup created successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestGoogleDriveSave = async () => {
    if (!accessToken) {
      setMessage({ type: 'error', text: 'Please log in to Google first' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await IEPStorage.saveStudents(students, accessToken);
      setMessage({ type: 'success', text: 'Test Google Drive save completed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const storageInfo = IEPStorage.getStorageInfo(accessToken);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Save sx={{ mr: 1 }} />
          Data Management
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Status Message */}
          {message && (
            <Alert severity={message.type} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          {/* Storage Info */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Info sx={{ mr: 1 }} />
                Storage Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`${students.length} Students`} color="primary" />
                <Chip label={`${students.reduce((sum, s) => sum + s.goals.length, 0)} Goals`} color="secondary" />
                <Chip label={`${storageInfo.backupCount} Local Backups`} />
                {accessToken && (
                  <Chip 
                    label="Google Drive Connected" 
                    color="success" 
                    variant="outlined"
                    icon={<CloudUpload />}
                  />
                )}
                {storageInfo.lastSaved && (
                  <Chip label={`Last Saved: ${formatDate(storageInfo.lastSaved)}`} variant="outlined" />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Main Actions */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Save & Load {accessToken && '(Google Drive + Local)'}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={loading}
                  fullWidth
                >
                  Save Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={loading ? <CircularProgress size={20} /> : <Restore />}
                  onClick={handleLoad}
                  disabled={loading}
                  fullWidth
                >
                  Load Data
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {accessToken 
                  ? 'Saves to both Google Drive and browser localStorage with automatic backups'
                  : 'Saves to browser localStorage with automatic daily backups. Log in for Google Drive sync.'
                }
              </Typography>
            </CardContent>
          </Card>

          {/* Google Drive Backup */}
          {accessToken && (
            <Card variant="outlined" sx={{ border: '1px solid #4caf50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <CloudUpload sx={{ mr: 1 }} />
                  Google Drive Backup & Test
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Backup />}
                    onClick={handleCreateGoogleBackup}
                    disabled={loading}
                    color="success"
                  >
                    Create Backup
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    onClick={handleTestGoogleDriveSave}
                    disabled={loading}
                    color="success"
                  >
                    Test Save
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Create timestamped backups or test Google Drive connectivity directly
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Import/Export */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import & Export
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <CloudDownload />}
                  onClick={handleExport}
                  disabled={loading}
                  fullWidth
                  color="success"
                >
                  Export JSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                  onClick={handleImport}
                  disabled={loading}
                  fullWidth
                  color="success"
                >
                  Import JSON
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Export for backup or sharing, import from external JSON files
              </Typography>
            </CardContent>
          </Card>

          {/* Backups */}
          {backups.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Backup sx={{ mr: 1 }} />
                  Available Backups ({backups.length})
                </Typography>
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {backups.map((backup, index) => (
                    <ListItem key={backup.key} sx={{ px: 0 }}>
                      <ListItemText
                        primary={formatDate(backup.date)}
                        secondary={`${backup.studentCount} students`}
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRestoreBackup(backup.key)}
                          disabled={loading}
                        >
                          Restore
                        </Button>
                      </ListItemSecondaryAction>
                      {index < backups.length - 1 && <Divider />}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card variant="outlined" sx={{ border: '1px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                <Warning sx={{ mr: 1 }} />
                Danger Zone
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={handleClearData}
                disabled={loading}
                color="error"
                fullWidth
              >
                Clear All Data
              </Button>
              <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                This will permanently delete all students, goals, and backups
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataManagementDialog;
