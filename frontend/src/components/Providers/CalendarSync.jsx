import React, { useState, useEffect } from "react";
import api from "../../services/api.js";
import toast from "react-hot-toast";

export default function CalendarSync() {
  const [syncStatus, setSyncStatus] = useState({ enabled: false });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await api.get("/calendar/status");
      setSyncStatus(response.data.data);
    } catch (error) {
      console.error("Error fetching calendar sync status:", error);
    }
  };

  const handleEnableSync = async () => {
    setLoading(true);
    try {
      const response = await api.get("/calendar/auth-url");
      const { authUrl } = response.data.data;

      // Open Google OAuth in a popup window
      const popup = window.open(
        authUrl,
        "google-calendar-auth",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setTimeout(fetchSyncStatus, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error("Error enabling calendar sync:", error);
      toast.error("Failed to enable calendar sync");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSync = async () => {
    if (
      !confirm(
        "Are you sure you want to disable Google Calendar sync? This will stop checking for conflicts with your calendar events."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await api.post("/calendar/disable");
      setSyncStatus({ enabled: false });
      toast.success("Calendar sync disabled");
    } catch (error) {
      console.error("Error disabling calendar sync:", error);
      toast.error("Failed to disable calendar sync");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await api.get("/calendar/test");
      if (response.data.success) {
        toast.success(
          `Connection successful! Found ${response.data.data.eventCount} events in the next 7 days.`
        );
      } else {
        toast.error("Connection failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error testing calendar connection:", error);
      toast.error("Failed to test calendar connection");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      <div className='p-4 sm:p-6 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
              <svg
                className='w-5 h-5 mr-2 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Google Calendar Sync
            </h2>
            <p className='text-gray-600 text-sm mt-1'>
              Sync your Google Calendar to prevent booking conflicts
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              syncStatus.enabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {syncStatus.enabled ? "Enabled" : "Disabled"}
          </div>
        </div>
      </div>

      <div className='p-4 sm:p-6'>
        <div className='space-y-4'>
          <div className='bg-blue-50 rounded-lg p-4'>
            <div className='flex items-start'>
              <svg
                className='w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <div>
                <h3 className='text-sm font-medium text-blue-900'>
                  How it works
                </h3>
                <p className='text-sm text-blue-700 mt-1'>
                  When enabled, BOOKEasy will check your Google Calendar for
                  conflicts before allowing bookings. Time slots that conflict
                  with your existing calendar events will be hidden from
                  clients.
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-3'>
            {!syncStatus.enabled ? (
              <button
                onClick={handleEnableSync}
                disabled={loading}
                className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg
                      className='w-5 h-5'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                      <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                      <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                      <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                    </svg>
                    Enable Calendar Sync
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className='flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2'
                >
                  {testing ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      Test Connection
                    </>
                  )}
                </button>
                <button
                  onClick={handleDisableSync}
                  disabled={loading}
                  className='flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2'
                >
                  {loading ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      Disabling...
                    </>
                  ) : (
                    <>
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                      Disable Sync
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {syncStatus.enabled && (
            <div className='bg-green-50 rounded-lg p-4'>
              <div className='flex items-center'>
                <svg
                  className='w-5 h-5 text-green-600 mr-3'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <div>
                  <p className='text-sm font-medium text-green-900'>
                    Calendar sync is active
                  </p>
                  <p className='text-sm text-green-700'>
                    Your Google Calendar events are being checked for booking
                    conflicts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
