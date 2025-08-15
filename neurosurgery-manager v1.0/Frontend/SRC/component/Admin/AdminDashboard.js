import React, { useState } from 'react';
import { LayoutDashboard, Users, ShieldAlert, BookOpen, Settings } from 'lucide-react';
import { ConflictResolutionTicket } from '../../shared/types';
import { ResidentManagementUI } from './ResidentManagementUI';
import { AdminSettings } from './AdminSettings';
import { AuditLogViewer } from './AuditLogViewer';
import { ConflictCenter } from './ConflictCenter';

// Mock data for demonstration
const mockConflictTickets: ConflictResolutionTicket[] = [
    { id: 'ticket1', leaveRequestId: 'leave123', residentId: 'res2', residentName: 'Dr. James Wilson', conflictStartDate: new Date(), conflictEndDate: new Date(), conflictingAssignments: [{type: 'Call', description: 'Night Call', date: new Date()}], status: 'Open' }
];

export const AdminDashboard = () => {
    const [activeView, setActiveView] = useState('overview');

    const renderActiveView = () => {
        switch (activeView) {
            case 'residents':
                return <ResidentManagementUI />;
            case 'settings':
                return <AdminSettings />;
            case 'audit':
                return <AuditLogViewer />;
            case 'overview':
            default:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Admin Overview</h2>
                        <p>Welcome to the Medishift administrative dashboard. Select a module from the sidebar to begin.</p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Administrator Controls</h1>
            <ConflictCenter openTickets={mockConflictTickets} />
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation for Admin Section */}
                <nav className="w-full md:w-1/4 lg:w-1/5 bg-white p-4 rounded-lg shadow-md">
                    <ul className="space-y-2">
                        <AdminNavItem icon={<LayoutDashboard />} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
                        <AdminNavItem icon={<Users />} label="Residents" active={activeView === 'residents'} onClick={() => setActiveView('residents')} />
                        <AdminNavItem icon={<Settings />} label="Configuration" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
                        <AdminNavItem icon={<BookOpen />} label="Audit Log" active={activeView === 'audit'} onClick={() => setActiveView('audit')} />
                    </ul>
                </nav>

                {/* Main Content Area for Admin Section */}
                <main className="flex-1">
                    {renderActiveView()}
                </main>
            </div>
        </div>
    );
};

const AdminNavItem = ({ icon, label, active, onClick }) => (
    <li>
        <button onClick={onClick} className={`w-full flex items-center p-3 rounded-lg transition-colors text-sm font-medium ${
            active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
        }`}>
            {icon}
            <span className="ml-3">{label}</span>
        </button>
    </li>
);
