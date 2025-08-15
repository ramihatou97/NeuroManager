rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check for admin role
    function isAdmin() {
      return get(/databases/$(database)/documents/admins/$(request.auth.uid)).exists;
    }

    // Residents can read their own data
    match /residents/{residentId} {
      allow read, write: if request.auth.uid == residentId || isAdmin();
    }

    // Configuration is read-only for users, writable by admins
    match /configuration/{docId} {
      allow read: if request.auth.uid != null;
      allow write: if isAdmin();
    }

    // Schedules are readable by all authenticated users, writable only by admins
    match /academicYears/{yearId} {
      allow read: if request.auth.uid != null;
      allow write: if isAdmin();
    }
    match /monthlySchedules/{monthId} {
      allow read: if request.auth.uid != null;
      allow write: if isAdmin();
    }
    match /weeklySchedules/{weekId} {
      allow read: if request.auth.uid != null;
      allow write: if isAdmin();
    }

    // Leave requests
    match /leaveRequests/{requestId} {
      allow create: if request.auth.uid == request.resource.data.residentId;
      allow read: if request.auth.uid == resource.data.residentId || isAdmin();
      allow update: if isAdmin(); // Only admins can approve/deny
    }

    // Leave analysis reports are read-only except for functions
    match /leaveAnalysisReports/{reportId} {
      allow read: if isAdmin();
      allow write: if false; // Only backend functions can write
    }
    
    // Conflict tickets are for admins
    match /conflictTickets/{ticketId} {
        allow read, write: if isAdmin();
    }
  }
}
