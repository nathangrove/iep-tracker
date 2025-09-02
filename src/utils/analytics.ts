import { ReportHandler } from 'web-vitals';

// Configuration
const GA_MEASUREMENT_ID = 'G-2VMLDJJLVX'; // Your GA4 Measurement ID

// Enhanced Google Analytics integration
export const sendToGoogleAnalytics: ReportHandler = ({ name, delta, value, id }) => {
  // Only send in production
  if (process.env.NODE_ENV !== 'production') return;

  // Send to Google Analytics 4 (gtag)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
      custom_map: { metric_id: id }
    });

    // Also send as custom event for better tracking
    (window as any).gtag('event', 'web_vitals_measurement', {
      metric_name: name,
      metric_value: value,
      metric_delta: delta,
      metric_id: id,
      performance_status: getPerformanceStatus(name, value).message
    });
  }

  // Console log for debugging (even in production for now)
  console.log(`📊 ${name}: ${value} (${getPerformanceStatus(name, value).emoji} ${getPerformanceStatus(name, value).message})`);
};

// Track custom events for IEP Tracker
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      event_category: 'IEP Tracker',
      ...parameters
    });
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Event: ${eventName}`, parameters);
  }
};

// IEP Tracker specific events
export const analytics = {
  // Student Management
  studentAdded: () => trackEvent('student_added'),
  studentDeleted: () => trackEvent('student_deleted'),
  
  // Goal Management  
  goalAdded: () => trackEvent('goal_added'),
  goalDeleted: () => trackEvent('goal_deleted'),
  
  // Assessment Tracking
  assessmentRecorded: (result: 'pass' | 'fail') => trackEvent('assessment_recorded', { result }),
  
  // Notes
  noteAdded: () => trackEvent('note_added'),
  noteEdited: () => trackEvent('note_edited'),
  noteDeleted: () => trackEvent('note_deleted'),
  
  // Reports
  reportGenerated: (type: 'individual' | 'all_students') => trackEvent('report_generated', { report_type: type }),
  reportPrinted: (type: 'individual' | 'all_students') => trackEvent('report_printed', { report_type: type }),
  
  // Data Management
  dataExported: () => trackEvent('data_exported'),
  dataImported: () => trackEvent('data_imported'),
  
  // Authentication
  userLoggedIn: () => trackEvent('user_logged_in'),
  userLoggedOut: () => trackEvent('user_logged_out'),
  
  // Help & Engagement
  helpModalOpened: () => trackEvent('help_modal_opened'),
  featureUsed: (feature: string) => trackEvent('feature_used', { feature_name: feature })
};

// Send to custom analytics endpoint (for future use)
export const sendToCustomAnalytics: ReportHandler = ({ name, delta, value, id }) => {
  if (process.env.NODE_ENV !== 'production') return;

  // Send to your custom analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metric: name,
      value,
      delta,
      id,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }),
  }).catch(console.error);
};

// Development-friendly logger with better formatting
export const developmentLogger: ReportHandler = ({ name, delta, value, id }) => {
  const status = getPerformanceStatus(name, value);
  console.group(`🔍 Web Vital: ${name}`);
  console.log(`📊 Value: ${value}ms`);
  console.log(`📈 Delta: ${delta}ms`);
  console.log(`🆔 ID: ${id}`);
  console.log(`✅ Status: ${status.emoji} ${status.message}`);
  console.log(`💡 ${getPerformanceTip(name, value)}`);
  console.groupEnd();
};

// Helper function to determine performance status
function getPerformanceStatus(name: string, value: number) {
  const thresholds = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FID: { good: 100, needsImprovement: 300 },
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 600, needsImprovement: 1500 },
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return { emoji: '❓', message: 'Unknown metric' };

  if (value <= threshold.good) {
    return { emoji: '🟢', message: 'Good' };
  } else if (value <= threshold.needsImprovement) {
    return { emoji: '🟡', message: 'Needs Improvement' };
  } else {
    return { emoji: '🔴', message: 'Poor' };
  }
}

// Performance improvement tips
function getPerformanceTip(name: string, value: number): string {
  const tips = {
    CLS: 'Consider using CSS dimensions for images and avoiding dynamic content insertion',
    FID: 'Optimize JavaScript execution and consider code splitting',
    FCP: 'Optimize critical rendering path and reduce render-blocking resources',
    LCP: 'Optimize largest element loading (images, videos, text blocks)',
    TTFB: 'Improve server response time and consider CDN usage'
  };
  
  return tips[name as keyof typeof tips] || 'Monitor this metric regularly for trends';
}

// Initialize analytics
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // Set up enhanced ecommerce for better tracking
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      custom_map: { metric_id: 'custom_metric_1' },
      send_page_view: true
    });
    
    console.log('📈 Analytics initialized successfully');
  }
};
