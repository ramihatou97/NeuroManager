import React, { useState, useEffect } from 'react';
import { Users, Edit, UserPlus, ShieldAlert, BookOpen, Search, UserX, Loader, AlertCircle } from 'lucide-react';
import { Resident } from '../../shared/types'; // Assuming types are in a shared directory

// Mock data for demonstration purposes
const mockResidents = [
    { id: 'res1', name: 'Dr. Sarah Chen', pgyLevel: 5, specialty: 'Neurosurgery', onService: true, isChief: true, callExempt: true },
    { id: 'res2', name: 'Dr. James Wilson', pgyLevel: 3, specialty: 'Neurosurgery', onService: true, isChief: false, callExempt: false },
    { id: 'res3', name: 'Dr. Maria Rodriguez', pgyLevel: 1, specialty: 'Neurosurgery', onService: true, isChief: false, callExempt: false },
];
const mockSchedule = {
    'Monday': { 'OR 5': 'Dr. Chen', 'Spine Clinic': 'Dr. Wilson' },
    'Tuesday': { 'OR 5': 'Dr. Wilson', 'Tumor Board': 'Dr. Chen' },
};
const mockAuditLogs = [
    { id: 'log1', timestamp: new Date(), user: 'Admin', action: 'Generated Monthly Schedule for Aug 2025' },
    { id: 'log2', timestamp: new Date(), user: 'Admin', action: 'Approved vacation request for Dr. Rodriguez' },
    { id: 'log3', timestamp: new Date(), user: 'System', action: 'Conflict Detected: Leave #123 conflicts with Call Schedule' },
];

// ===================================================================
// Reusable Modal Component for Confirmations and Alerts
// ===================================================================
const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <div className="text-sm text-gray-600 mb-6">{children}</div>
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm</button>
                </div>
            </div>
        </div>
    );
};


// ===================================================================
// 1. RESIDENT MANAGEMENT UI (with Loading/Error/Empty States)
// ===================================================================
export const ResidentManagementUI = () => {
    const [residents, setResidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

    useEffect(() => {
        // Simulate fetching data from Firestore
        setTimeout(() => {
            setResidents(mockResidents);
            setIsLoading(false);
        }, 1000);
    }, []);

    const handleDeactivateClick = (resident) => {
        setSelectedResident(resident);
        setIsModalOpen(true);
    };

    const handleConfirmDeactivate = () => {
        console.log(`Deactivating resident: ${selectedResident?.name}`);
        // In a real app, update Firestore here
        setIsModalOpen(false);
        setSelectedResident(null);
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-indigo-600" /> <span className="ml-2">Loading residents...</span></div>;
        }
        if (error) {
            return <div className="flex items-center p-4 bg-red-100 text-red-700 rounded-md"><AlertCircle className="h-5 w-5 mr-2"/> Error: {error}</div>;
        }
        if (residents.length === 0) {
            return <div className="text-center p-8 text-gray-500">No residents found.</div>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* ... table head ... */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {residents.map(res => (
                            <tr key={res.id}>
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{res.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{res.pgyLevel}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button className="text-indigo-600 hover:text-indigo-900"><Edit className="h-5 w-5"/></button>
                                    <button onClick={() => handleDeactivateClick(res)} className="text-red-600 hover:text-red-900"><UserX className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="font-bold text-xl mb-4 flex items-center"><Users className="h-6 w-6 mr-2 text-blue-500" /> Resident Roster Management</h3>
            <div className="mb-4 text-right">
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Resident
                </button>
            </div>
            {renderContent()}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDeactivate}
                title="Deactivate Resident"
            >
                Are you sure you want to deactivate {selectedResident?.name}? This action cannot be undone.
            </Modal>
        </div>
    );
};


// ===================================================================
// 2. MANUAL SCHEDULE OVERRIDE (with Confirmation Modal)
// ===================================================================
export const ManualScheduleOverride = () => {
    const [schedule, setSchedule] = useState(mockSchedule);
    const [reason, setReason] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOverrideClick = () => {
        if (!reason) {
            // Use a simple alert for form validation, but a modal for confirmation
            alert('A reason is required for all manual overrides.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmOverride = () => {
        const newSchedule = { ...schedule };
        const temp = newSchedule['Monday']['OR 5'];
        newSchedule['Monday']['OR 5'] = newSchedule['Monday']['Spine Clinic'];
        newSchedule['Monday']['Spine Clinic'] = temp;
        setSchedule(newSchedule);
        
        console.log(`AUDIT LOG: Manual override performed. Reason: ${reason}.`);
        setIsModalOpen(false);
        setReason('');
    };

    return (
        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg mt-6">
            <h3 className="font-bold text-xl mb-4 flex items-center"><ShieldAlert className="h-6 w-6 mr-2 text-yellow-600" /> Manual Schedule Override</h3>
            {/* ... description ... */}
            <div className="bg-white p-4 rounded shadow-sm">
                {Object.entries(schedule).map(([day, assignments]) => (
                    <div key={day} className="mb-2">
                        <p className="font-bold">{day}</p>
                        {Object.entries(assignments).map(([location, resident]) => (
                            <p key={location} className="pl-4 text-sm">{location}: {resident}</p>
                        ))}
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <label htmlFor="overrideReason" className="block text-sm font-medium text-gray-700">Reason for Override</label>
                <input type="text" id="overrideReason" value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div className="mt-4 text-right">
                <button onClick={handleOverrideClick} className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">
                    Execute Override
                </button>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmOverride}
                title="Confirm Schedule Override"
            >
                Are you sure you want to manually override the schedule? This is a critical action that will be logged.
            </Modal>
        </div>
    );
};


// ===================================================================
// 3. AUDIT LOG VIEWER (with Loading/Error/Empty States)
// ===================================================================
export const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setTimeout(() => {
            setLogs(mockAuditLogs);
            setIsLoading(false);
        }, 1500);
    }, []);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-gray-500" /> <span className="ml-2">Loading audit logs...</span></div>;
        }
        if (filteredLogs.length === 0) {
            return <div className="text-center p-8 text-gray-500">No logs found matching your search.</div>;
        }
        return (
            <div className="overflow-y-auto h-64 border rounded-md">
                <table className="min-w-full">
                    {/* ... table head ... */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.map(log => (
                            <tr key={log.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{log.timestamp.toLocaleString()}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{log.user}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{log.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg mt-6">
            <h3 className="font-bold text-xl mb-4 flex items-center"><BookOpen className="h-6 w-6 mr-2 text-gray-500" /> System Audit Log</h3>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            {renderContent()}
        </div>
    );
};
