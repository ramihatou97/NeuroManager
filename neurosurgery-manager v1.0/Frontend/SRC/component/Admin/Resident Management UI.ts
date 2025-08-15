import React, { useState, useEffect } from 'react';
import { Users, Edit, UserPlus, UserX, Loader } from 'lucide-react';
import { Resident } from '../../shared/types';

const mockResidents: Resident[] = [
    { id: 'res1', name: 'Dr. Sarah Chen', pgyLevel: 5, specialty: 'Neurosurgery', onService: true, isChief: true, callExempt: true },
    { id: 'res2', name: 'Dr. James Wilson', pgyLevel: 3, specialty: 'Neurosurgery', onService: true, isChief: false, callExempt: false },
];

export const ResidentManagementUI = () => {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => { setResidents(mockResidents); setIsLoading(false); }, 500);
    }, []);

    if (isLoading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="font-bold text-xl mb-4 flex items-center"><Users className="h-6 w-6 mr-2" /> Resident Roster</h3>
            <div className="mb-4 text-right">
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700">
                    <UserPlus className="h-4 w-4 mr-2" /> Add Resident
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PGY</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {residents.map(res => (
                            <tr key={res.id}>
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{res.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">{res.pgyLevel}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button className="text-indigo-600 hover:text-indigo-900"><Edit className="h-5 w-5"/></button>
                                    <button className="text-red-600 hover:text-red-900"><UserX className="h-5 w-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
