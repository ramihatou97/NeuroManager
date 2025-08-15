import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import * as fs from "fs";

// Setup the test environment
let testEnv;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "medishift-test",
        firestore: {
            rules: fs.readFileSync("firestore.rules", "utf8"),
            host: "localhost",
            port: 8080,
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

// A test case for the vacation analysis trigger
test('should trigger analysis and create a report when a new leave request is created', async () => {
    // Get a Firestore instance for a specific user (e.g., a resident)
    const residentId = "drChen";
    const residentDb = testEnv.authenticatedContext(residentId).firestore();

    // 1. SETUP: Create the initial LeaveRequest document in the test database.
    const leaveRequestId = "leave123";
    const leaveRequestRef = doc(residentDb, "leaveRequests", leaveRequestId);
    await setDoc(leaveRequestRef, {
        residentId: residentId,
        type: 'Personal',
        status: 'Pending Analysis',
        // ... other fields
    });

    // 2. TRIGGER: In a real test runner, the Firebase Function emulator would
    // automatically detect the creation of this document and run the `analyzeLeaveRequest` function.
    // We will simulate waiting for this to happen.
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for the function to execute

    // 3. VERIFICATION: Check if the function did its job correctly.
    // Use an admin context to read the results, since residents can't read reports.
    const adminDb = testEnv.unauthenticatedContext().firestore();
    
    // Check that the original request was updated
    const updatedRequestSnap = await getDoc(doc(adminDb, "leaveRequests", leaveRequestId));
    const updatedRequestData = updatedRequestSnap.data();
    
    expect(updatedRequestData.status).toBe('Pending Approval');
    expect(updatedRequestData.analysisReportId).toBeDefined();

    // Check that the new analysis report was created
    const reportId = updatedRequestData.analysisReportId;
    const reportSnap = await getDoc(doc(adminDb, "leaveAnalysisReports", reportId));
    
    expect(reportSnap.exists()).toBe(true);
    expect(reportSnap.data().requestId).toBe(leaveRequestId);
    expect(reportSnap.data().overallRecommendation).toBeDefined();
});
