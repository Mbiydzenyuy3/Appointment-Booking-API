import React, { useState } from "react";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

export default function GoogleAuthDebugger() {
  const [testResults, setTestResults] = useState({});
  const {
    signInWithGoogle,
    waitForGoogleSDK,
    isLoading,
    isInitialized,
    sdkLoaded
  } = useGoogleAuth();

  const runDiagnostics = async () => {
    const results = {};

    // Test 1: Check Google SDK availability
    results.sdkAvailable = !!window.google;
    results.sdkAccountsAvailable = !!(window.google && window.google.accounts);

    // Test 2: Check environment variables
    results.googleClientIdConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
    results.googleClientIdValue =
      import.meta.env.VITE_GOOGLE_CLIENT_ID === "your_google_client_id_here"
        ? "placeholder"
        : "configured";

    // Test 3: Check initialization state
    results.isInitialized = isInitialized;
    results.sdkLoaded = sdkLoaded;

    // Test 4: Test SDK loading
    try {
      await waitForGoogleSDK();
      results.sdkLoadingTest = "success";
    } catch (error) {
      results.sdkLoadingTest = `failed: ${error.message}`;
    }

    // Test 5: Check CSP
    const metaTags = document.querySelectorAll(
      'meta[http-equiv="Content-Security-Policy"]'
    );
    results.cspConfigured = metaTags.length > 0;
    if (metaTags.length > 0) {
      const csp = metaTags[0].getAttribute("content");
      results.cspAllowsGoogle = csp.includes("accounts.google.com");
    }

    setTestResults(results);
  };

  const testGoogleAuth = async () => {
    try {
      console.log("🧪 Testing Google Authentication...");
      await signInWithGoogle();
    } catch (error) {
      console.error("❌ Google auth test failed:", error);
    }
  };

  return (
    <div className='bg-gray-100 p-6 rounded-lg border-2 border-blue-300'>
      <h3 className='text-lg font-semibold mb-4 text-blue-800'>
        🔍 Google Authentication Debugger
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <button
          onClick={runDiagnostics}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Run Diagnostics
        </button>

        <button
          onClick={testGoogleAuth}
          disabled={isLoading}
          className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50'
        >
          {isLoading ? "Testing..." : "Test Google Auth"}
        </button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className='bg-white p-4 rounded border'>
          <h4 className='font-medium mb-2'>Test Results:</h4>
          <div className='space-y-1 text-sm'>
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} className='flex justify-between'>
                <span className='font-mono'>{key}:</span>
                <span
                  className={`${
                    typeof value === "boolean"
                      ? value
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  {typeof value === "boolean"
                    ? value
                      ? "✅"
                      : "❌"
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='mt-4 text-xs text-gray-600'>
        <p>
          <strong>Instructions:</strong>
        </p>
        <ol className='list-decimal list-inside space-y-1'>
          <li>Click "Run Diagnostics" to check your setup</li>
          <li>
            If Google Client ID shows "placeholder", update your .env file
          </li>
          <li>Click "Test Google Auth" to try the authentication flow</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}
