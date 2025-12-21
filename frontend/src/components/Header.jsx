//Header component
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header() {
  const { logout } = useAuth();

  return (
    <>
      <header className='bg-white shadow px-4 py-3 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between mb-8'>
        <Link
          to='/'
          className='flex items-center space-x-2 text-2xl font-bold text-gray-800'
        >
          <span>📅</span>
          <h1 className='logo'>BOOKEasy</h1>
        </Link>

        <div className='mt-3 md:mt-0'>
          <button
            onClick={logout}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition'
          >
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
