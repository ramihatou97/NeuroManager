import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resident, CallAssignment, ORAssignment, EPAssignment, AnalyticsReport, LeaveRequest } from '../../../../shared/types'; // Adjust path

const db = admin.firestore();

// The AnalyticsReport type in shared/types.ts would be updated to include:
// predictiveMetrics: {
//   projectedMonthlyORHours: number;
//   residentsAtRiskEpaCompletion: { residentId: string; residentName: string; projectedCompletionRate: number; }[];
// }

/**
 * =================================================================================
 * SCALABLE TIME-SERIES & PREDICTIVE ANALYTICS REPORT GENERATOR - FINAL IMPLEMENTATION
 * An on-demand function that generates historical and predictive reports
 * for specific time periods, ensuring performance at scale.
 * =================================================================================
 */
export const generateAnalyticsReport = functions.https.onCall(async (data, context) => {
    const period = data.period || 'weekly';
    console.log(`📈 Starting scalable ${period} analytics report generation...`);

    const endDate = new Date();
    let startDate = new Date();
    // ... (date range logic remains the same)

    // 2. Fetch all necessary raw data using SCALABLE, TIME-SCOPED QUERIES
    const residents = await fetchCollection('residents') as Resident[];
    const leaveRequests = await fetchDocumentsInRange('leaveRequests', 'startDate', startDate, endDate) as LeaveRequest[];
    const callAssignments = await fetchAssignmentsFromNestedDocs('monthlySchedules', 'assignments', startDate, endDate) as CallAssignment[];
    const orAssignments = await fetchAssignmentsFromNestedDocs('weeklySchedules', 'or', startDate, endDate) as ORAssignment[];
    const epaAssignments = await fetchCollection('epas') as EPAssignment[];

    // 3. Perform calculations for each resident for the period
    const residentMetrics = residents.map(resident => {
        // ... (calculation logic remains the same)
        return { /* ... resident metrics ... */ };
    });

    // 4. Calculate program-wide metrics for the period
    const callDistribution = residentMetrics.map(r => r.totalCalls);
    const fairnessGini = calculateGini(callDistribution);
    // ... (leave analytics logic remains the same)

    // **NEW**: 5. Generate Predictive Analytics
    const predictiveMetrics = generatePredictions(residentMetrics, orAssignments, startDate, endDate);

    // 6. Assemble the final report object
    const report: AnalyticsReport = {
        id: `report-${period}-${new Date().toISOString().slice(0, 10)}`,
        // ... (other report fields remain the same)
        overallMetrics: {
            // ... (historical metrics)
        },
        residentMetrics,
        predictiveMetrics // **NEW**: Add predictions to the report
    };

    // 7. Save the report to Firestore
    await db.collection('analyticsReports').doc(report.id).set(report);
    console.log(`✅ Scalable ${period} analytics report ${report.id} generated successfully.`);
    return { success: true, reportId: report.id };
});

/**
 * =================================================================================
 * PREDICTIVE ANALYTICS HELPERS
 * =================================================================================
 */

/**
 * Generates simple forecasts based on historical data from the reporting period.
 */
function generatePredictions(residentMetrics: any[], orAssignments: ORAssignment[], startDate: Date, endDate: Date) {
    // Prediction 1: Project future OR volume
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const totalORHoursInPeriod = residentMetrics.reduce((sum, r) => sum + r.totalORHours, 0);
    const averageDailyORHours = totalORHoursInPeriod / daysInPeriod;
    const projectedMonthlyORHours = parseFloat((averageDailyORHours * 30).toFixed(1));

    // Prediction 2: Forecast EPA completion for residents
    const academicYearProgress = getAcademicYearProgress(); // e.g., 0.25 for 25% through the year
    const residentsAtRiskEpaCompletion = residentMetrics.filter(res => {
        if (academicYearProgress === 0 || res.epasAssigned === 0) return false;
        const currentCompletionRate = res.epasCompleted / res.epasAssigned;
        // Simple linear projection: if current completion rate is lagging significantly
        // behind the progress through the year, flag as at risk.
        return currentCompletionRate < (academicYearProgress * 0.8); // At risk if <80% of target rate
    }).map(res => ({
        residentId: res.residentId,
        residentName: res.residentName,
        projectedCompletionRate: parseFloat((res.epasCompleted / res.epasAssigned / academicYearProgress).toFixed(2))
    }));

    return {
        projectedMonthlyORHours,
        residentsAtRiskEpaCompletion
    };
}

function getAcademicYearProgress(): number {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(now.getMonth() >= 6 ? year : year - 1, 6, 1); // July 1st
    const end = new Date(now.getMonth() >= 6 ? year + 1 : year, 5, 30); // June 30th
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return elapsed / totalDuration;
}


// =================================================================================
// SCALABLE DATA FETCHING HELPERS (Unchanged)
// =================================================================================
async function fetchDocumentsInRange(collectionName: string, dateField: string, startDate: Date, endDate: Date): Promise<any[]> { /* ... */ return []; }
async function fetchAssignmentsFromNestedDocs(collectionName: string, assignmentKey: string, startDate: Date, endDate: Date): Promise<any[]> { /* ... */ return []; }
function getDocIdsForDateRange(startDate: Date, endDate: Date, collectionName: string): string[] { /* ... */ return []; }
async function fetchCollection(collectionName: string): Promise<any[]> { /* ... */ return []; }
function calculateGini(data: number[]): number { /* ... */ return 0; }
function getWeekNumber(d: Date): number { /* ... */ return 1; }
