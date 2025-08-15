import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Loader } from 'lucide-react';

// Define AuditLog type locally or in shared/types.ts
interface AuditLog {
    id: string;
    timestamp: Date;
    user: string;
    action: string;
}

const mockAuditLogs: AuditLog[] = [
    { id: 'log1', timestamp: new Date(), user: 'Admin', action: 'Generated Monthly Schedule for Aug 2025' },
    { id: 'log2', timestamp: new Date(), user: 'System', action: 'Conflict Detected: Leave #123 conflicts with Call Schedule' },
    { id: 'log3', timestamp: new Date(), user: 'Dr. Chen', action: 'Submitted vacation request #456' },
];

export const AuditLogViewer = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setTimeout(() => { setLogs(mockAuditLogs); setIsLoading(false); }, 1200);
    }, []);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="font-bold text-xl mb-4 flex items-center"><BookOpen className="h-6 w-6 mr-2" /> System Audit Log</h3>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search logs by action or user..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm"
                />
            </div>
            {isLoading ? (
                <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
            ) : (
                <div className="overflow-y-auto h-72 border rounded-md">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
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
            )}
        </div>
    );
};
