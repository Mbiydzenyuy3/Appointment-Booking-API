import React, { useState, useEffect, useCallback } from "react";
import { useAIScheduler } from "../../hooks/useAIScheduler.js";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

export default function SmartSchedulingDashboard() {
  const { user } = useAuth();
  const { accessibilityProfile, cognitiveLoadProfile, focusTimePreferences } =
    useAIScheduler();

  const [analytics, setAnalytics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load user analytics
      const analyticsResponse = await api.get(`/users/${user.id}/analytics`);
      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.data);
      }

      // Load recent appointments for pattern analysis
      const appointmentsResponse = await api.get("/appointments/list");
      if (appointmentsResponse.data.success) {
        setAppointments(appointmentsResponse.data.data || []);
      }

      // Generate insights based on user behavior
      generateInsights();
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, generateInsights]);

  const generateInsights = useCallback(() => {
    const newInsights = [];

    // Accessibility insights
    if (accessibilityProfile) {
      const totalFeatures = Object.values(accessibilityProfile).reduce(
        (total, category) => {
          return total + Object.values(category).filter(Boolean).length;
        },
        0
      );

      if (totalFeatures > 0) {
        newInsights.push({
          type: "accessibility",
          title: "Personalized Experience Active",
          description: `You have ${totalFeatures} accessibility features enabled. Our AI will optimize scheduling accordingly.`,
          priority: "info",
          icon: "♿"
        });
      }
    }

    // Cognitive load insights
    if (cognitiveLoadProfile) {
      const baselineLoad = cognitiveLoadProfile.baselineLoad;
      if (baselineLoad < 0.8) {
        newInsights.push({
          type: "cognitive",
          title: "Optimal Cognitive Performance",
          description:
            "Your profile indicates peak performance in morning hours (9-11 AM).",
          priority: "success",
          icon: "🧠"
        });
      } else if (baselineLoad > 1.2) {
        newInsights.push({
          type: "cognitive",
          title: "Cognitive Support Recommended",
          description:
            "Consider scheduling appointments during low-stress periods for better experience.",
          priority: "warning",
          icon: "⚠️"
        });
      }
    }

    // Focus time insights
    if (focusTimePreferences) {
      const interruptionSensitivity =
        focusTimePreferences.interruptionSensitivity;
      if (interruptionSensitivity === "high") {
        newInsights.push({
          type: "focus",
          title: "Focus Protection Active",
          description:
            "Your appointments will be scheduled to avoid your protected focus time blocks.",
          priority: "info",
          icon: "🛡️"
        });
      }
    }

    // Appointment pattern insights
    if (appointments.length > 0) {
      const preferredDays = getPreferredDays();
      const preferredTimes = getPreferredTimes();

      if (preferredDays.length > 0) {
        newInsights.push({
          type: "pattern",
          title: "Scheduling Pattern Detected",
          description: `You prefer appointments on: ${preferredDays.join(
            ", "
          )}`,
          priority: "info",
          icon: "📊"
        });
      }

      if (preferredTimes.length > 0) {
        newInsights.push({
          type: "pattern",
          title: "Time Preference Identified",
          description: `Your preferred appointment times are: ${preferredTimes.join(
            ", "
          )}`,
          priority: "info",
          icon: "⏰"
        });
      }
    }

    // Learning progress insight
    if (analytics?.aiLearningData?.length > 5) {
      newInsights.push({
        type: "learning",
        title: "AI Learning Progress",
        description: `Our AI has learned from ${analytics.aiLearningData.length} of your appointments to provide better suggestions.`,
        priority: "success",
        icon: "🤖"
      });
    }

    setInsights(newInsights);
  }, [
    accessibilityProfile,
    cognitiveLoadProfile,
    focusTimePreferences,
    appointments,
    analytics,
    getPreferredDays,
    getPreferredTimes
  ]);

  const getPreferredDays = useCallback(() => {
    if (appointments.length === 0) return [];

    const dayCount = {};
    appointments.forEach((appt) => {
      const day = new Date(appt.date).toLocaleDateString("en-US", {
        weekday: "long"
      });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    return Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
  }, [appointments]);

  const getPreferredTimes = useCallback(() => {
    if (appointments.length === 0) return [];

    const timeCount = {};
    appointments.forEach((appt) => {
      const time = new Date(appt.date).getHours();
      const timeSlot =
        time < 12 ? "Morning" : time < 17 ? "Afternoon" : "Evening";
      timeCount[timeSlot] = (timeCount[timeSlot] || 0) + 1;
    });

    return Object.entries(timeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([time]) => time);
  }, [appointments]);

  const getInsightColor = (priority) => {
    const colors = {
      info: "bg-blue-50 border-blue-200 text-blue-800",
      success: "bg-green-50 border-green-200 text-green-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      error: "bg-red-50 border-red-200 text-red-800"
    };
    return colors[priority] || colors.info;
  };

  const renderOverview = () => (
    <div className='space-y-6'>
      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                AI Learning Score
              </p>
              <p className='text-3xl font-bold text-green-600'>
                {analytics?.analytics?.completionRate || 0}%
              </p>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
              <span className='text-2xl'>🤖</span>
            </div>
          </div>
          <p className='text-sm text-gray-500 mt-2'>
            Appointment completion rate
          </p>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Cognitive Load
              </p>
              <p className='text-3xl font-bold text-blue-600'>
                {cognitiveLoadProfile?.baselineLoad?.toFixed(1) || "1.0"}
              </p>
            </div>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
              <span className='text-2xl'>🧠</span>
            </div>
          </div>
          <p className='text-sm text-gray-500 mt-2'>Baseline cognitive load</p>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Focus Protection
              </p>
              <p className='text-3xl font-bold text-purple-600'>
                {focusTimePreferences?.interruptionSensitivity || "Medium"}
              </p>
            </div>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
              <span className='text-2xl'>🛡️</span>
            </div>
          </div>
          <p className='text-sm text-gray-500 mt-2'>Interruption sensitivity</p>
        </div>
      </div>

      {/* Insights */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <span className='text-2xl mr-2'>💡</span>
          AI Insights & Recommendations
        </h3>

        {insights.length === 0 ? (
          <div className='text-center py-8'>
            <div className='text-4xl mb-4'>🤔</div>
            <p className='text-gray-600'>No insights available yet.</p>
            <p className='text-sm text-gray-500 mt-2'>
              Book some appointments to get personalized insights.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getInsightColor(
                  insight.priority
                )}`}
              >
                <div className='flex items-start'>
                  <span className='text-xl mr-3'>{insight.icon}</span>
                  <div className='flex-1'>
                    <h4 className='font-medium'>{insight.title}</h4>
                    <p className='text-sm mt-1 opacity-90'>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <span className='text-2xl mr-2'>📊</span>
          Appointment Analytics
        </h3>

        {analytics ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-gray-900'>
                {analytics.analytics?.totalAppointments || 0}
              </p>
              <p className='text-sm text-gray-600'>Total Appointments</p>
            </div>
            <div className='text-center'>
              <p className='text-3xl font-bold text-green-600'>
                {analytics.analytics?.completedAppointments || 0}
              </p>
              <p className='text-sm text-gray-600'>Completed</p>
            </div>
            <div className='text-center'>
              <p className='text-3xl font-bold text-red-600'>
                {analytics.analytics?.cancelledAppointments || 0}
              </p>
              <p className='text-sm text-gray-600'>Cancelled</p>
            </div>
          </div>
        ) : (
          <div className='text-center py-8'>
            <div className='text-4xl mb-4'>📈</div>
            <p className='text-gray-600'>Analytics data loading...</p>
          </div>
        )}
      </div>

      {/* Learning Data */}
      {analytics?.aiLearningData?.length > 0 && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <span className='text-2xl mr-2'>🧠</span>
            AI Learning Progress
          </h3>
          <div className='space-y-4'>
            {analytics.aiLearningData.slice(-5).map((data, index) => (
              <div
                key={index}
                className='border-l-4 border-green-500 pl-4 py-2'
              >
                <p className='text-sm text-gray-600'>
                  {new Date(data.timestamp).toLocaleDateString()}
                </p>
                <p className='text-sm text-gray-800'>
                  Learned preferences:{" "}
                  {Object.keys(data)
                    .filter((key) => key !== "timestamp" && key !== "source")
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAccessibility = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <span className='text-2xl mr-2'>♿</span>
          Accessibility Profile
        </h3>

        {accessibilityProfile ? (
          <div className='space-y-6'>
            {Object.entries(accessibilityProfile).map(
              ([category, features]) => {
                const enabledFeatures = Object.entries(features).filter(
                  ([, enabled]) => enabled
                );

                if (enabledFeatures.length === 0) return null;

                return (
                  <div key={category} className='border rounded-lg p-4'>
                    <h4 className='font-medium text-gray-900 mb-3 capitalize'>
                      {category} Accessibility ({enabledFeatures.length}{" "}
                      enabled)
                    </h4>
                    <div className='space-y-2'>
                      {enabledFeatures.map(([feature]) => (
                        <div
                          key={feature}
                          className='flex items-center text-sm text-gray-700'
                        >
                          <span className='w-2 h-2 bg-green-500 rounded-full mr-3'></span>
                          {feature.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className='text-center py-8'>
            <div className='text-4xl mb-4'>⚙️</div>
            <p className='text-gray-600'>No accessibility preferences set.</p>
            <p className='text-sm text-gray-500 mt-2'>
              Configure your accessibility needs for better scheduling.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-center items-center py-12'>
          <div className='text-center'>
            <div className='loading-spinner mx-auto mb-4 w-8 h-8'></div>
            <p className='text-gray-600'>
              Loading your smart scheduling dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto'>
      {/* Header */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 flex items-center'>
          <span className='text-3xl mr-3'>🤖</span>
          Smart Scheduling Dashboard
        </h1>
        <p className='text-gray-600 mt-2'>
          AI-powered insights and analytics for your accessibility-first
          scheduling experience
        </p>
      </div>

      {/* Tab Navigation */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 px-6'>
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "analytics", label: "Analytics", icon: "📈" },
              { id: "accessibility", label: "Accessibility", icon: "♿" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 touch-target ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className='mr-2'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "analytics" && renderAnalytics()}
          {activeTab === "accessibility" && renderAccessibility()}
        </div>
      </div>
    </div>
  );
}
