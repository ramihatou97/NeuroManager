import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { LeaveRequest, EPAssignment, ConflictResolutionTicket, MonthlySchedule } from '../../../../shared/types'; // Adjust path

const db = admin.firestore();

// ===================================================================
// Central Notification Creation Service
// In a real app, this is where you would also integrate email (SendGrid)
// or push notification (FCM) services.
// ===================================================================
async function createNotification(
    recipientId: string,
    title: string,
    message: string,
    type: 'LeaveRequest' | 'EPA' | 'Conflict' | 'Schedule',
    linkTo?: string
): Promise<void> {
    const notificationRef = db.collection('notifications').doc();
    const newNotification = {
        id: notificationRef.id,
        recipientId,
        title,
        message,
        type,
        linkTo: linkTo || '',
        isRead: false,
        createdAt: admin.firestore.Timestamp.now(),
    };

    await notificationRef.set(newNotification);
    console.log(`Notification created for ${recipientId}: ${title}`);
}


// ===================================================================
// NOTIFICATION TRIGGERS
// These functions listen for events and trigger notifications.
// ===================================================================

/**
 * Sends a notification when a leave request is approved or denied.
 */
export const onLeaveRequestStatusChange = functions.firestore
    .document('leaveRequests/{requestId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data() as LeaveRequest;
        const after = change.after.data() as LeaveRequest;

        if (before.status === after.status) {
            return null; // No status change
        }

        let title = '';
        let message = '';

        if (after.status === 'Approved') {
            title = 'Vacation Request Approved';
            message = `Your ${after.type} leave request from ${after.startDate.toDate().toLocaleDateString()} has been approved.`;
        } else if (after.status === 'Denied') {
            title = 'Vacation Request Denied';
            message = `Your ${after.type} leave request was denied. Reason: ${after.denialJustification}`;
        }

        if (title) {
            await createNotification(after.residentId, title, message, 'LeaveRequest', `/vacation/${after.id}`);
        }
        
        return null;
    });

/**
 * Sends a notification to a resident when a new EPA is assigned to them.
 */
export const onEpaAssigned = functions.firestore
    .document('epas/{epaId}')
    .onCreate(async (snap, context) => {
        const epa = snap.data() as EPAssignment;
        
        const title = 'New EPA Assigned';
        const message = `An EPA for "${epa.epaId}" has been assigned to you based on a recent clinical case.`;

        await createNotification(epa.residentId, title, message, 'EPA', `/epas/${epa.id}`);
        return null;
    });

/**
 * Sends a notification to all admins when a schedule conflict is detected.
 */
export const onConflictDetected = functions.firestore
    .document('conflictTickets/{ticketId}')
    .onCreate(async (snap, context) => {
        const ticket = snap.data() as ConflictResolutionTicket;
        
        const title = 'Action Required: Schedule Conflict';
        const message = `${ticket.residentName}'s approved vacation now conflicts with a published schedule. Please resolve.`;

        // In a real app, you would fetch all admin user IDs
        const adminIds = ['admin1', 'admin2']; 
        
        for (const adminId of adminIds) {
            await createNotification(adminId, title, message, 'Conflict', `/admin/conflicts/${ticket.id}`);
        }
        return null;
    });
