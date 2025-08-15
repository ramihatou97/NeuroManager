import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AnalyticsReport } from '../../../../shared/types'; // Adjust path
import { BarChart2, Users, Phone, Briefcase, Award, AlertCircle } from 'lucide-react';

// Mock data for demonstration purposes if no real report is available
const mockAnalyticsReport: AnalyticsReport = {
    id: 'mock-report',
    generatedDate: new Date(),
    period: 'weekly',
    overallMetrics: { totalResidents: 15, totalCallsScheduled: 45, totalORHours: 350, callFairnessGini: 0.18 },
    residentMetrics: [
        { residentId: 'res1', residentName: 'Chen', pgyLevel: 5, totalCalls: 4, weekendCalls: 1, totalORHours: 30, spineCaseHours: 15, epasCompleted: 20, epasAssigned: 22 },
        { residentId: 'res2', residentName: 'Wilson', pgyLevel: 3, totalCalls: 6, weekendCalls: 2, totalORHours: 25, spineCaseHours: 10, epasCompleted: 15, epasAssigned: 20 },
        { residentId: 'res3', residentName: 'Rodriguez', pgyLevel: 1, totalCalls: 5, weekendCalls: 1, totalORHours: 15, spineCaseHours: 5, epasCompleted: 8, epasAssigned: 15 },
    ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const KPICard = ({ title, value, icon: Icon, unit = '' }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mr-4">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}{unit}</p>
            </div>
        </div>
    </div>
);

export const AnalyticsDashboard = () => {
    const [report, setReport] = useState<AnalyticsReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch the latest report from the 'analyticsReports' collection
        setTimeout(() => {
            setReport(mockAnalyticsReport);
            setIsLoading(false);
        }, 1000);
    }, []);

    if (isLoading) {
        return <div>Loading analytics...</div>;
    }
    if (!report) {
        return <div className="flex items-center p-4 bg-red-100 text-red-700 rounded-md"><AlertCircle className="h-5 w-5 mr-2"/> Analytics report not found.</div>;
    }

    const orExposureData = report.residentMetrics.map(r => ({
        name: r.residentName,
        'Cranial & Other': r.totalORHours - r.spineCaseHours,
        'Spine Cases': r.spineCaseHours,
    }));

    return (
        <div className="p-6 bg-gray-50 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center"><BarChart2 className="h-8 w-8 mr-3 text-indigo-600"/>Program Analytics Dashboard</h2>
            
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Total Residents" value={report.overallMetrics.totalResidents} icon={Users} />
                <KPICard title="Total Calls This Period" value={report.overallMetrics.totalCallsScheduled} icon={Phone} />
                <KPICard title="Total OR Hours" value={Math.round(report.overallMetrics.totalORHours)} icon={Briefcase} />
                <KPICard title="Call Fairness (Gini)" value={report.overallMetrics.callFairnessGini} icon={Award} unit=" (0=Fair)" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold mb-4">Total Calls per Resident</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={report.residentMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="residentName" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalCalls" fill="#8884d8" name="Total Calls" />
                            <Bar dataKey="weekendCalls" fill="#82ca9d" name="Weekend Calls" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold mb-4">OR Exposure (Hours)</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={orExposureData} layout="vertical" stackId="a">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Cranial & Other" stackId="a" fill="#0088FE" />
                            <Bar dataKey="Spine Cases" stackId="a" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Resident Progress Table */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-4">Resident Educational Progress (EPAs)</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    {/* ... table head ... */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {report.residentMetrics.map(res => (
                            <tr key={res.residentId}>
                                <td className="px-4 py-3 font-medium">{res.residentName} (PGY-{res.pgyLevel})</td>
                                <td className="px-4 py-3">{res.epasCompleted} / {res.epasAssigned}</td>
                                <td className="px-4 py-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(res.epasCompleted / res.epasAssigned) * 100}%` }}></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
