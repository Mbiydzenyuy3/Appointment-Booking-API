import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";

export default function CTAFooter({ onProviderClick, onClientClick }) {
  return (
    <>
      {/* CTA Section */}
      <section className='py-24 bg-[#FDF8F3]'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid md:grid-cols-2 gap-8'>
            {/* For Clients */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='bg-white rounded-3xl p-8 md:p-12 shadow-sm hover:shadow-xl transition-shadow border border-gray-100 relative overflow-hidden group'
            >
              <div className='absolute -top-10 -right-10 w-40 h-40 bg-[#1B4332]/5 rounded-full group-hover:scale-150 transition-transform duration-500' />

              <div className='w-16 h-16 bg-[#1B4332]/10 rounded-2xl flex items-center justify-center mb-6'>
                <Calendar className='w-8 h-8 text-[#1B4332]' />
              </div>

              <h3 className='text-3xl md:text-4xl font-bold text-[#1B4332] mb-4'>
                Ready to skip the queue?
              </h3>
              <p className='text-gray-600 text-lg mb-8'>
                Find trusted professionals near you and book your first
                appointment in under 2 minutes.
              </p>

              <Button
                onClick={onClientClick}
                className='bg-[#1B4332] hover:bg-[#2D5A45] text-white rounded-full px-8 py-6 text-lg font-semibold group/btn'
              >
                Book Your First Appointment
                <ArrowRight className='ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform' />
              </Button>
            </motion.div>

            {/* For Businesses */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='bg-gradient-to-br from-[#1B4332] to-[#2D5A45] rounded-3xl p-8 md:p-12 relative overflow-hidden group'
            >
              <div className='absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500' />

              <div className='w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6'>
                <Briefcase className='w-8 h-8 text-[#D4A574]' />
              </div>

              <h3 className='text-3xl md:text-4xl font-bold text-white mb-4'>
                Run a Service Business?
              </h3>
              <p className='text-white/80 text-lg mb-4'>
                Join 500+ Cameroonian pros filling their calendars
                automatically. Stop chasing clients and start getting booked.
              </p>
              <ul className='text-white/70 mb-8 space-y-2'>
                <li className='flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 bg-[#D4A574] rounded-full' />
                  Free to list your business
                </li>

                <li className='flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 bg-[#D4A574] rounded-full' />
                  Automatic SMS reminders reduce no-shows
                </li>
              </ul>

              <Button
                onClick={onProviderClick}
                className='bg-[#D4A574] hover:bg-[#C49A6C] text-[#1B4332] rounded-full px-8 py-6 text-lg font-semibold group/btn'
              >
                List My Business Free
                <ArrowRight className='ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform' />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-[#0F2820] text-white py-16'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid md:grid-cols-4 gap-12 mb-12'>
            {/* Brand */}
            <div className='md:col-span-1'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-10 h-10 bg-[#D4A574] rounded-xl flex items-center justify-center'>
                  <span className='text-[#1B4332] font-bold text-lg'>B</span>
                </div>
                <span className='text-2xl font-bold'>BOOKEasy</span>
              </div>
              <p className='text-white/60 mb-6'>
                Connecting Cameroonians with trusted local professionals since
                2020.
              </p>
              <div className='flex items-center gap-4'>
                <a
                  href='#'
                  className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors'
                >
                  <Facebook className='w-5 h-5' />
                </a>
                <a
                  href='#'
                  className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors'
                >
                  <Instagram className='w-5 h-5' />
                </a>
                <a
                  href='#'
                  className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors'
                >
                  <Twitter className='w-5 h-5' />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className='font-semibold mb-4'>Quick Links</h4>
              <ul className='space-y-3'>
                <li>
                  <a
                    href='/explore'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    Find Services
                  </a>
                </li>
                <li>
                  <a
                    href='/explore'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    List Your Business
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className='font-semibold mb-4'>Popular Services</h4>
              <ul className='space-y-3'>
                <li>
                  <a
                    href='/explore?category=barbers'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    Barbers
                  </a>
                </li>
                <li>
                  <a
                    href='/explore?category=dentists'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    Dentists
                  </a>
                </li>
                <li>
                  <a
                    href='/explore?category=makeup-artists'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    Makeup Artists
                  </a>
                </li>
                <li>
                  <a
                    href='/explore?category=personal-trainers'
                    className='text-white/60 hover:text-white transition-colors'
                  >
                    Personal Trainers
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className='font-semibold mb-4'>Contact Us</h4>
              <ul className='space-y-3'>
                <li className='flex items-center gap-3 text-white/60'>
                  <Phone className='w-4 h-4' />
                  +237 654168485
                </li>
                {/* <li className='flex items-center gap-3 text-white/60'>
                  <Mail className='w-4 h-4' />
                  hello@bookl.cm
                </li> */}
                <li className='flex items-start gap-3 text-white/60'>
                  <MapPin className='w-4 h-4 mt-1' />
                  Douala, Cameroon
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4'>
            <p className='text-white/40 text-sm'>
              © 2024 BOOKEasy. All rights reserved.
            </p>
            <div className='flex items-center gap-6 text-sm'>
              <a
                href='#'
                className='text-white/40 hover:text-white transition-colors'
              >
                Privacy Policy
              </a>
              <a
                href='#'
                className='text-white/40 hover:text-white transition-colors'
              >
                Terms of Service
              </a>
              <a
                href='#'
                className='text-white/40 hover:text-white transition-colors'
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
