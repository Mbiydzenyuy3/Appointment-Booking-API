import React, { useEffect } from "react";
import { useGoogleAuthDebug } from "../../hooks/useGoogleAuthDebug.js";

export default function GoogleAuthDebug() {
  const {
    signInWithGoogle,
    initializeGoogleAuth,
    waitForGoogleSDK,
    isLoading,
    isInitialized,
    sdkLoaded
  } = useGoogleAuthDebug();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeGoogleAuth();
      } catch {
        // Silent catch for debug initialization
      }
    };

    initialize();
  }, [initializeGoogleAuth]);

  const handleDebugSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // Silent catch for debug sign in
    }
  };

  return (
    <div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold text-center mb-6'>Google Auth Debug</h2>

      <div className='space-y-4'>
        <div className='bg-gray-100 p-4 rounded'>
          <h3 className='font-semibold mb-2'>Debug Status:</h3>
          <ul className='text-sm space-y-1'>
            <li>SDK Loaded: {sdkLoaded ? "✅ Yes" : "❌ No"}</li>
            <li>Initialized: {isInitialized ? "✅ Yes" : "❌ No"}</li>
            <li>Loading: {isLoading ? "🔄 Yes" : "⏹️ No"}</li>
          </ul>
        </div>

        <div className='bg-blue-100 p-4 rounded'>
          <h3 className='font-semibold mb-2'>Environment Check:</h3>
          <ul className='text-sm space-y-1'>
            <li>
              VITE_GOOGLE_CLIENT_ID:{" "}
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing"}
            </li>
            <li>
              VITE_API_URL:{" "}
              {import.meta.env.VITE_API_URL ? "✅ Set" : "❌ Missing"}
            </li>
          </ul>
        </div>

        <div className='space-y-3'>
          <button
            onClick={handleDebugSignIn}
            disabled={isLoading || !isInitialized}
            className={`w-full py-3 px-4 rounded-lg font-medium ${
              isLoading || !isInitialized
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "🔄 Testing..." : "🧪 Test Google Auth (Debug)"}
          </button>

          <button
            onClick={() => waitForGoogleSDK()}
            disabled={isLoading}
            className='w-full py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300'
          >
            Re-initialize SDK
          </button>

          <button
            onClick={() => {
              alert("Check console for Google SDK details!");
            }}
            className='w-full py-2 px-4 rounded-lg font-medium bg-yellow-600 text-white hover:bg-yellow-700'
          >
            Debug SDK Status
          </button>
        </div>

        <div className='text-xs text-gray-600 bg-gray-50 p-3 rounded'>
          <p>
            <strong>Debug Instructions:</strong>
          </p>
          <ol className='list-decimal list-inside mt-2 space-y-1'>
            <li>Click "Test Google Auth" to trigger OAuth</li>
            <li>Complete Google sign-in flow</li>
            <li>Check console for detailed logs</li>
            <li>Alert will show the backend response</li>
          </ol>
        </div>
      </div>

      {/* Google Sign-In Button Container */}
      <div id='google-signin-button' className='mt-6'></div>
    </div>
  );
}
