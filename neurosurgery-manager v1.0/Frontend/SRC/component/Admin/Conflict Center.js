import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { ConflictResolutionTicket } from '../../shared/types';

export const ConflictCenter: React.FC<{ openTickets: ConflictResolutionTicket[] }> = ({ openTickets }) => {
    if (!openTickets || openTickets.length === 0) {
        return null;
    }

    return (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg shadow-lg mb-6">
            <div className="flex items-center">
                <ShieldAlert className="h-8 w-8 text-red-600 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="text-xl font-bold text-red-800">Action Required: {openTickets.length} Schedule Conflict(s)</h3>
                    <p className="text-red-700 mt-1">A published schedule conflicts with a pre-approved vacation. Please resolve immediately by reassigning the conflicting duty.</p>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                {openTickets.map(ticket => (
                    <div key={ticket.id} className="p-3 bg-white rounded border flex justify-between items-center">
                        <div>
                            <p><span className="font-bold">{ticket.residentName}</span>'s vacation conflicts with:</p>
                            <ul className="list-disc list-inside text-sm mt-1">
                                {ticket.conflictingAssignments.map((conflict, index) => (
                                    <li key={index}>
                                        <strong>{conflict.type} duty</strong> on {conflict.date.toDate().toLocaleDateString()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Resolve</button>
                    </div>
                ))}
            </div>
        </div>
    );
};
