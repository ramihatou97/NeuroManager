import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ORCase, EPADefinition, EPAssignment, Resident } from '../../../../shared/types'; // Adjust path as needed

const db = admin.firestore();

/**
 * =================================================================================
 * EPA ASSIGNMENT ENGINE - FULL IMPLEMENTATION
 * Triggered when an OR case is finalized with an assigned resident. This function
 * matches the case to relevant EPAs and creates assignments.
 * =================================================================================
 */
export const onORCaseFinalized = functions.firestore
  .document('orCases/{caseId}')
  .onCreate(async (snap, context) => {
    const caseData = snap.data() as ORCase;
    const { assignedResidentIds, procedureName, caseId, primarySurgeonId } = caseData;

    if (!assignedResidentIds || assignedResidentIds.length === 0) {
      console.log(`No residents assigned to OR Case ${caseId}. Exiting.`);
      return null;
    }

    functions.logger.log(`Matching EPAs for OR case: ${caseId} (${procedureName})`);

    try {
      // 1. Fetch all EPA definitions from Firestore in one go.
      const epaDefsSnapshot = await db.collection('epaDefinitions').get();
      const allEpaDefs = epaDefsSnapshot.docs.map(doc => doc.data() as EPADefinition);

      // 2. Process each assigned resident.
      for (const residentId of assignedResidentIds) {
        // Find all EPAs that match the procedure's keywords.
        const matchedEpas = allEpaDefs.filter(def => 
          def.procedureKeywords.some(kw => procedureName.toLowerCase().includes(kw.toLowerCase()))
        );

        if (matchedEpas.length === 0) {
          console.log(`No matching EPAs found for resident ${residentId} in case ${caseId}.`);
          continue;
        }

        const batch = db.batch();
        for (const epa of matchedEpas) {
          // 3. Check if the resident still needs to complete this EPA.
          const needsEpa = await residentNeedsEpa(residentId, epa.id, epa.minObservations);
          
          if (needsEpa) {
            // 4. Create a new EPAssignment document.
            const epaAssignmentRef = db.collection('epas').doc();
            const newAssignment: Omit<EPAssignment, 'id'> = {
              residentId,
              epaId: epa.id,
              caseId: caseId,
              assessorId: primarySurgeonId,
              status: 'Assigned',
              dueDate: admin.firestore.Timestamp.fromMillis(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
            };
            batch.set(epaAssignmentRef, newAssignment);
            functions.logger.log(`Assigned EPA ${epa.id} to resident ${residentId} for case ${caseId}.`);
          }
        }
        await batch.commit();
      }
    } catch (error) {
      functions.logger.error(`Failed to process EPAs for case ${caseId}:`, error);
    }
    return null;
  });

/**
 * Checks if a resident has already completed the required number of observations for a given EPA.
 */
async function residentNeedsEpa(residentId: string, epaId: string, requiredCount: number): Promise<boolean> {
    const existingAssignments = await db.collection('epas')
        .where('residentId', '==', residentId)
        .where('epaId', '==', epaId)
        .where('status', '==', 'Completed')
        .get();
        
    return existingAssignments.size < requiredCount;
}
