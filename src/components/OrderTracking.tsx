"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface OrderTrackingProps {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
}

export default function OrderTracking({ orderId, trackingNumber, carrier = 'USPS' }: OrderTrackingProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      if (!trackingNumber) {
        setLoading(false);
        return;
      }

      try {
        // First, check if we have cached tracking data
        const { data: cachedData, error: cacheError } = await supabase
          .from('tracking_updates')
          .select('*')
          .eq('order_id', orderId)
          .order('timestamp', { ascending: false });

        if (cacheError) throw cacheError;

        // If we have cached data and it's less than 1 hour old, use it
        if (cachedData && cachedData.length > 0) {
          const lastUpdate = new Date(cachedData[0].timestamp);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          if (lastUpdate > oneHourAgo) {
            setTrackingEvents(cachedData);
            setLastUpdated(lastUpdate.toLocaleString());
            setLoading(false);
            return;
          }
        }

        // If no cache or cache is old, fetch from carrier API
        const response = await fetch('/api/tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackingNumber,
            carrier,
            orderId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tracking information');
        }

        const data = await response.json();
        setTrackingEvents(data.events);
        setLastUpdated(new Date().toLocaleString());

        // Cache the new tracking data
        await supabase
          .from('tracking_updates')
          .upsert(
            data.events.map((event: TrackingEvent) => ({
              order_id: orderId,
              ...event,
            }))
          );

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingInfo();
  }, [orderId, trackingNumber, carrier]);

  if (!trackingNumber) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        Tracking information is not available yet.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error loading tracking information: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-900">Tracking Information</h3>
        {lastUpdated && (
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Tracking Number:</span>
          <span>{trackingNumber}</span>
          <span className="font-medium ml-4">Carrier:</span>
          <span>{carrier}</span>
        </div>
      </div>

      {trackingEvents.length > 0 ? (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {trackingEvents.map((event, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-blue-900">{event.status}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{event.description}</p>
                  {event.location && (
                    <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No tracking updates available yet.
        </div>
      )}
    </div>
  );
} 