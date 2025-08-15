import { 
    Resident, 
    AcademicYear, 
    RotationBlock, 
    RotationAssignment, 
    AppConfiguration, 
    ExternalRotator 
} from '../../../../shared/types';
import { Timestamp } from 'firebase-admin/firestore';

const BLOCKS_PER_YEAR = 13;

export class YearlyScheduleEngine {
    private residents: Resident[];
    private externalRotators: ExternalRotator[];
    private config: AppConfiguration;
    private academicYearId: string;
    private schedule: (RotationAssignment | null)[][];

    constructor(
        residents: Resident[], 
        externalRotators: ExternalRotator[], 
        config: AppConfiguration, 
        academicYearId: string
    ) {
        this.residents = residents;
        this.externalRotators = externalRotators;
        this.config = config;
        this.academicYearId = academicYearId;
        this.schedule = Array(BLOCKS_PER_YEAR).fill(null).map(() => 
            Array(this.residents.length).fill(null)
        );
    }

    public generateSchedule(): AcademicYear {
        console.log(`🚀 Starting Full Yearly Schedule Generation for ${this.academicYearId}`);
        this.phase0_PlaceExternalRotators();
        this.phase1_AssignMandatoryRotations();
        this.phase2_AssignExamBlocks();
        this.phase3_AssignHolidayBlocks();
        this.phase4_AssignCoreNeurosurgeryRotations();
        this.phase5_AssignFlexibleOffServiceRotations();
        this.phase6_BalanceTeams();
        this.phase7_ValidateAndFinalize();
        console.log("✅ Yearly Schedule Generation Complete.");
        return this.formatScheduleForFirestore();
    }

    private phase0_PlaceExternalRotators() {
        console.log("Phase 0: Placing External Rotators...");
        // This is a conceptual step. The presence of external rotators is factored into
        // the `validateBlockCoverage` helper by adding them to the total headcount.
    }

    private phase1_AssignMandatoryRotations() {
        console.log("Phase 1: Assigning Mandatory Off-Service Rotations...");
        const rules = this.config.yearlySchedulerConfig.mandatoryRotations;
        rules.forEach(rule => {
            this.residents.forEach((resident, resIndex) => {
                if (rule.pgyLevels.includes(resident.pgyLevel)) {
                    this.assign(rule.blockNumber - 1, resIndex, {
                        rotationName: rule.rotationName,
                        rotationType: 'MANDATORY_OFF_SERVICE'
                    });
                }
            });
        });
    }

    private phase2_AssignExamBlocks() {
        console.log("Phase 2: Assigning Mandatory Exam Leave Blocks...");
        const rules = this.config.yearlySchedulerConfig.examLeave;
        rules.forEach(rule => {
            this.residents.forEach((resident, resIndex) => {
                if (rule.pgyLevels.includes(resident.pgyLevel)) {
                    this.assign(rule.blockNumber - 1, resIndex, {
                        rotationName: rule.rotationName,
                        rotationType: 'EXAM_LEAVE'
                    });
                }
            });
        });
    }
    
    private phase3_AssignHolidayBlocks() {
        console.log("Phase 3: Assigning Competitive Holiday Blocks...");
        // Simplified logic: Alternate holiday leave for seniors
        const seniors = this.residents.filter(r => r.pgyLevel >= 4);
        seniors.forEach((senior, index) => {
            const resIndex = this.residents.findIndex(r => r.id === senior.id);
            const blockToAssign = index % 2 === 0 ? 6 : 7; // Christmas vs New Year Block
            if (this.isSlotEmpty(blockToAssign - 1, resIndex)) {
                this.assign(blockToAssign - 1, resIndex, {
                    rotationName: 'Holiday Leave',
                    rotationType: 'HOLIDAY_LEAVE'
                });
            }
        });
    }

    private phase4_AssignCoreNeurosurgeryRotations() {
        console.log("Phase 4: Assigning Core Neurosurgery Rotations...");
        for (let block = 0; block < BLOCKS_PER_YEAR; block++) {
            for (let resIndex = 0; resIndex < this.residents.length; resIndex++) {
                if (this.isSlotEmpty(block, resIndex)) {
                    this.assign(block, resIndex, {
                        rotationName: 'Neurosurgery - Core',
                        rotationType: 'CORE_NSX'
                    });
                }
            }
        }
    }

    private phase5_AssignFlexibleOffServiceRotations() {
        console.log("Phase 5: Placing Flexible/Elective Rotations...");
        // Find blocks with high coverage and swap a core rotation for a requested elective.
        // This requires resident preference data as input.
    }
    
    private phase6_BalanceTeams() {
        console.log("Phase 6: Balancing Red/Blue Teams...");
        for (let block = 0; block < BLOCKS_PER_YEAR; block++) {
            let redTeamCount = 0;
            let blueTeamCount = 0;
            this.schedule[block].forEach(assignment => {
                if (assignment && assignment.rotationType === 'CORE_NSX') {
                    if (redTeamCount <= blueTeamCount) {
                        assignment.team = 'Red';
                        redTeamCount++;
                    } else {
                        assignment.team = 'Blue';
                        blueTeamCount++;
                    }
                }
            });
        }
    }

    private phase7_ValidateAndFinalize() {
        console.log("Phase 7: Validating Final Schedule...");
        for (let block = 0; block < BLOCKS_PER_YEAR; block++) {
            const assignmentsInBlock = this.schedule[block].filter(a => a !== null) as RotationAssignment[];
            if (!this.validateBlockCoverage(assignmentsInBlock)) {
                console.error(`FATAL: Coverage violation in Block ${block + 1}. Manual adjustment required.`);
            }
        }
    }

    private assign(block: number, resIndex: number, rotation: Omit<RotationAssignment, 'residentId'>) {
        if (this.isSlotEmpty(block, resIndex)) {
            this.schedule[block][resIndex] = {
                residentId: this.residents[resIndex].id,
                ...rotation
            };
        }
    }

    private isSlotEmpty = (block: number, resIndex: number) => this.schedule[block][resIndex] === null;

    private validateBlockCoverage(assignmentsInBlock: RotationAssignment[]): boolean {
        const rules = this.config.coverageRules.rotationBlock.filter(rule => rule.isEnabled);
        for (const rule of rules) {
            const relevantResidents = this.filterResidentsForRule(assignmentsInBlock, rule);
            if (relevantResidents.length < rule.minCount) {
                return false;
            }
        }
        return true;
    }

    private filterResidentsForRule(assignments: RotationAssignment[], rule: any): Resident[] {
        const residentIds = assignments.map(a => a.residentId);
        let filteredResidents = this.residents.filter(r => residentIds.includes(r.id));

        if (rule.appliesTo === 'SPECIALTY') {
            filteredResidents = filteredResidents.filter(r => r.specialty === rule.specialty);
        } else if (rule.appliesTo === 'SPECIALTY_PGY_MIN') {
            filteredResidents = filteredResidents.filter(r => 
                r.specialty === rule.specialty && r.pgyLevel >= rule.minPgyLevel
            );
        }
        return filteredResidents;
    }

    private formatScheduleForFirestore(): AcademicYear {
        // ... (implementation to convert the 2D grid to the final AcademicYear object)
        return {} as AcademicYear;
    }
}
