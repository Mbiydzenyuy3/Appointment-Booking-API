import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  X,
  Check,
  MessageCircle,
  Clock,
  Banknote,
  Zap,
  Timer,
  CreditCard
} from "lucide-react";

export default function ProblemSolutionSection() {
  const comparisons = [
    {
      problem: {
        icon: MessageCircle,
        title: '"Has he read my WhatsApp?"',
        description:
          'You send a message. One tick. You wait 4 hours for a reply just to hear "I\'m busy today."'
      },
      solution: {
        icon: Zap,
        title: "Instant Confirmation",
        description:
          'See real-time availability. Tap "Book" and get an SMS confirmation in seconds. No chatting required.'
      }
    },
    {
      problem: {
        icon: Clock,
        title: 'The "I\'m Coming" Lie',
        description:
          'You arrive on time, but the barber is eating or "stuck in traffic," and you wait 45 minutes on a plastic chair.'
      },
      solution: {
        icon: Timer,
        title: "Respect for Your Time",
        description:
          "Professionals on BookLocal are rated for punctuality. You get reminders, they get reminders. You sit in the chair, not the waiting room."
      }
    },
    {
      problem: {
        icon: Banknote,
        title: "Cash Scramble",
        description:
          '"Sorry, no change." You have to run to the nearest store to break 10,000 CFA.'
      },
      solution: {
        icon: CreditCard,
        title: "Seamless Payments",
        description:
          "Pay via MTN MoMo, Orange Money, or Cash. We got you covered with cashless options. Pay via MoMo on site after service."
      }
    }
  ];

  return (
    <section id='how-it-works' className='py-24 bg-white'>
      <div className='max-w-7xl mx-auto px-6'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className='text-[#D4A574] font-medium tracking-wide uppercase text-sm'>
            Why Switch?
          </span>
          <h2 className='text-3xl md:text-5xl font-bold text-[#1B4332] mt-4 mb-4'>
            Why BOOKEasy is Better Than
            <br className='hidden md:block' /> "Just Call Me"
          </h2>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
            We built BOOKEasy because we were tired of the same frustrations.
            Here's how we fixed them.
          </p>
        </motion.div>

        <div className='space-y-6'>
          {comparisons.map((item, index) => (
            <motion.div
              key={index}
              className='grid md:grid-cols-2 gap-4 md:gap-6'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Problem Card */}
              <div className='bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-red-100 relative overflow-hidden group hover:shadow-lg transition-shadow'>
                <div className='absolute top-4 right-4 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
                  <X className='w-4 h-4 text-red-500' />
                </div>
                <div className='flex items-start gap-4'>
                  <div className='w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0'>
                    <item.problem.icon className='w-7 h-7 text-red-400' />
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>
                      {item.problem.title}
                    </h3>
                    <p className='text-gray-600 leading-relaxed'>
                      {item.problem.description}
                    </p>
                  </div>
                </div>
                <div className='absolute -bottom-10 -right-10 w-32 h-32 bg-red-100/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity' />
              </div>

              {/* Solution Card */}
              <div className='bg-gradient-to-br from-[#1B4332] to-[#2D5A45] rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:shadow-lg transition-shadow'>
                <div className='absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                  <Check className='w-4 h-4 text-white' />
                </div>
                <div className='flex items-start gap-4'>
                  <div className='w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0'>
                    <item.solution.icon className='w-7 h-7 text-[#D4A574]' />
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-white mb-2'>
                      {item.solution.title}
                    </h3>
                    <p className='text-white/80 leading-relaxed'>
                      {item.solution.description}
                    </p>
                  </div>
                </div>
                <div className='absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity' />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
