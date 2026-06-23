import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { IdCard, Star, Shield, BadgeCheck } from "lucide-react";

export default function TrustSection() {
  const trustFeatures = [
    {
      icon: IdCard,
      title: "Identity Checked",
      description:
        'Every "Verified" business has submitted a valid CNI and business location proof. We know exactly who they are.',
      color: "bg-blue-500"
    },
    {
      icon: Star,
      title: "Real Reviews Only",
      description:
        "You can only review a business after you've actually booked and paid. No fake 5-star ratings from cousins and friends.",
      color: "bg-[#D4A574]"
    },
    {
      icon: Shield,
      title: "Payment Protection",
      description:
        "No Payments asked until service is confirmed done. Cancel easily if plans change.",
      color: "bg-[#1B4332]"
    }
  ];

  return (
    <section
      id='trust'
      className='py-24 bg-gradient-to-b from-white to-[#FDF8F3]'
    >
      <div className='max-w-7xl mx-auto px-6'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-[#1B4332]/10 rounded-full mb-6'>
            <BadgeCheck className='w-5 h-5 text-[#1B4332]' />
            <span className='text-[#1B4332] font-medium text-sm'>
              Trusted & Verified
            </span>
          </div>
          <h2 className='text-3xl md:text-5xl font-bold text-[#1B4332] mb-4'>
            Real Pros. Verified Identities.
          </h2>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
            We take trust seriously. Every professional on BOOKEasy goes through
            our verification process.
          </p>
        </motion.div>

        <div className='grid md:grid-cols-3 gap-8'>
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className='group'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className='bg-white rounded-3xl p-8 h-full shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden'>
                {/* Background decoration */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 ${feature.color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500`}
                />

                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className='w-8 h-8 text-white' />
                </div>

                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 leading-relaxed text-lg'>
                  {feature.description}
                </p>

                {/* Decorative line */}
                <div
                  className={`absolute bottom-0 left-0 w-0 h-1 ${feature.color} group-hover:w-full transition-all duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional trust indicators */}
        <motion.div
          className='mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100'
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className='grid md:grid-cols-4 gap-8 text-center'>
            <div>
              <p className='text-4xl md:text-5xl font-bold text-[#1B4332]'>
                100%
              </p>
              <p className='text-gray-500 mt-2'>CNI Verified Pros</p>
            </div>
            <div>
              <p className='text-4xl md:text-5xl font-bold text-[#1B4332]'>0</p>
              <p className='text-gray-500 mt-2'>Scam Reports</p>
            </div>
            <div>
              <p className='text-4xl md:text-5xl font-bold text-[#1B4332]'>
                24h
              </p>
              <p className='text-gray-500 mt-2'>Dispute Resolution</p>
            </div>
            {/* <div>
              <p className='text-4xl md:text-5xl font-bold text-[#1B4332]'>
                SSL
              </p>
              <p className='text-gray-500 mt-2'>Encrypted Payments</p>
            </div> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
