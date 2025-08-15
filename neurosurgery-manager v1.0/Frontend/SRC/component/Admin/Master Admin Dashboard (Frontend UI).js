import React, { useState } from 'react';
import { ConflictResolutionTicket } from '../../../../shared/types';
import { LayoutDashboard, Calendar, Umbrella, BarChart2, AlertOctagon, Settings } from 'lucide-react';

// Import all the individual UI components we've defined
import { YearlySchedulerUI } from '../scheduling/YearlySchedulerUI';
import { MonthlySchedulerUI } from '../scheduling/MonthlySchedulerUI';
import { WeeklySchedulerUI } from '../scheduling/WeeklySchedulerUI';
import { VacationDashboard } from '../vacation/VacationDashboard';
import { ConflictCenter } from './ConflictCenter';
import { AdminSettings } from './AdminSettings';

interface AdminDashboardProps {
    // Data would be fetched via React hooks in a real app
    conflictTickets: ConflictResolutionTicket[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ conflictTickets }) => {
    const [activeView, setActiveView] = useState('overview');

    const renderActiveView = () => {
        switch (activeView) {
            case 'yearly':
                return <YearlySchedulerUI scheduleData={/* ... */} residents={/* ... */} />;
            case 'monthly':
                return <MonthlySchedulerUI />;
            case 'weekly':
                return <WeeklySchedulerUI schedule={/* ... */} residents={/* ... */} />;
            case 'vacation':
                return <VacationDashboard requests={/* ... */} reports={/* ... */} />;
            case 'settings':
                return <AdminSettings />;
            case 'overview':
            default:
                return <div><h2>Welcome, Program Director!</h2><p>This is the main overview dashboard.</p></div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-4 text-2xl font-bold border-b border-gray-700">Medishift</div>
                <ul className="flex-1 mt-4">
                    <NavItem icon={<LayoutDashboard />} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
                    <NavItem icon={<Calendar />} label="Yearly Schedule" active={activeView === 'yearly'} onClick={() => setActiveView('yearly')} />
                    <NavItem icon={<Calendar />} label="Monthly Call" active={activeView === 'monthly'} onClick={() => setActiveView('monthly')} />
                    <NavItem icon={<Calendar />} label="Weekly Clinical" active={activeView === 'weekly'} onClick={() => setActiveView('weekly')} />
                    <NavItem icon={<Umbrella />} label="Vacation Requests" active={activeView === 'vacation'} onClick={() => setActiveView('vacation')} />
                    <NavItem icon={<BarChart2 />} label="Analytics" active={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
                </ul>
                <div className="p-4 border-t border-gray-700">
                    <NavItem icon={<Settings />} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* High-Priority Conflict Center */}
                <ConflictCenter openTickets={conflictTickets} />
                
                {/* Render the selected module */}
                {renderActiveView()}
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick, alertCount }) => (
    <li className={`mx-2 my-1`}>
        <button onClick={onClick} className={`w-full flex items-center p-3 rounded-lg transition-colors ${
            active ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
        }`}>
            {icon}
            <span className="ml-3">{label}</span>
            {alertCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{alertCount}</span>}
        </button>
    </li>
);

// The ConflictCenter component from the previous response would also be in this file or imported.
const ConflictCenter = ({ openTickets }) => {
    if (!openTickets || openTickets.length === 0) return null;
    return (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg shadow-lg mb-6">
            <div className="flex items-center">
                <AlertOctagon className="h-8 w-8 text-red-600 mr-4" />
                <div>
                    <h3 className="text-xl font-bold text-red-800">Action Required: {openTickets.length} Schedule Conflict(s) Detected</h3>
                    <p className="text-red-700">A published schedule conflicts with a pre-approved vacation. Please resolve immediately.</p>
                </div>
            </div>
        </div>
    );
};
