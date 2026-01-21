import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const AuthDebugger = () => {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (process.env.NODE_ENV === "production") {
    return null; // Don't show in production
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatToken = (token) => {
    if (!token) return "No token";
    if (token.length <= 50) return token;
    return `${token.substring(0, 25)}...${token.substring(token.length - 25)}`;
  };

  const parseToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return { error: "Invalid token format" };
    }
  };

  return (
    <div className='fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='text-sm font-bold'>Auth Debugger</h3>
        <button
          onClick={toggleExpanded}
          className='text-gray-400 hover:text-white text-sm'
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      <div className='text-xs space-y-1'>
        <div>
          <span className='text-gray-400'>Status:</span>{" "}
          <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </span>
        </div>

        {isExpanded && (
          <>
            <div>
              <span className='text-gray-400'>User:</span>{" "}
              {user ? (
                <pre className='text-xs bg-gray-800 p-1 rounded mt-1 overflow-x-auto'>
                  {JSON.stringify(user, null, 2)}
                </pre>
              ) : (
                <span className='text-yellow-400'>No user data</span>
              )}
            </div>

            <div>
              <span className='text-gray-400'>Token:</span>{" "}
              <span className='font-mono text-xs'>{formatToken(token)}</span>
            </div>

            {token && (
              <div>
                <span className='text-gray-400'>Token Payload:</span>
                <pre className='text-xs bg-gray-800 p-1 rounded mt-1 overflow-x-auto'>
                  {JSON.stringify(parseToken(token), null, 2)}
                </pre>
              </div>
            )}

            <div className='flex space-x-2 mt-2'>
              <button
                onClick={() =>
                  console.log("Auth State:", { user, token, isAuthenticated })
                }
                className='px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs'
              >
                Log State
              </button>

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className='px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs'
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() =>
                    login({ email: "test@example.com", password: "password" })
                  }
                  className='px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs'
                >
                  Test Login
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthDebugger;
