import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { testAuth, testServiceCreation } from "../../utils/authTest.js";
import toast from "react-hot-toast";

export default function AuthDebugger() {
  const { user } = useAuth();

  const checkToken = () => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (token) {
      // Check if token has proper JWT format (3 parts separated by dots)
      const tokenParts = token.split(".");
      console.log("Token parts count:", tokenParts.length);

      if (tokenParts.length === 3) {
        try {
          const decoded = JSON.parse(atob(tokenParts[1]));
          console.log("Decoded token payload:", decoded);
          console.log("Token expiry:", new Date(decoded.exp * 1000));
          console.log("Current time:", new Date());
          console.log("Token expired:", Date.now() > decoded.exp * 1000);
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      } else {
        console.warn("Token doesn't have proper JWT format");
      }
    } else {
      console.warn("No token found in localStorage");
    }
  };

  const runAuthTest = async () => {
    const result = await testAuth();
    if (result.success) {
      toast.success("Authentication test passed!");
    } else {
      toast.error(`Authentication test failed: ${result.error}`);
    }
  };

  const runServiceTest = async () => {
    const result = await testServiceCreation();
    if (result.success) {
      toast.success("Service creation test passed!");
    } else {
      toast.error(`Service creation test failed: ${result.error}`);
    }
  };

  return (
    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
      <h3 className='font-semibold text-yellow-800 mb-2'>System Monitor </h3>

      <div className='space-y-2 text-sm text-gray-700'>
        <div>
          <strong>User State:</strong>{" "}
          {user
            ? `Logged in as ${user.email} (${user.user_type})`
            : "Not logged in"}
        </div>

        <div>
          <strong>Provider ID:</strong> {user?.provider_id || "Not available"}
        </div>

        <div>
          <strong>Token Status:</strong>{" "}
          {localStorage.getItem("token") ? "Present" : "Missing"}
        </div>

        <div className='flex gap-2 flex-wrap pt-2'>
          <button
            onClick={checkToken}
            className='bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700'
          >
            Check Token Details
          </button>
          <button
            onClick={runAuthTest}
            className='bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700'
          >
            Test Auth
          </button>
          <button
            onClick={runServiceTest}
            className='bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700'
          >
            Test Service Creation
          </button>
        </div>
      </div>
    </div>
  );
}
