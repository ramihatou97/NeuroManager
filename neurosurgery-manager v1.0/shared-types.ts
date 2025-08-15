import { Timestamp } from 'firebase/firestore';

// ===================================================================
// 1. CORE & SHARED ENTITIES
// ===================================================================

export interface Resident {
  id: string;
  name: string;
  pgyLevel: number;
  email: string;
  specialty: 'Neurosurgery' | 'Plastics' | 'Orthopedics';
  onService: boolean;
  isChief: boolean;
  callExempt: boolean;
}

export interface ExternalRotator {
    id: string;
    name: string;
    homeService: string;
    pgyLevel: number;
    isEligibleForCall: boolean;
    assignedBlock: number;
}

export interface AppConfiguration {
  coverageRules: {
    rotationBlock: any[];
    weekday: any[];
  };
  monthlySchedulerConfig: {
    callRatios: Record<string, number>;
    paroHardCaps: any[];
    maxWeekendsPerRotation: number;
  };
  // ... other config sections
}

// ===================================================================
// 2. YEARLY ROTATION SCHEDULER (The Planner)
// ===================================================================

export interface AcademicYear {
  id: string; // "YYYY-YYYY"
  blocks: RotationBlock[];
}

export interface RotationBlock {
  blockNumber: number;
  startDate: Timestamp;
  endDate: Timestamp;
  assignments: RotationAssignment[];
}

export interface RotationAssignment {
  residentId: string;
  rotationName: string;
  rotationType: 'CORE_NSX' | 'MANDATORY_OFF_SERVICE' | 'FLEXIBLE_OFF_SERVICE' | 'RESEARCH' | 'EXAM_LEAVE' | 'HOLIDAY_LEAVE';
  team?: 'Red' | 'Blue';
}

// ===================================================================
// 3. VACATION & LEAVE SYSTEM (The Handler & Auditor)
// ===================================================================

export interface LeaveRequest {
  id: string;
  residentId: string;
  type: 'Personal' | 'Professional' | 'LieuDay' | 'Compassionate';
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'Pending Analysis' | 'Pending Approval' | 'Approved' | 'Denied' | 'ApprovedWithConflict';
  analysisReportId?: string;
  conflictTicketId?: string;
  denialJustification?: string;
}

export interface LeaveAnalysisReport {
  id:string;
  requestId: string;
  overallRecommendation: 'Approve' | 'Flagged for Review' | 'Deny';
  denialReason?: string;
  estimatedCoverageImpact: {
    projectedCoverageRisk: 'Low' | 'Medium' | 'High';
  };
  fairnessScore: {
    score: number;
    historicalSuccessRateForPeriod: number;
  };
}

export interface ConflictResolutionTicket {
    id: string;
    leaveRequestId: string;
    residentId: string;
    conflictingAssignments: any[];
    status: 'Open' | 'Resolved';
}

// ===================================================================
// 4. MONTHLY & WEEKLY SCHEDULERS (The Execution Layers)
// ===================================================================

export interface MonthlySchedule {
    id: string; // "YYYY-MM"
    assignments: CallAssignment[];
}

export interface CallAssignment {
    residentId: string;
    date: Timestamp;
    type: 'Day' | 'Night' | 'Weekend' | '24h' | 'Backup' | 'PostCall';
}

export interface WeeklySchedule {
    id: string; // "YYYY-WW"
    days: DailySchedule[];
}

export interface DailySchedule {
    date: Timestamp;
    assignments: {
        or: any[];
        clinic: any[];
        call: CallAssignment[];
    }
}
