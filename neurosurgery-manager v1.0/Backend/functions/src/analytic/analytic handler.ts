import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resident, CallAssignment, ORAssignment, EPAssignment, AnalyticsReport, LeaveRequest } from '../../../../shared/types'; // Adjust path

const db = admin.firestore();

// The AnalyticsReport type in shared/types.ts would need to be updated to include all these fields:
// export interface AnalyticsReport {
//   id: string;
//   generatedDate: Timestamp;
//   period: 'weekly' | 'monthly' | 'quarterly';
//   startDate: Timestamp;
//   endDate: Timestamp;
//   overallMetrics: {
//     totalResidents: number;
//     totalCallsScheduled: number;
//     totalORHours: number;
//     callFairnessGini: number;
//     totalLeaveRequests: number;
//     leaveDenialRate: number;
//     totalLieuDaysOwed: number;
//   };
//   residentMetrics: any[];
//   predictiveMetrics: {
//     projectedMonthlyORHours: number;
//     residentsAtRiskEpaCompletion: any[];
//   };
// }


/**
 * =================================================================================
 * SCALABLE TIME-SERIES & PREDICTIVE ANALYTICS REPORT GENERATOR - FINAL IMPLEMENTATION
 * An on-demand function that uses efficient, targeted queries to generate historical
 * and predictive reports for specific time periods.
 * =================================================================================
 */
export const generateAnalyticsReport = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated (and ideally an admin, which would be checked here)
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const period = data.period || 'weekly';
    console.log(`📈 Starting scalable ${period} analytics report generation...`);

    // 1. Determine the date range for the report
    const endDate = new Date();
    let startDate = new Date();
    if (period === 'weekly') {
        startDate.setDate(endDate.getDate() - 7);
    } else if (period === 'monthly') {
        startDate.setMonth(endDate.getMonth() - 1);
    } else if (period === 'quarterly') {
        startDate.setMonth(endDate.getMonth() - 3);
    }

    // 2. Fetch all necessary raw data using SCALABLE, TIME-SCOPED QUERIES
    const residents = await fetchCollection('residents') as Resident[];
    const leaveRequests = await fetchDocumentsInRange('leaveRequests', 'startDate', startDate, endDate) as LeaveRequest[];
    const callAssignments = await fetchAssignmentsFromNestedDocs('monthlySchedules', 'assignments', startDate, endDate) as CallAssignment[];
    const orAssignments = await fetchAssignmentsFromNestedDocs('weeklySchedules', 'or', startDate, endDate) as ORAssignment[];
    const epaAssignments = await fetchCollection('epas') as EPAssignment[]; // EPAs are cumulative

    // 3. Perform calculations for each resident for the period
    const residentMetrics = residents.map(resident => {
        const residentCalls = callAssignments.filter(c => c.residentId === resident.id);
        const residentORs = orAssignments.filter(o => o.residentId === resident.id);
        const residentEPAs = epaAssignments.filter(e => e.residentId === resident.id);

        return {
            residentId: resident.id,
            residentName: resident.name,
            pgyLevel: resident.pgyLevel,
            totalCalls: residentCalls.length,
            weekendCalls: residentCalls.filter(c => c.type === 'Weekend').length,
            totalORHours: residentORs.reduce((sum, or) => sum + (or.duration || 120), 0) / 60,
            spineCaseHours: residentORs.filter(o => o.isSpineCase).reduce((sum, or) => sum + (or.duration || 120), 0) / 60,
            epasCompleted: residentEPAs.filter(e => e.status === 'Completed').length,
            epasAssigned: residentEPAs.length,
        };
    });

    // 4. Calculate program-wide metrics for the period
    const callDistribution = residentMetrics.map(r => r.totalCalls);
    const fairnessGini = calculateGini(callDistribution);
    
    const totalLeaveRequests = leaveRequests.length;
    const deniedRequests = leaveRequests.filter(r => r.status === 'Denied').length;
    const leaveDenialRate = totalLeaveRequests > 0 ? parseFloat(((deniedRequests / totalLeaveRequests) * 100).toFixed(1)) : 0;
    const residentProfiles = await fetchCollection('residentProfiles'); 
    const totalLieuDaysOwed = residentProfiles.reduce((sum, profile) => sum + (profile.lieuDaysOwed || 0), 0);

    // 5. Generate Predictive Analytics
    const predictiveMetrics = generatePredictions(residentMetrics, orAssignments, startDate, endDate);

    // 6. Assemble the final report object
    const report: AnalyticsReport = {
        id: `report-${period}-${new Date().toISOString().slice(0, 10)}`,
        generatedDate: admin.firestore.Timestamp.now(),
        period: period,
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        overallMetrics: {
            totalResidents: residents.length,
            totalCallsScheduled: callAssignments.length,
            totalORHours: residentMetrics.reduce((sum, r) => sum + r.totalORHours, 0),
            callFairnessGini: fairnessGini,
            totalLeaveRequests: totalLeaveRequests,
            leaveDenialRate: leaveDenialRate,
            totalLieuDaysOwed: totalLieuDaysOwed,
        },
        residentMetrics,
        predictiveMetrics
    };

    // 7. Save the report to Firestore
    await db.collection('analyticsReports').doc(report.id).set(report);
    console.log(`✅ Scalable ${period} analytics report ${report.id} generated successfully.`);
    return { success: true, reportId: report.id, reportData: report };
});

