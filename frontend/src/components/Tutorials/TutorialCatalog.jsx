import React, { useState, useEffect } from "react";
import {
  Play,
  Clock,
  Star,
  Filter,
  Search,
  CheckCircle,
  Circle
} from "lucide-react";
import { useAccessibility } from "../../hooks/useAccessibility";
import { useTutorial } from "../../hooks/useTutorial";

// Tutorial data for core functionalities
const tutorialCatalog = {
  basic: [
    {
      id: "getting-started",
      title: "Getting Started with Appointment Booking",
      description:
        "Learn the basics of navigating and using our appointment booking system",
      category: "basic",
      duration: "3:45",
      difficulty: "beginner",
      thumbnail: "/tutorials/getting-started-thumb.jpg",
      videoUrl: "/tutorials/getting-started.mp4",
      captions: "/tutorials/getting-started.vtt",
      transcript:
        "Welcome to our appointment booking system. This tutorial will guide you through the basics...",
      objectives: [
        "Navigate the main interface",
        "Understand the dashboard layout",
        "Access help and tutorials",
        "Set up your user preferences"
      ],
      tags: ["navigation", "dashboard", "beginner"],
      prerequisites: []
    },
    {
      id: "creating-account",
      title: "Creating Your Account",
      description: "Step-by-step guide to setting up your user account",
      category: "basic",
      duration: "2:30",
      difficulty: "beginner",
      thumbnail: "/tutorials/creating-account-thumb.jpg",
      videoUrl: "/tutorials/creating-account.mp4",
      captions: "/tutorials/creating-account.vtt",
      transcript:
        "Creating your account is the first step to using our services...",
      objectives: [
        "Fill out registration form",
        "Verify your email address",
        "Set up security preferences",
        "Complete your profile"
      ],
      tags: ["registration", "account", "security"],
      prerequisites: []
    },
    {
      id: "first-appointment",
      title: "Booking Your First Appointment",
      description:
        "Learn how to book your first appointment quickly and easily",
      category: "booking",
      duration: "4:15",
      difficulty: "beginner",
      thumbnail: "/tutorials/first-appointment-thumb.jpg",
      videoUrl: "/tutorials/first-appointment.mp4",
      captions: "/tutorials/first-appointment.vtt",
      transcript:
        "Booking your first appointment is simple with our intuitive interface...",
      objectives: [
        "Select a service provider",
        "Choose available time slots",
        "Confirm appointment details",
        "Receive confirmation"
      ],
      tags: ["booking", "appointments", "time-slots"],
      prerequisites: ["getting-started"]
    }
  ],
  booking: [
    {
      id: "advanced-booking",
      title: "Advanced Booking Features",
      description: "Explore advanced booking options and preferences",
      category: "booking",
      duration: "5:20",
      difficulty: "intermediate",
      thumbnail: "/tutorials/advanced-booking-thumb.jpg",
      videoUrl: "/tutorials/advanced-booking.mp4",
      captions: "/tutorials/advanced-booking.vtt",
      transcript:
        "Advanced booking features help you customize your appointment experience...",
      objectives: [
        "Set recurring appointments",
        "Use quick booking presets",
        "Manage booking preferences",
        "Set reminder notifications"
      ],
      tags: ["advanced", "presets", "recurring"],
      prerequisites: ["first-appointment"]
    },
    {
      id: "managing-appointments",
      title: "Managing Your Appointments",
      description: "Learn to view, modify, and cancel appointments",
      category: "booking",
      duration: "3:50",
      difficulty: "beginner",
      thumbnail: "/tutorials/managing-appointments-thumb.jpg",
      videoUrl: "/tutorials/managing-appointments.mp4",
      captions: "/tutorials/managing-appointments.vtt",
      transcript:
        "Managing your appointments is easy with our comprehensive dashboard...",
      objectives: [
        "View upcoming appointments",
        "Reschedule existing appointments",
        "Cancel appointments",
        "View appointment history"
      ],
      tags: ["management", "rescheduling", "history"],
      prerequisites: ["first-appointment"]
    }
  ],
  senior: [
    {
      id: "senior-friendly-features",
      title: "Senior-Friendly Features Overview",
      description:
        "Discover all the accessibility and senior-friendly features",
      category: "accessibility",
      duration: "6:30",
      difficulty: "beginner",
      thumbnail: "/tutorials/senior-features-thumb.jpg",
      videoUrl: "/tutorials/senior-features.mp4",
      captions: "/tutorials/senior-features.vtt",
      transcript:
        "Our application includes many features designed specifically for senior users...",
      objectives: [
        "Enable senior mode",
        "Adjust font sizes and contrast",
        "Use simplified navigation",
        "Enable voice assistance"
      ],
      tags: ["senior", "accessibility", "usability"],
      prerequisites: []
    },
    {
      id: "large-buttons-guide",
      title: "Using Large Buttons and Clear Labels",
      description: "How to customize the interface for better visibility",
      category: "accessibility",
      duration: "2:45",
      difficulty: "beginner",
      thumbnail: "/tutorials/large-buttons-thumb.jpg",
      videoUrl: "/tutorials/large-buttons.mp4",
      captions: "/tutorials/large-buttons.vtt",
      transcript:
        "Large buttons and clear labels make the interface easier to use...",
      objectives: [
        "Enable large touch targets",
        "Adjust button sizes",
        "Customize labels and text",
        "Optimize for readability"
      ],
      tags: ["buttons", "visibility", "touch-targets"],
      prerequisites: ["senior-friendly-features"]
    }
  ],
  troubleshooting: [
    {
      id: "common-issues",
      title: "Solving Common Issues",
      description: "Quick solutions to frequently encountered problems",
      category: "troubleshooting",
      duration: "4:00",
      difficulty: "beginner",
      thumbnail: "/tutorials/common-issues-thumb.jpg",
      videoUrl: "/tutorials/common-issues.mp4",
      captions: "/tutorials/common-issues.vtt",
      transcript:
        "Here are solutions to the most common issues users encounter...",
      objectives: [
        "Fix login problems",
        "Resolve booking errors",
        "Handle payment issues",
        "Contact support"
      ],
      tags: ["troubleshooting", "problems", "solutions"],
      prerequisites: []
    }
  ]
};

