import { Student } from '../types';
import { GoogleDriveStorage } from './googleDriveStorage';

const STORAGE_KEY = 'iep-tracker-students';
const BACKUP_PREFIX = 'iep-tracker-backup-';

export class IEPStorage {
  
  static async saveStudents(students: Student[], accessToken?: string | null): Promise<void> {
    try {
      // Always save to localStorage as fallback
      const dataToSave = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        students: students
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('✅ Data saved to localStorage');
      
      // Auto-backup to localStorage
      this.createAutoBackup(students);

      // If user is logged in, also save to Google Drive
      if (accessToken) {
        try {
          const googleDrive = new GoogleDriveStorage(accessToken);
          await googleDrive.saveStudents(students);
          console.log('✅ Data also saved to Google Drive');
        } catch (error) {
          console.warn('⚠️ Failed to save to Google Drive, but localStorage save succeeded:', error);
          // Don't throw error here, localStorage save succeeded
        }
      }
    } catch (error) {
      console.error('❌ Error saving data:', error);
      throw new Error('Failed to save student data');
    }
  }

  static async loadStudents(accessToken?: string | null): Promise<Student[]> {
    try {
      // If user is logged in, try to load from Google Drive first
      if (accessToken) {
        try {
          const googleDrive = new GoogleDriveStorage(accessToken);
          const driveStudents = await googleDrive.loadStudents();
          
          if (driveStudents.length > 0) {
            console.log(`✅ Loaded ${driveStudents.length} students from Google Drive`);
            // Also update localStorage with Google Drive data
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              version: '1.0',
              timestamp: new Date().toISOString(),
              students: driveStudents
            }));
            return driveStudents;
          }
        } catch (error) {
          console.warn('⚠️ Failed to load from Google Drive, falling back to localStorage:', error);
        }
      }

      // Fallback to localStorage
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        console.log('ℹ️ No saved data found, starting fresh');
        return [];
      }
      
      const parsedData = JSON.parse(data);
      if (parsedData.students && Array.isArray(parsedData.students)) {
        console.log(`✅ Loaded ${parsedData.students.length} students from localStorage`);
        return parsedData.students;
      } else {
        console.warn('⚠️ Invalid data format in storage');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      return [];
    }
  }

  static exportStudents(students: Student[], filename?: string, accessToken?: string | null): void {
    try {
      const exportData = {
        exportInfo: {
          version: '1.0',
          exportDate: new Date().toISOString(),
          totalStudents: students.length,
          totalGoals: students.reduce((sum, student) => sum + student.goals.length, 0),
          appName: 'IEP Tracker'
        },
        students: students
      };
      
      // Always create a local download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `iep-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Data exported as download');

      // If user is logged in, also export to Google Drive
      if (accessToken) {
        const googleDrive = new GoogleDriveStorage(accessToken);
        googleDrive.exportStudents(students, filename).catch(error => {
          console.warn('⚠️ Failed to export to Google Drive:', error);
        });
      }
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw new Error('Failed to export student data');
    }
  }

  static importStudents(file: File): Promise<Student[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = event.target?.result as string;
          const parsedData = JSON.parse(data);
          
          // Handle both export format and simple format
          const students = parsedData.students || parsedData;
          
          if (!Array.isArray(students)) {
            throw new Error('Invalid file format: students data must be an array');
          }
          
          // Basic validation
          students.forEach((student: any, index: number) => {
            if (!student.studentId || !student.studentName || !Array.isArray(student.goals)) {
              throw new Error(`Invalid student data at index ${index}: missing required fields`);
            }
          });
          
          console.log(`✅ Successfully validated ${students.length} students from import`);
          resolve(students);
        } catch (error) {
          console.error('❌ Error parsing import file:', error);
          reject(new Error('Failed to parse import file: ' + (error as Error).message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read import file'));
      };
      
      reader.readAsText(file);
    });
  }

  static createAutoBackup(students: Student[]): void {
    try {
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const backupKey = `${BACKUP_PREFIX}${timestamp}`;
      
      const backupData = {
        version: '1.0',
        backupDate: new Date().toISOString(),
        students: students
      };
      
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // Keep only last 7 days of backups
      this.cleanOldBackups();
    } catch (error) {
      console.warn('⚠️ Failed to create auto-backup:', error);
    }
  }

  static getAvailableBackups(): Array<{ key: string; date: string; studentCount: number }> {
    const backups: Array<{ key: string; date: string; studentCount: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_PREFIX)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            backups.push({
              key,
              date: parsed.backupDate || 'Unknown',
              studentCount: parsed.students?.length || 0
            });
          }
        } catch (error) {
          console.warn('⚠️ Invalid backup data for key:', key);
        }
      }
    }
    
    return backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static restoreFromBackup(backupKey: string): Student[] {
    try {
      const data = localStorage.getItem(backupKey);
      if (!data) {
        throw new Error('Backup not found');
      }
      
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed.students)) {
        throw new Error('Invalid backup format');
      }
      
      console.log(`✅ Restored ${parsed.students.length} students from backup`);
      return parsed.students;
    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      throw new Error('Failed to restore from backup');
    }
  }

  static cleanOldBackups(): void {
    try {
      const backups = this.getAvailableBackups();
      const maxBackups = 7;
      
      if (backups.length > maxBackups) {
        const oldBackups = backups.slice(maxBackups);
        oldBackups.forEach(backup => {
          localStorage.removeItem(backup.key);
        });
        console.log(`🧹 Cleaned ${oldBackups.length} old backups`);
      }
    } catch (error) {
      console.warn('⚠️ Error cleaning old backups:', error);
    }
  }

  static getStorageInfo(accessToken?: string | null): { size: number; backupCount: number; lastSaved: string | null; googleDriveInfo?: any } {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const backups = this.getAvailableBackups();
      
      let lastSaved = null;
      if (data) {
        const parsed = JSON.parse(data);
        lastSaved = parsed.timestamp || null;
      }

      const info = {
        size: data ? data.length : 0,
        backupCount: backups.length,
        lastSaved,
        googleDriveInfo: null as any
      };

      // Get Google Drive info if available
      if (accessToken) {
        const googleDrive = new GoogleDriveStorage(accessToken);
        googleDrive.getFolderInfo().then(driveInfo => {
          info.googleDriveInfo = driveInfo;
        }).catch(error => {
          console.warn('⚠️ Failed to get Google Drive info:', error);
        });
      }
      
      return info;
    } catch (error) {
      return {
        size: 0,
        backupCount: 0,
        lastSaved: null
      };
    }
  }

  static async clearAllData(accessToken?: string | null): Promise<void> {
    try {
      // Remove main data from localStorage
      localStorage.removeItem(STORAGE_KEY);
      
      // Remove all backups from localStorage
      const backups = this.getAvailableBackups();
      backups.forEach(backup => {
        localStorage.removeItem(backup.key);
      });
      
      console.log('🗑️ All local data cleared');

      // If user is logged in, also clear Google Drive data
      if (accessToken) {
        try {
          const googleDrive = new GoogleDriveStorage(accessToken);
          await googleDrive.deleteAllData();
          console.log('🗑️ All Google Drive data cleared');
        } catch (error) {
          console.warn('⚠️ Failed to clear Google Drive data:', error);
          throw new Error('Local data cleared, but failed to clear Google Drive data');
        }
      }
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw new Error('Failed to clear data: ' + (error as Error).message);
    }
  }

  static async createGoogleDriveBackup(accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new Error('Google Drive access token required for backup');
    }
    
    try {
      const googleDrive = new GoogleDriveStorage(accessToken);
      await googleDrive.createBackup();
      console.log('✅ Google Drive backup created');
    } catch (error) {
      console.error('❌ Error creating Google Drive backup:', error);
      throw new Error('Failed to create Google Drive backup');
    }
  }
}
