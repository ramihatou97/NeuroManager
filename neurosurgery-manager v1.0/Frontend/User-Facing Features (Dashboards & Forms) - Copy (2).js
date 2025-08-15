import React, { useState } from 'react';
import { Calendar, Clock, Sun, Moon, Briefcase, Stethoscope, Umbrella, Edit, Send, CheckSquare } from 'lucide-react';
import { LeaveRequest, EPAssignment } from '../../shared/types'; // Assuming types are in a shared directory

// Mock data for demonstration purposes
const mockTodaysActivities = [
    { type: 'OR', description: 'Craniotomy for Tumor', time: '07:30 - 15:00', location: 'OR 5' },
    { type: 'Clinic', description: 'Spine Clinic', time: '15:30 - 17:00', location: 'Clinic B' },
];
const mockUpcomingCalls = [
    { type: 'Night', date: '2025-08-15T22:00:00Z' },
    { type: 'Weekend', date: '2025-08-23T08:00:00Z' },
];
const mockOpenEPAs: EPAssignment[] = [
    { id: 'epa1', epaId: 'C-12', caseId: 'case-123', status: 'Assigned', residentId: 'res1', assessorId: 'ass1', dueDate: new Date('2025-08-16T23:59:59Z') },
    { id: 'epa2', epaId: 'F-2', caseId: 'case-456', status: 'Awaiting Evaluation', residentId: 'res1', assessorId: 'ass2', dueDate: new Date('2025-08-18T23:59:59Z') },
];


// ===================================================================
// 1. PERSONAL RESIDENT DASHBOARD
// A personalized home screen for each resident.
// ===================================================================
export const PersonalDashboard = () => {
    const residentName = "Dr. Chen"; // This would come from auth state

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold text-gray-800">Welcome back, {residentName}</h2>
            <p className="text-gray-600 mb-6">Here's your schedule and tasks for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Today's Schedule */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2 text-indigo-500" /> Today's Clinical Activities</h3>
                    <div className="space-y-3">
                        {mockTodaysActivities.map((activity, i) => (
                            <div key={i} className="flex items-center p-3 bg-gray-100 rounded-md">
                                {activity.type === 'OR' ? <Briefcase className="h-6 w-6 text-blue-500 mr-4"/> : <Stethoscope className="h-6 w-6 text-green-500 mr-4"/>}
                                <div>
                                    <p className="font-semibold">{activity.description}</p>
                                    <p className="text-sm text-gray-500">{activity.time} @ {activity.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Upcoming Calls */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4 flex items-center"><Clock className="h-5 w-5 mr-2 text-red-500" /> Upcoming Calls</h3>
                    <div className="space-y-3">
                        {mockUpcomingCalls.map((call, i) => (
                            <div key={i} className="flex items-center p-3 bg-red-50 rounded-md">
                                {call.type === 'Night' ? <Moon className="h-6 w-6 text-indigo-600 mr-4"/> : <Sun className="h-6 w-6 text-orange-500 mr-4"/>}
                                <div>
                                    <p className="font-semibold">{call.type} Call</p>
                                    <p className="text-sm text-gray-500">{new Date(call.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Full-width Row: Open Tasks */}
                <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4 flex items-center"><CheckSquare className="h-5 w-5 mr-2 text-purple-500" /> Action Required: Open EPAs</h3>
                    <EPAWorkflowUI openEPAs={mockOpenEPAs} />
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// 2. VACATION REQUEST FORM
// A simple, intuitive form for submitting leave requests.
// ===================================================================
export const VacationRequestForm = () => {
    const [leaveType, setLeaveType] = useState('Personal');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [comments, setComments] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call a Firebase Function or write to Firestore
        console.log({ leaveType, startDate, endDate, comments });
        alert('Vacation request submitted!');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
            <h3 className="font-bold text-xl mb-4 flex items-center"><Umbrella className="h-6 w-6 mr-2 text-teal-500" /> Submit Leave Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <select id="leaveType" value={leaveType} onChange={e => setLeaveType(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                        <option>Personal</option>
                        <option>Professional</option>
                        <option>LieuDay</option>
                        <option>Compassionate</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments (Optional)</label>
                    <textarea id="comments" value={comments} onChange={e => setComments(e.target.value)} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
                <div className="text-right">
                    <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                    </button>
                </div>
            </form>
        </div>
    );
};


// ===================================================================
// 3. EPA WORKFLOW UI
// The interface for residents to manage their assigned EPAs.
// ===================================================================
interface EPAWorkflowUIProps {
    openEPAs: EPAssignment[];
}

export const EPAWorkflowUI: React.FC<EPAWorkflowUIProps> = ({ openEPAs }) => {
    return (
        <div className="space-y-2">
            {openEPAs.map(epa => (
                <div key={epa.id} className="p-3 border rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-semibold">EPA: {epa.epaId}</p>
                        <p className="text-sm text-gray-500">
                            Status: <span className={`font-medium ${epa.status === 'Assigned' ? 'text-orange-500' : 'text-blue-500'}`}>{epa.status}</span>
                            <span className="mx-2">|</span>
                            Due: {epa.dueDate.toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        {epa.status === 'Assigned' && (
                            <button className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600">
                                <Edit className="h-4 w-4 mr-1" />
                                Complete Reflection
                            </button>
                        )}
                         {epa.status === 'Awaiting Evaluation' && (
                            <button className="inline-flex items-center px-3 py-1 bg-gray-400 text-white text-sm font-semibold rounded-md cursor-not-allowed">
                                Pending Evaluation
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
