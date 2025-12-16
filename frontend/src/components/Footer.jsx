import React from "react";

export default function Footer() {
  return (
    <>
      <footer className='bg-black border-t border-gray-200 py-12 text-center'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid md:grid-cols-4 gap-8 mb-8 text-left'>
            <div>
              <h4 className='font-bold text-white mb-4'>BOOKEasy</h4>
              <p className='text-sm text-gray-300'>
                The easiest way to manage your service business.
              </p>
            </div>
            <div>
              <h4 className='font-bold text-white mb-4'>Product</h4>
              <ul className='text-sm text-gray-300 space-y-2'>
                <li>
                  <a href='#' className='hover:text-green-700'>
                    Features
                  </a>
                </li>
                {/* <li>
                  <a href='#' className='hover:text-green-700'>
                    Pricing
                  </a>
                </li> */}
                <li>
                  <a href='#' className='hover:text-green-700'>
                    Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold text-white mb-4'>Resources</h4>
              <ul className='text-sm text-gray-300 space-y-2'>
                <li>
                  <a href='#' className='hover:text-green-700'>
                    Blog
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-green-700'>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-green-700'>
                    Guides
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='font-bold text-white mb-4'>Legal</h4>
              <ul className='text-sm text-gray-300 space-y-2'>
                <li>
                  <a href='#' className='hover:text-green-700'>
                    Privacy
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-green-700'>
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-400 pt-8 text-sm text-gray-200'>
            &copy; {new Date().getFullYear()} BOOKEasy. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
