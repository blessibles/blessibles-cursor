import React, { useState } from 'react';

const mockNotifications = [
  { id: 1, message: 'Your order #1234 has shipped!', date: '2024-06-05', read: false },
  { id: 2, message: 'New product: Blessibles Digital Gift Card now available!', date: '2024-06-04', read: false },
  { id: 3, message: 'Your download is ready: Family Prayer Journal', date: '2024-06-03', read: true },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestUnread = notifications.find((n) => !n.read);

  const handleOpen = () => {
    setOpen((v) => !v);
    // Mark all as read when opening
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* ARIA live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {unreadCount > 0 && latestUnread ? latestUnread.message : ''}
      </div>
      <button
        className="relative text-blue-700 hover:text-blue-900 focus:outline-none"
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a2.25 2.25 0 0 1-4.714 0M6.75 8.25v-.75a4.5 4.5 0 1 1 9 0v.75m5.25 4.5c0 1.052-.816 1.918-1.857 1.994a48.554 48.554 0 0 1-15.786 0A2.001 2.001 0 0 1 2.25 12.75v-2.625c0-1.306.835-2.472 2.077-2.89l.923-.308a2.25 2.25 0 0 0 1.5-2.122V6a6 6 0 1 1 12 0v.805a2.25 2.25 0 0 0 1.5 2.122l.923.308A3 3 0 0 1 21.75 10.125V12.75z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-blue-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-blue-100 font-bold text-blue-900">Notifications</div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-4 text-blue-700">No notifications.</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className={`px-4 py-3 border-b last:border-b-0 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                  <div className="text-blue-900 font-medium">{n.message}</div>
                  <div className="text-xs text-blue-500 mt-1">{n.date}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 