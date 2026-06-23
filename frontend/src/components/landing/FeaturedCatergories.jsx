import React from "react";
import {
  Scissors,
  Wrench,
  Dumbbell,
  PawPrint,
  Heart,
  GraduationCap,
  ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Hair & Beauty",
    description: "Salons, barbers, spas & more",
    icon: Scissors,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    count: "120+ providers",
    href: "/explore?category=salon"
  },
  {
    name: "Home Repairs",
    description: "Plumbers, electricians, handymen",
    icon: Wrench,
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-50",
    count: "85+ providers",
    href: "/explore?category=plumber"
  },
  {
    name: "Personal Training",
    description: "Fitness coaches & trainers",
    icon: Dumbbell,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    count: "60+ providers",
    href: "/explore?category=personal-trainer"
  },
  {
    name: "Pet Care",
    description: "Groomers, walkers, sitters",
    icon: PawPrint,
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-50",
    count: "45+ providers",
    href: "/explore?category=pet-walker"
  },
  {
    name: "Wellness",
    description: "Massage, yoga, meditation",
    icon: Heart,
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50",
    count: "70+ providers",
    href: "/explore?category=wellness"
  },
  {
    name: "Tutoring",
    description: "Academic & skill tutors",
    icon: GraduationCap,
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    count: "90+ providers",
    href: "/explore?category=tutor"
  }
];

export default function FeaturedCategories() {
  const navigate = useNavigate();

  return (
    <section id='services' className='py-24 lg:py-32 bg-slate-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <span className='text-emerald-600 font-semibold text-sm tracking-wider uppercase'>
            Browse Services
          </span>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 tracking-tight'>
            Popular categories
          </h2>
          <p className='text-slate-600 mt-4 max-w-2xl mx-auto text-lg'>
            Discover top-rated professionals across a wide range of services
          </p>
        </div>

        {/* Categories Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className='group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 cursor-pointer overflow-hidden block'
            >
              {/* Hover Background */}
              <div
                className={`absolute inset-0 ${category.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className='relative z-10'>
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <category.icon className='w-7 h-7 text-white' />
                </div>

                {/* Content */}
                <h3 className='text-xl font-bold text-slate-900 mb-1 group-hover:text-slate-900'>
                  {category.name}
                </h3>
                <p className='text-slate-500 mb-4'>{category.description}</p>

                {/* Footer */}
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-emerald-600'>
                    {category.count}
                  </span>
                  <div className='w-8 h-8 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center transition-colors'>
                    <ArrowRight className='w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all' />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className='text-center mt-12'>
          <button
            onClick={() => navigate("/explore")}
            className='inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors cursor-pointer group'
          >
            View all categories
            <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
          </button>
        </div>
      </div>
    </section>
  );
}