const TutorialCatalog = ({
  isOpen,
  onClose,
  category = "all",
  onSelectTutorial
}) => {
  const { settings } = useAccessibility();
  const { completedTutorials, isTutorialCompleted } = useTutorial();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTutorials, setFilteredTutorials] = useState([]);

  useEffect(() => {
    // Filter tutorials based on category and search term
    let allTutorials = [];

    if (selectedCategory === "all") {
      allTutorials = Object.values(tutorialCatalog).flat();
    } else {
      allTutorials = tutorialCatalog[selectedCategory] || [];
    }

    if (searchTerm) {
      allTutorials = allTutorials.filter(
        (tutorial) =>
          tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tutorial.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          tutorial.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredTutorials(allTutorials);
  }, [selectedCategory, searchTerm]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-100";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100";
      case "advanced":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const categories = [
    {
      id: "all",
      name: "All Tutorials",
      count: Object.values(tutorialCatalog).flat().length
    },
    {
      id: "basic",
      name: "Getting Started",
      count: tutorialCatalog.basic?.length || 0
    },
    {
      id: "booking",
      name: "Booking",
      count: tutorialCatalog.booking?.length || 0
    },
    {
      id: "senior",
      name: "Senior Features",
      count: tutorialCatalog.senior?.length || 0
    },
    {
      id: "troubleshooting",
      name: "Help & Support",
      count: tutorialCatalog.troubleshooting?.length || 0
    }
  ];

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div
        className={`bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${
          settings.seniorMode ? "senior-mode" : ""
        } ${settings.largeTouchTargets ? "large-touch-targets" : ""}`}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Video Tutorials
            </h2>
            <p className='text-gray-600 mt-1'>
              Learn how to use our appointment booking system
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Close tutorial catalog'
          >
            ✕
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className='p-6 border-b border-gray-200 bg-gray-50'>
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Search tutorials...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              />
            </div>

            {/* Category Filter */}
            <div className='flex items-center space-x-2'>
              <Filter className='text-gray-400 w-5 h-5' />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500'
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tutorial Grid */}
        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className='bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => onSelectTutorial(tutorial)}
              >
                {/* Thumbnail */}
                <div className='relative'>
                  <div className='aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center'>
                    <Play className='w-12 h-12 text-gray-400' />
                  </div>

                  {/* Duration */}
                  <div className='absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center'>
                    <Clock className='w-3 h-3 mr-1' />
                    {tutorial.duration}
                  </div>

                  {/* Completion Status */}
                  <div className='absolute top-2 left-2'>
                    {isTutorialCompleted(tutorial.id) ? (
                      <CheckCircle className='w-6 h-6 text-green-600 bg-white rounded-full' />
                    ) : (
                      <Circle className='w-6 h-6 text-white bg-gray-400 rounded-full' />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className='p-4'>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='font-semibold text-gray-900 line-clamp-2'>
                      {tutorial.title}
                    </h3>
                  </div>

                  <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                    {tutorial.description}
                  </p>

                  <div className='flex items-center justify-between mb-3'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        tutorial.difficulty
                      )}`}
                    >
                      {tutorial.difficulty}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {tutorial.category}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {tutorial.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Objectives Preview */}
                  <div className='text-xs text-gray-500'>
                    <span className='font-medium'>Learn: </span>
                    {tutorial.objectives[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <Search className='w-16 h-16 mx-auto' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No tutorials found
              </h3>
              <p className='text-gray-600'>
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Progress Summary */}
        {completedTutorials.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <Star className='w-5 h-5 text-yellow-500 mr-2' />
                <span className='text-sm font-medium text-gray-700'>
                  {completedTutorials.length} tutorial
                  {completedTutorials.length !== 1 ? "s" : ""} completed
                </span>
              </div>
              <div className='text-xs text-gray-500'>
                Progress:{" "}
                {Math.round(
                  (completedTutorials.length /
                    Object.values(tutorialCatalog).flat().length) *
                    100
                )}
                %
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialCatalog;
