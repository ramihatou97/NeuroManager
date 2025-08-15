import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK once
admin.initializeApp();

// ===================================================================
// EXPORT ALL CLOUD FUNCTIONS FOR DEPLOYMENT
// ===================================================================

// --- Vacation & Leave System ---
export { analyzeLeaveRequest } from './vacation/vacation-analyzer';
export { nightlyConflictAudit } from './auditing/conflict-detector';

// --- Education System ---
export { onORCaseFinalized } from './education/epaHandler';

// --- Scheduling System (On-Demand Triggers) ---
// These would be callable functions triggered by the admin UI.
// Example:
// export { generateYearlySchedule } from './scheduling/yearly-scheduler-callable';
// export { generateMonthlySchedule } from './scheduling/monthly-scheduler-callable';
// export { generateWeeklySchedule } from './scheduling/weekly-scheduler-callable';

// Note: The actual scheduler classes (YearlyScheduleEngine, etc.) would be imported
// and used within these callable functions.
