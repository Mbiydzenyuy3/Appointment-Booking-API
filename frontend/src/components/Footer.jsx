import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className='bg-green-950 border-t border-green-900/40 py-12'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid gap-8 md:grid-cols-4 mb-10 text-sm text-gray-300'>
          <div>
            <h4 className='font-bold text-white mb-3 text-lg cursor-pointer' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>BOOKEasy</h4>
            <p className='leading-relaxed'>
              A simple and secure way for service businesses to manage
              appointments and for clients to book instantly.
            </p>
            <p className='mt-3 text-xs text-gray-400'>
              Built for small businesses and professionals.
            </p>
          </div>

          <div>
            <h4 className='font-bold text-white mb-3'>Product</h4>
            <ul className='space-y-2'>
              <li>
                <Link
                  to='/features'
                  className='hover:text-green-400 transition'
                >
                  Features
                </Link>
              </li>
              <li>
                <Link to='/explore' className='hover:text-green-400 transition'>
                  Explore Businesses
                </Link>
              </li>
              <li>
                <Link
                  to='/register'
                  className='hover:text-green-400 transition'
                >
                  Start Free
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-bold text-white mb-3'>Resources</h4>
            <ul className='space-y-2'>
              <li>
                <Link to='/help' className='hover:text-green-400 transition'>
                  Help Center
                </Link>
              </li>

              <li>
                <Link to='/contact' className='hover:text-green-400 transition'>
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-bold text-white mb-3'>Trust & Legal</h4>
            <ul className='space-y-2'>
              <li>
                <Link to='/privacy' className='hover:text-green-400 transition'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to='/terms' className='hover:text-green-400 transition'>
                  Terms of Service
                </Link>
              </li>
            </ul>

            <p className='mt-4 text-xs text-gray-400 leading-relaxed'>
              Your data is encrypted and never shared with third parties.
            </p>
          </div>
        </div>

        <div className='border-t border-green-900/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400'>
          <p>© {new Date().getFullYear()} BOOKEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
