# IEP Tracker

A secure, privacy-focused IEP (Individualized Education Program) tracking system that stores all data in your organization's Google Drive.

## 🔒 Privacy & Security

- **FERPA Compliant**: All student data stored in your organization's Google Drive
- **No External Servers**: Data never leaves your Google ecosystem
- **Organizational Accounts Only**: Requires school district Google accounts

## 🚀 Features

- **Student Management**: Add, edit, and delete student profiles
- **Goal Tracking**: Create and monitor IEP goals with customizable frequencies
- **Assessment Recording**: Track daily, weekly, monthly assessments
- **Progress Reports**: Generate comprehensive reports with visual progress graphs
- **Print Functionality**: Professional print-ready reports for meetings
- **Cloud Sync**: Automatic backup to Google Drive
- **Weekend Awareness**: Smart scheduling that excludes weekends for daily assessments

## 🌐 Live Demo

Visit the live application: [https://yourusername.github.io/iep-tracking](https://yourusername.github.io/iep-tracking)

## 🛠️ Setup for Your Organization

### 1. Fork or Clone This Repository

```bash
git clone https://github.com/yourusername/iep-tracking.git
cd iep-tracking
npm install
```

### 2. Configure Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials
5. Add your GitHub Pages domain to authorized origins
6. Update the `GOOGLE_CLIENT_ID` in `src/App.tsx`

### 3. Deploy to GitHub Pages

#### Option A: Automatic Deployment (Recommended)

1. Push your code to the `main` branch
2. Go to your repository's Settings → Pages
3. Set Source to "GitHub Actions"
4. The app will automatically deploy on every push to main

#### Option B: Manual Deployment

```bash
npm run deploy
```

### 4. Update Configuration

1. Update the `homepage` field in `package.json` with your GitHub Pages URL
2. Update the repository name in the workflow file if needed

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/                 # Google OAuth authentication
│   ├── StudentList/          # Student listing and management
│   ├── StudentDetail/        # Individual student view
│   ├── StudentReport/        # Progress reports and printing
│   └── DataManagement/       # Import/export functionality
├── context/
│   └── GoogleDriveContext.tsx # Google Drive integration
├── utils/
│   ├── fileStorage.ts        # Data persistence layer
│   ├── googleDriveStorage.ts # Google Drive API wrapper
│   └── dateUtils.ts          # Business day calculations
├── types.ts                  # TypeScript type definitions
└── App.tsx                   # Main application component
```

## 🔧 Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Deploy to GitHub Pages
npm run deploy
```

## 📊 Assessment Frequency Options

- **Daily**: Every business day (excludes weekends)
- **Weekly**: Every 7 days
- **Bi-weekly**: Every 14 days
- **Monthly**: Every 30 days
- **Quarterly**: Every 90 days
- **Custom**: User-defined interval

## 🖨️ Printing Features

- Individual student reports
- Batch printing for all students
- Print-optimized layouts
- Page breaks between students
- Professional formatting

## 🔐 Google Drive Integration

- Data stored in `.iep-tracker-data` folder
- Automatic sync on data changes
- Fallback to localStorage if offline
- Organizational account required

## 📋 Requirements

- Node.js 16 or higher
- School district Google account
- Modern web browser
- Internet connection for Google Drive sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- **Use organizational Google accounts only**
- **This is for educational use in compliance with FERPA**
- **Data privacy is maintained within your Google organization**
- **No external data storage or tracking**

## 🆘 Support

For issues or questions:
1. Check the GitHub Issues page
2. Create a new issue with detailed information
3. Include browser and environment details

---

Built with ❤️ for educators and special education professionals.
