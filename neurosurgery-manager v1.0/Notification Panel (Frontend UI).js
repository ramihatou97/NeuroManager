import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Notification } from '../../shared/types'; // Adjust path

// Mock data for demonstration purposes
const mockNotifications: Notification[] = [
    { id: 'n1', recipientId: 'admin1', title: 'Vacation Request Approved', message: 'Your personal leave request has been approved.', type: 'LeaveRequest', isRead: false, createdAt: new Date() },
    { id: 'n2', recipientId: 'admin1', title: 'New EPA Assigned', message: 'An EPA for "C-12" has been assigned to you.', type: 'EPA', isRead: false, createdAt: new Date() },
    { id: 'n3', recipientId: 'admin1', title: 'Action Required: Schedule Conflict', message: "Dr. Chen's vacation conflicts with the call schedule.", type: 'Conflict', isRead: true, createdAt: new Date() },
];

export const NotificationPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // In a real app, you would use a Firestore onSnapshot listener
        // to get real-time notifications for the logged-in user.
        setNotifications(mockNotifications);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = (notificationId: string) => {
        // In a real app, update the notification's 'isRead' status in Firestore
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
                    <div className="p-3 font-bold border-b">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-center text-gray-500 p-4">No new notifications.</p>
                        ) : (
                            notifications.map(notification => (
                                <div key={notification.id} className={`p-3 flex items-start border-b hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{notification.title}</p>
                                        <p className="text-xs text-gray-600">{notification.message}</p>
                                    </div>
                                    {!notification.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            title="Mark as read"
                                            className="ml-2 p-1 rounded-full hover:bg-green-100 text-green-500"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 text-center text-sm bg-gray-50 rounded-b-lg">
                        <button className="text-blue-600 hover:underline">View All</button>
                    </div>
                </div>
            )}
        </div>
    );
};