/**
 * Generates simple forecasts based on historical data from the reporting period.
 */
function generatePredictions(residentMetrics: any[], orAssignments: ORAssignment[], startDate: Date, endDate: Date) {
    const daysInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const totalORHoursInPeriod = residentMetrics.reduce((sum, r) => sum + r.totalORHours, 0);
    const averageDailyORHours = daysInPeriod > 0 ? totalORHoursInPeriod / daysInPeriod : 0;
    const projectedMonthlyORHours = parseFloat((averageDailyORHours * 30).toFixed(1));

    const academicYearProgress = getAcademicYearProgress();
    const residentsAtRiskEpaCompletion = residentMetrics.filter(res => {
        if (academicYearProgress === 0 || res.epasAssigned === 0) return false;
        const currentCompletionRate = res.epasCompleted / res.epasAssigned;
        return currentCompletionRate < (academicYearProgress * 0.8);
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

// =================================================================================
// SCALABLE DATA FETCHING HELPERS
// =================================================================================

async function fetchDocumentsInRange(collectionName: string, dateField: string, startDate: Date, endDate: Date): Promise<any[]> {
    const snapshot = await db.collection(collectionName)
        .where(dateField, '>=', startDate)
        .where(dateField, '<=', endDate)
        .get();
    return snapshot.docs.map(doc => doc.data());
}

async function fetchAssignmentsFromNestedDocs(collectionName: string, assignmentKey: string, startDate: Date, endDate: Date): Promise<any[]> {
    const docIds = getDocIdsForDateRange(startDate, endDate, collectionName);
    if (docIds.length === 0) return [];

    const docRefs = docIds.map(id => db.collection(collectionName).doc(id));
    const docSnapshots = await db.getAll(...docRefs);
    
    let allAssignments: any[] = [];
    docSnapshots.forEach(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (collectionName === 'weeklySchedules') {
                const weeklyAssignments = data.days?.flatMap((d: any) => d.assignments[assignmentKey]) || [];
                allAssignments.push(...weeklyAssignments);
            } else {
                allAssignments.push(...(data.assignments || []));
            }
        }
    });

    return allAssignments.filter(a => 
        a.date && a.date.toDate() >= startDate && a.date.toDate() <= endDate
    );
}

// =================================================================================
// UTILITY FUNCTIONS
// =================================================================================

async function fetchCollection(collectionName: string): Promise<any[]> {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => doc.data());
}

function getDocIdsForDateRange(startDate: Date, endDate: Date, collectionName: string): string[] {
    const ids = new Set<string>();
    let current = new Date(startDate);
    
    while (current <= endDate) {
        const year = current.getFullYear();
        if (collectionName === 'monthlySchedules') {
            const month = (current.getMonth() + 1).toString().padStart(2, '0');
            ids.add(`${year}-${month}`);
            current.setMonth(current.getMonth() + 1);
        } else { // weeklySchedules
            const week = getWeekNumber(current);
            ids.add(`${year}-${week}`);
            current.setDate(current.getDate() + 7);
        }
    }
    return Array.from(ids);
}

function calculateGini(data: number[]): number {
    if (data.length === 0) return 0;
    const sorted = data.slice().sort((a, b) => a - b);
    const n = sorted.length;
    const sumOfRanks = sorted.reduce((sum, val, i) => sum + (i + 1) * val, 0);
    const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
    if (mean === 0) return 0;
    
    const gini = (2 * sumOfRanks) / (n * n * mean) - (n + 1) / n;
    return parseFloat(gini.toFixed(3));
}

function getWeekNumber(d: Date): number {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d.valueOf() - yearStart.valueOf()) / 86400000) + 1)/7);
    return weekNo;
}

function getAcademicYearProgress(): number {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(now.getMonth() >= 6 ? year : year - 1, 6, 1); // July 1st
    const end = new Date(now.getMonth() >= 6 ? year + 1 : year, 5, 30); // June 30th
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return totalDuration > 0 ? elapsed / totalDuration : 0;
}
