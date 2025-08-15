import React, { useState } from 'react';
import { HelpCircle, Settings, Sun, Moon, Bell } from 'lucide-react';
import { Resident } from '../../shared/types'; // Assuming types are in a shared directory

// ===================================================================
// 1. DATA MODEL UPDATE (shared/types.ts)
// We add a 'preferences' object to the Resident type to store their choices.
// ===================================================================
export interface ResidentWithPrefs extends Resident {
    preferences?: {
        theme: 'light' | 'dark';
        notifications: {
            newEpaAssigned: boolean;
            leaveStatusUpdate: boolean;
            schedulePublished: boolean;
        };
    };
}


// ===================================================================
// 2. INTEGRATED HELP & DOCUMENTATION (Reusable Component)
// This component can be placed next to any complex feature in the UI.
// ===================================================================
interface HelpTooltipProps {
    title: string;
    content: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block ml-2">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-blue-500">
                <HelpCircle className="h-4 w-4" />
            </button>
            {isOpen && (
                <div className="absolute z-10 bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-left">
                    <h4 className="font-bold text-sm text-gray-800">{title}</h4>
                    <div className="text-xs text-gray-600 mt-1">{content}</div>
                </div>
            )}
        </div>
    );
};


// ===================================================================
// 3. USER PREFERENCES & CUSTOMIZATION (UI Panel)
// This component allows users to tailor their application experience.
// ===================================================================
interface UserSettingsPanelProps {
    resident: ResidentWithPrefs;
    onSave: (prefs: ResidentWithPrefs['preferences']) => void;
}

export const UserSettingsPanel: React.FC<UserSettingsPanelProps> = ({ resident, onSave }) => {
    const [prefs, setPrefs] = useState(resident.preferences || {
        theme: 'light',
        notifications: { newEpaAssigned: true, leaveStatusUpdate: true, schedulePublished: true }
    });

    const handleThemeChange = () => {
        setPrefs(p => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }));
    };

    const handleNotificationChange = (key: string, value: boolean) => {
        setPrefs(p => ({
            ...p,
            notifications: { ...p.notifications, [key]: value }
        }));
    };

    const handleSaveChanges = () => {
        // In a real app, this function would update the resident's document in Firestore.
        // The backend notification triggers would then read these preferences before sending a notification.
        onSave(prefs);
        alert('Preferences saved!');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="font-bold text-xl mb-4 flex items-center"><Settings className="h-6 w-6 mr-2 text-gray-600" /> User Preferences</h3>
            
            {/* Theme Preference */}
            <div className="flex justify-between items-center p-3 border rounded-lg">
                <div className="font-medium">Theme</div>
                <div className="flex items-center p-1 bg-gray-200 rounded-full">
                    <button onClick={handleThemeChange} className={`p-1 rounded-full ${prefs.theme === 'light' ? 'bg-white shadow' : ''}`}><Sun className="h-5 w-5"/></button>
                    <button onClick={handleThemeChange} className={`p-1 rounded-full ${prefs.theme === 'dark' ? 'bg-gray-700 text-white shadow' : ''}`}><Moon className="h-5 w-5"/></button>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="mt-4">
                <h4 className="font-medium mb-2 flex items-center"><Bell className="h-5 w-5 mr-2"/> Notification Settings</h4>
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                        <label htmlFor="epa-notif">New EPA Assigned</label>
                        <input type="checkbox" id="epa-notif" checked={prefs.notifications.newEpaAssigned} onChange={e => handleNotificationChange('newEpaAssigned', e.target.checked)} />
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                        <label htmlFor="leave-notif">Leave Request Status Update</label>
                        <input type="checkbox" id="leave-notif" checked={prefs.notifications.leaveStatusUpdate} onChange={e => handleNotificationChange('leaveStatusUpdate', e.target.checked)} />
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                        <label htmlFor="sched-notif">Schedule Published</label>
                        <input type="checkbox" id="sched-notif" checked={prefs.notifications.schedulePublished} onChange={e => handleNotificationChange('schedulePublished', e.target.checked)} />
                    </div>
                </div>
            </div>

            <div className="mt-6 text-right">
                <button onClick={handleSaveChanges} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                    Save Preferences
                </button>
            </div>
        </div>
    );
};


// ===================================================================
// 4. EXAMPLE USAGE (Demonstration)
// This shows how these components would be used on a settings page.
// ===================================================================
export const SettingsPage = () => {
    const mockResident: ResidentWithPrefs = {
        id: 'res1', name: 'Dr. Chen', pgyLevel: 5, specialty: 'Neurosurgery', onService: true, isChief: true, callExempt: true,
        preferences: { theme: 'light', notifications: { newEpaAssigned: true, leaveStatusUpdate: true, schedulePublished: true } }
    };

    const handleSavePreferences = (prefs) => {
        console.log("Saving preferences to Firestore:", prefs);
    };

    return (
        <div className="p-8 bg-gray-100 space-y-8">
            <UserSettingsPanel resident={mockResident} onSave={handleSavePreferences} />

            {/* Example of using the HelpTooltip in another component */}
            <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
                <h3 className="font-bold text-xl">Analytics Setting</h3>
                <div className="flex items-center mt-2">
                    <span>Call Fairness (Gini Coefficient)</span>
                    <HelpTooltip title="What is a Gini Coefficient?" content={
                        <p>
                            A score from 0 to 1 that measures the equality of a distribution.
                            A score of <strong>0</strong> means perfect equality (everyone has the same number of calls).
                            A higher score means more inequality.
                        </p>
                    }/>
                </div>
            </div>
        </div>
    );
};
