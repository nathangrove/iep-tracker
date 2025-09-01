import { Student } from '../types';

const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const GOOGLE_UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';
const IEP_FOLDER_NAME = '.iep-tracker-data';
const DATA_FILE_NAME = 'students-data.json';

export class GoogleDriveStorage {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive API error: ${response.status} - ${errorText}`);
    }

    return response;
  }

  private async findOrCreateFolder(): Promise<string> {
    try {
      // Search for existing folder
      const searchUrl = `${GOOGLE_DRIVE_API_BASE}/files?q=name='${IEP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const searchResponse = await this.makeRequest(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.files && searchData.files.length > 0) {
        console.log('✅ Found existing IEP folder:', searchData.files[0].id);
        return searchData.files[0].id;
      }

      // Create new folder if not found
      const createUrl = `${GOOGLE_DRIVE_API_BASE}/files`;
      const folderMetadata = {
        name: IEP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const createResponse = await this.makeRequest(createUrl, {
        method: 'POST',
        body: JSON.stringify(folderMetadata),
      });

      const folderData = await createResponse.json();
      console.log('✅ Created new IEP folder:', folderData.id);
      return folderData.id;
    } catch (error) {
      console.error('❌ Error managing folder:', error);
      throw new Error('Failed to access or create IEP folder in Google Drive');
    }
  }

  private async findDataFile(folderId: string): Promise<string | null> {
    try {
      const searchUrl = `${GOOGLE_DRIVE_API_BASE}/files?q=name='${DATA_FILE_NAME}' and parents in '${folderId}' and trashed=false`;
      const response = await this.makeRequest(searchUrl);
      const data = await response.json();

      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }

      return null;
    } catch (error) {
      console.error('❌ Error finding data file:', error);
      return null;
    }
  }

  async saveStudents(students: Student[]): Promise<void> {
    try {
      console.log('💾 Saving data to Google Drive...');
      
      const folderId = await this.findOrCreateFolder();
      const existingFileId = await this.findDataFile(folderId);

      const dataToSave = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        students: students,
        metadata: {
          totalStudents: students.length,
          totalGoals: students.reduce((sum, student) => sum + student.goals.length, 0),
          lastModified: new Date().toISOString(),
        }
      };

      const fileContent = JSON.stringify(dataToSave, null, 2);
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      let metadata: any = {
        name: DATA_FILE_NAME,
      };

      if (!existingFileId) {
        metadata.parents = [folderId];
      }

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        close_delim;

      const url = existingFileId 
        ? `${GOOGLE_UPLOAD_API_BASE}/files/${existingFileId}?uploadType=multipart`
        : `${GOOGLE_UPLOAD_API_BASE}/files?uploadType=multipart`;

      const response = await fetch(url, {
        method: existingFileId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartRequestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ Data ${existingFileId ? 'updated' : 'saved'} to Google Drive:`, result.id);
      
    } catch (error) {
      console.error('❌ Error saving to Google Drive:', error);
      throw new Error('Failed to save student data to Google Drive: ' + (error as Error).message);
    }
  }

  async loadStudents(): Promise<Student[]> {
    try {
      console.log('📥 Loading data from Google Drive...');
      
      const folderId = await this.findOrCreateFolder();
      const fileId = await this.findDataFile(folderId);

      if (!fileId) {
        console.log('ℹ️ No data file found in Google Drive');
        return [];
      }

      const downloadUrl = `${GOOGLE_DRIVE_API_BASE}/files/${fileId}?alt=media`;
      const response = await this.makeRequest(downloadUrl);
      const dataText = await response.text();
      const parsedData = JSON.parse(dataText);

      if (parsedData.students && Array.isArray(parsedData.students)) {
        console.log(`✅ Loaded ${parsedData.students.length} students from Google Drive`);
        return parsedData.students;
      } else {
        console.warn('⚠️ Invalid data format in Google Drive file');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading from Google Drive:', error);
      throw new Error('Failed to load student data from Google Drive: ' + (error as Error).message);
    }
  }

  async exportStudents(students: Student[], fileName?: string): Promise<void> {
    try {
      console.log('📤 Exporting data to Google Drive...');
      
      const folderId = await this.findOrCreateFolder();
      const exportFileName = fileName || `iep-export-${new Date().toISOString().split('T')[0]}.json`;

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

      const fileContent = JSON.stringify(exportData, null, 2);
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const metadata = {
        name: exportFileName,
        parents: [folderId],
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        close_delim;

      const response = await fetch(`${GOOGLE_UPLOAD_API_BASE}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartRequestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Data exported to Google Drive:', result.id);
      
    } catch (error) {
      console.error('❌ Error exporting to Google Drive:', error);
      throw new Error('Failed to export student data to Google Drive: ' + (error as Error).message);
    }
  }

  async createBackup(): Promise<void> {
    try {
      const students = await this.loadStudents();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.json`;
      await this.exportStudents(students, backupFileName);
      console.log('✅ Backup created in Google Drive');
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      throw new Error('Failed to create backup in Google Drive');
    }
  }

  async getFolderInfo(): Promise<{ folderId: string; fileCount: number; lastModified: string | null }> {
    try {
      const folderId = await this.findOrCreateFolder();
      
      // Get files in folder
      const searchUrl = `${GOOGLE_DRIVE_API_BASE}/files?q=parents in '${folderId}' and trashed=false&fields=files(id,name,modifiedTime)`;
      const response = await this.makeRequest(searchUrl);
      const data = await response.json();

      const files = data.files || [];
      const dataFile = files.find((file: any) => file.name === DATA_FILE_NAME);
      
      return {
        folderId,
        fileCount: files.length,
        lastModified: dataFile?.modifiedTime || null
      };
    } catch (error) {
      console.error('❌ Error getting folder info:', error);
      return {
        folderId: '',
        fileCount: 0,
        lastModified: null
      };
    }
  }

  async deleteAllData(): Promise<void> {
    try {
      console.log('🗑️ Deleting all data from Google Drive...');
      
      const folderId = await this.findOrCreateFolder();
      
      // Get all files in folder
      const searchUrl = `${GOOGLE_DRIVE_API_BASE}/files?q=parents in '${folderId}' and trashed=false`;
      const response = await this.makeRequest(searchUrl);
      const data = await response.json();

      const files = data.files || [];
      
      // Delete each file
      for (const file of files) {
        const deleteUrl = `${GOOGLE_DRIVE_API_BASE}/files/${file.id}`;
        await this.makeRequest(deleteUrl, { method: 'DELETE' });
        console.log(`🗑️ Deleted file: ${file.name}`);
      }

      console.log('✅ All data deleted from Google Drive');
    } catch (error) {
      console.error('❌ Error deleting data from Google Drive:', error);
      throw new Error('Failed to delete data from Google Drive');
    }
  }
}
