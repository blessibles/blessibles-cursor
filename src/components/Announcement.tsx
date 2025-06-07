'use client';

import { useEffect, useState } from 'react';

interface AnnouncementProps {
  message: string;
  assertive?: boolean;
  timeout?: number;
}

export default function Announcement({ message, assertive = false, timeout = 5000 }: AnnouncementProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);

    if (timeout) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [message, timeout]);

  return (
    <div
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
} 