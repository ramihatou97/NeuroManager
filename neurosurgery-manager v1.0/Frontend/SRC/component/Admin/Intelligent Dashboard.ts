import React, { useState, useEffect } from 'react';
import { Umbrella, Loader } from 'lucide-react';
import { VacationHeatMapData } from '../../shared/types';

const mockHeatMapData: VacationHeatMapData[] = Array.from({ length: 52 }, (_, i) => ({
    weekOfYear: i + 1,
    year: 2025,
    historicalApprovalRate: Math.random(),
    requestVolume: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
}));

const getHeatMapColor = (rate: number): string => {
    if (rate > 0.8) return 'bg-green-600';
    if (rate > 0.6) return 'bg-green-400';
    if (rate > 0.4) return 'bg-yellow-400';
    if (rate > 0.2) return 'bg-orange-500';
    return 'bg-red-600';
};

export const IntelligentDashboard = () => {
    const [heatMapData, setHeatMapData] = useState<VacationHeatMapData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch aggregated heatmap data from a dedicated Firestore collection
        setTimeout(() => { setHeatMapData(mockHeatMapData); setIsLoading(false); }, 1500);
    }, []);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="font-bold text-xl mb-2 flex items-center"><Umbrella className="h-6 w-6 mr-2" /> Vacation Planner</h3>
            <p className="text-sm text-gray-500 mb-4">This heat map shows the historical approval rate for vacation requests for each week of the year. Green indicates a high chance of approval.</p>
            {isLoading ? (
                <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>
            ) : (
                <div>
                    <div className="grid grid-cols-12 gap-1 text-center text-xs">
                        {/* A real implementation would have month headers */}
                        {heatMapData.map(week => (
                            <div key={week.weekOfYear} title={`Week ${week.weekOfYear}: ~${Math.round(week.historicalApprovalRate * 100)}% Approval Rate`}>
                                <div className={`w-full h-8 rounded ${getHeatMapColor(week.historicalApprovalRate)} opacity-75 hover:opacity-100 cursor-pointer`}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-4 mt-4 text-xs items-center">
                        <span>Low Chance</span>
                        <div className="w-4 h-4 bg-red-600 rounded"></div>
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                        <div className="w-4 h-4 bg-green-400 rounded"></div>
                        <div className="w-4 h-4 bg-green-600 rounded"></div>
                        <span>High Chance</span>
                    </div>
                </div>
            )}
        </div>
    );
};
