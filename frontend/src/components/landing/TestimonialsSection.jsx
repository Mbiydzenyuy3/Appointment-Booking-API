import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      quote:
        "I used to spend my Saturday mornings waiting at the barber in Bonamoussadi. Now, I book my slot on Friday night, walk in at 10:00 AM, and I'm out by 10:45 AM. It feels like VIP treatment.",
      name: "Jean-Claude Mbarga",
      role: "Entrepreneur",
      location: "Douala",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      quote:
        "Finding a vet in Buea who was actually open on Sundays was a nightmare. BOOKEasy showed me who was available instantly. No more driving around blindly.",
      name: "Sarah Mungoh",
      role: "Pet Owner",
      location: "Buea",
      avatar:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      quote:
        "As a makeup artist, I wasted hours replying to 'How much?' on WhatsApp. Now my clients see my prices and book directly. I've saved 10+ hours a week.",
      name: "Aline Fotso",
      role: "Makeup Artist",
      location: "Yaoundé",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      rating: 5
    },
    {
      quote:
        "My salon used to get maybe 3-4 bookings a day through calls. Now I get 12-15 through BOOKEasy. The automatic reminders mean fewer no-shows too.",
      name: "Patricia Eyebe",
      role: "Salon Owner",
      location: "Douala",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section
      id='testimonials'
      className='py-24 bg-[#1B4332] relative overflow-hidden'
    >
      {/* Decorative elements */}
      <div className='absolute top-0 left-0 w-full h-full'>
        <div className='absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-10 w-96 h-96 bg-[#D4A574]/10 rounded-full blur-3xl' />
      </div>

      <div className='max-w-7xl mx-auto px-6 relative z-10'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className='text-[#D4A574] font-medium tracking-wide uppercase text-sm'>
            Testimonials
          </span>
          <h2 className='text-3xl md:text-5xl font-bold text-white mt-4 mb-4'>
            Cameroonians Saving Time
            <br className='hidden md:block' /> with BOOKEasy
          </h2>
          <p className='text-white/60 text-lg max-w-2xl mx-auto'>
            Real stories from real people in your neighborhood
          </p>
        </motion.div>

        <div className='relative max-w-4xl mx-auto'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className='bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12'
            >
              <Quote className='w-12 h-12 text-[#D4A574] mb-6' />

              <p className='text-xl md:text-2xl text-white leading-relaxed mb-8'>
                "{testimonials[currentIndex].quote}"
              </p>

              <div className='flex items-center justify-between flex-wrap gap-4'>
                <div className='flex items-center gap-4'>
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className='w-16 h-16 rounded-full object-cover border-2 border-[#D4A574]'
                  />
                  <div>
                    <p className='text-white font-semibold text-lg'>
                      {testimonials[currentIndex].name}
                    </p>
                    <p className='text-white/60'>
                      {testimonials[currentIndex].role}
                    </p>
                    <div className='flex items-center gap-1 mt-1'>
                      <MapPin className='w-3 h-3 text-[#D4A574]' />
                      <span className='text-[#D4A574] text-sm'>
                        {testimonials[currentIndex].location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-1'>
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-5 h-5 fill-[#D4A574] text-[#D4A574]'
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className='flex items-center justify-center gap-4 mt-8'>
            <Button
              variant='ghost'
              size='icon'
              onClick={prevTestimonial}
              className='w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white'
            >
              <ChevronLeft className='w-6 h-6' />
            </Button>

            <div className='flex items-center gap-2'>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-[#D4A574]"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant='ghost'
              size='icon'
              onClick={nextTestimonial}
              className='w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white'
            >
              <ChevronRight className='w-6 h-6' />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
