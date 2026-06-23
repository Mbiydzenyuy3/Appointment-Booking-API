import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full text-center'>
        <div className='mb-8'>
          <div className='text-6xl mb-4'>🚫</div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Access Denied
          </h1>
          <p className='text-gray-600 mb-8'>
            You don't have permission to access this page.
          </p>
        </div>

        <div className='space-y-4'>
          <Link
            to='/dashboard'
            className='block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium'
          >
            Go to Dashboard
          </Link>
          <Link
            to='/'
            className='block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium'
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
