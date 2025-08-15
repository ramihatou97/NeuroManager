import React, { useState } from 'react';
import { LeaveRequest, LeaveAnalysisReport } from '../../../../shared/types'; // Adjust path
import { CheckCircle, XCircle, AlertTriangle, Shield, BarChart2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config'; // Adjust path

interface VacationDashboardProps {
  requests: LeaveRequest[];
  reports: Record<string, LeaveAnalysisReport>;
}

const RecommendationBadge = ({ recommendation }: { recommendation: LeaveAnalysisReport['overallRecommendation'] }) => {
    const styles = {
        'Approve': { Icon: CheckCircle, color: 'text-green-500', label: 'Approve' },
        'Flagged for Review': { Icon: AlertTriangle, color: 'text-yellow-500', label: 'Flagged' },
        'Deny': { Icon: XCircle, color: 'text-red-500', label: 'Deny' },
    };
    const { Icon, color, label } = styles[recommendation] || styles['Flagged for Review'];
    return <div className={`flex items-center font-bold ${color}`}><Icon className="h-5 w-5 mr-1" /> {label}</div>;
};

export const VacationDashboard: React.FC<VacationDashboardProps> = ({ requests, reports }) => {
  
  const handleDeny = async (request: LeaveRequest, report: LeaveAnalysisReport) => {
    const justification = prompt(
        "Please provide a detailed justification for this denial.",
        `Request denied due to a ${report.estimatedCoverageImpact.projectedCoverageRisk} projected coverage risk.`
    );

    if (justification) {
        const requestRef = doc(db, 'leaveRequests', request.id);
        await updateDoc(requestRef, {
            status: 'Denied',
            denialJustification: justification,
        });
    }
  };

  const handleApprove = async (request: LeaveRequest) => {
    const requestRef = doc(db, 'leaveRequests', request.id);
    await updateDoc(requestRef, { status: 'Approved' });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Vacation & Leave Dashboard</h2>
      <div className="space-y-4">
        {requests.filter(r => r.status === 'Pending Approval').map(request => {
          const report = reports[request.id];
          if (!report) return <div key={request.id}>Analyzing request from {request.residentName}...</div>;

          return (
            <div key={request.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{request.residentName} (PGY-{request.pgyLevel})</p>
                  <p className="text-sm text-gray-600">{request.type} Request: {request.startDate.toDate().toLocaleDateString()} - {request.endDate.toDate().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <RecommendationBadge recommendation={report.overallRecommendation} />
                  <p className="text-xs text-gray-500 mt-1">Analysis Complete</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div className="bg-gray-100 p-3 rounded">
                      <h4 className="font-semibold flex items-center"><Shield className="h-4 w-4 mr-2 text-red-600"/>Projected Coverage Risk</h4>
                      <p className={`mt-1 text-lg font-bold ${
                          report.estimatedCoverageImpact.projectedCoverageRisk === 'High' ? 'text-red-600' : 
                          report.estimatedCoverageImpact.projectedCoverageRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                          {report.estimatedCoverageImpact.projectedCoverageRisk}
                      </p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                      <h4 className="font-semibold flex items-center"><BarChart2 className="h-4 w-4 mr-2 text-blue-600"/>Fairness Score</h4>
                      <p className="mt-1 text-sm">Score: <span className="font-bold">{report.fairnessScore.score}/100</span></p>
                      <p className="text-xs">Historical Approval for this period: <span className="font-bold">{(report.fairnessScore.historicalSuccessRateForPeriod * 100).toFixed(0)}%</span></p>
                  </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">View Details</button>
                  <button onClick={() => handleDeny(request, report)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Deny</button>
                  <button onClick={() => handleApprove(request)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Approve</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
