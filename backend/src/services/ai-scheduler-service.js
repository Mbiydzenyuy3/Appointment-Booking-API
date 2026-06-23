import { logInfo, logError } from "../utils/logger.js";

/**
 * AI Scheduler Service
 * Provides AI-powered scheduling recommendations with accessibility optimization
 */
class AISchedulerService {
  constructor() {
    this.learningData = new Map(); // Store user learning data
    this.accessibilityProfiles = new Map(); // Store accessibility profiles
  }

  /**
   * Get accessibility-optimized appointment slots
   */
  async getAccessibilityOptimizedSlots(userId, serviceId, preferences = {}) {
    try {
      logInfo(
        `Getting accessibility-optimized slots for user ${userId}, service ${serviceId}`
      );

      // Get user's accessibility profile
      const profile = await this.getUserAccessibilityProfile(userId);

      // Get available slots (mock implementation - would integrate with slot service)
      const availableSlots = await this.getAvailableSlots(serviceId);

      // Apply accessibility optimizations
      const optimizedSlots = this.optimizeSlotsForAccessibility(
        availableSlots,
        profile,
        preferences
      );

      // Rank slots by accessibility score
      const rankedSlots = this.rankSlotsByAccessibility(
        optimizedSlots,
        profile
      );

      return {
        userId,
        serviceId,
        totalSlots: availableSlots.length,
        optimizedSlots: rankedSlots,
        accessibilityScore: this.calculateAccessibilityScore(profile),
        recommendations: this.generateAccessibilityRecommendations(profile)
      };
    } catch (error) {
      logError("Error getting accessibility-optimized slots:", error);
      throw error;
    }
  }

  /**
   * Learn from user appointment behavior
   */
  async learnFromUserBehavior(userId, appointmentData) {
    try {
      logInfo(`Learning from user ${userId} appointment behavior`);

      // Initialize learning data for user if not exists
      if (!this.learningData.has(userId)) {
        this.learningData.set(userId, {
          appointmentHistory: [],
          preferences: {},
          accessibilityInsights: {},
          lastUpdated: new Date()
        });
      }

      const userLearning = this.learningData.get(userId);

      // Add appointment data to history
      userLearning.appointmentHistory.push({
        ...appointmentData,
        timestamp: new Date(),
        outcome: appointmentData.status || "booked"
      });

      // Analyze patterns and update preferences
      const insights = this.analyzeAppointmentPatterns(
        userLearning.appointmentHistory
      );

      userLearning.preferences = {
        ...userLearning.preferences,
        ...insights.preferences
      };

      userLearning.accessibilityInsights = {
        ...userLearning.accessibilityInsights,
        ...insights.accessibility
      };

      userLearning.lastUpdated = new Date();

      // Update accessibility profile
      await this.updateAccessibilityProfile(userId, insights);

      return {
        userId,
        insights,
        updatedPreferences: userLearning.preferences,
        learningPoints: userLearning.appointmentHistory.length
      };
    } catch (error) {
      logError("Error learning from user behavior:", error);
      throw error;
    }
  }

  /**
   * Get user accessibility profile
   */
  async getUserAccessibilityProfile(userId) {
    // Mock implementation - would fetch from database
    if (!this.accessibilityProfiles.has(userId)) {
      this.accessibilityProfiles.set(userId, {
        cognitive: {
          simpleInterface: false,
          reducedOptions: false,
          extraTime: false,
          decisionFatigue: false
        },
        physical: {
          mobilityAids: false,
          visualImpairment: false,
          hearingImpairment: false
        },
        emotional: {
          anxietySensitive: false,
          stressSensitive: false
        },
        timing: {
          preferredHours: [9, 10, 11, 14, 15, 16],
          avoidHours: [12, 13, 17, 18],
          preferredDays: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday"
          ]
        },
        communication: {
          preferredFormat: "visual",
          language: "en",
          pace: "normal"
        }
      });
    }

    return this.accessibilityProfiles.get(userId);
  }

  /**
   * Get available slots for service (mock implementation)
   */
  async getAvailableSlots(serviceId) {
    // Mock data - would integrate with actual slot service
    const mockSlots = [];
    const now = new Date();

    // Generate mock slots for next 7 days
    for (let day = 0; day < 7; day++) {
      const slotDate = new Date(now);
      slotDate.setDate(now.getDate() + day);

      // Skip weekends if not preferred
      if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;

      // Generate slots from 9 AM to 5 PM
      for (let hour = 9; hour < 17; hour++) {
        mockSlots.push({
          id: `slot_${day}_${hour}`,
          serviceId,
          date: slotDate.toISOString().split("T")[0],
          startTime: `${hour.toString().padStart(2, "0")}:00`,
          endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
          duration: 60,
          available: Math.random() > 0.3, // 70% availability
          providerId: `provider_${Math.floor(Math.random() * 3) + 1}`,
          accessibility: {
            wheelchairAccessible: Math.random() > 0.5,
            parkingAvailable: Math.random() > 0.3,
            publicTransport: Math.random() > 0.4
          }
        });
      }
    }

    return mockSlots.filter((slot) => slot.available);
  }

  /**
   * Optimize slots based on accessibility profile
   */
  optimizeSlotsForAccessibility(slots, profile, preferences) {
    return slots.map((slot) => {
      let score = 100; // Base score
      const reasons = [];

      // Timing optimization
      const hour = parseInt(slot.startTime.split(":")[0]);
      if (profile.timing.preferredHours.includes(hour)) {
        score += 20;
        reasons.push("Preferred time slot");
      } else if (profile.timing.avoidHours.includes(hour)) {
        score -= 30;
        reasons.push("Avoided time slot");
      }

      // Day optimization
      const dayName = new Date(slot.date).toLocaleLowerCase("en-US", {
        weekday: "long"
      });
      if (profile.timing.preferredDays.includes(dayName)) {
        score += 15;
        reasons.push("Preferred day");
      }

      // Physical accessibility
      if (
        profile.physical.mobilityAids &&
        slot.accessibility.wheelchairAccessible
      ) {
        score += 25;
        reasons.push("Wheelchair accessible");
      }

      if (
        profile.physical.mobilityAids &&
        slot.accessibility.parkingAvailable
      ) {
        score += 10;
        reasons.push("Parking available");
      }

      // Cognitive optimization
      if (profile.cognitive.simpleInterface) {
        // Prefer morning slots when cognitive load is typically lower
        if (hour >= 9 && hour <= 11) {
          score += 15;
          reasons.push("Optimal cognitive time");
        }
      }

      // Emotional optimization
      if (profile.emotional.anxietySensitive) {
        // Prefer familiar locations or well-reviewed providers
        score += 5;
        reasons.push("Anxiety consideration");
      }

      return {
        ...slot,
        accessibilityScore: Math.max(0, Math.min(100, score)),
        optimizationReasons: reasons,
        recommended: score > 80
      };
    });
  }

  /**
   * Rank slots by accessibility score
   */
  rankSlotsByAccessibility(slots, profile) {
    return slots
      .sort((a, b) => b.accessibilityScore - a.accessibilityScore)
      .slice(0, 10); // Return top 10
  }

  /**
   * Calculate overall accessibility score
   */
  calculateAccessibilityScore(profile) {
    let score = 50; // Base score

    // Cognitive factors
    if (profile.cognitive.simpleInterface) score += 15;
    if (profile.cognitive.reducedOptions) score += 10;
    if (profile.cognitive.extraTime) score += 10;

    // Physical factors
    if (profile.physical.mobilityAids) score += 15;
    if (profile.physical.visualImpairment) score += 10;
    if (profile.physical.hearingImpairment) score += 10;

    // Emotional factors
    if (profile.emotional.anxietySensitive) score += 5;
    if (profile.emotional.stressSensitive) score += 5;

    return Math.min(100, score);
  }

  /**
   * Generate accessibility recommendations
   */
  generateAccessibilityRecommendations(profile) {
    const recommendations = [];

    if (profile.cognitive.simpleInterface) {
      recommendations.push({
        type: "interface",
        priority: "high",
        title: "Simplified Booking Interface",
        description: "Use step-by-step booking process with fewer options"
      });
    }

    if (profile.physical.mobilityAids) {
      recommendations.push({
        type: "location",
        priority: "high",
        title: "Accessible Locations",
        description: "Prioritize wheelchair-accessible locations with parking"
      });
    }

    if (profile.emotional.anxietySensitive) {
      recommendations.push({
        type: "communication",
        priority: "medium",
        title: "Familiar Environment",
        description: "Consider familiar locations to reduce anxiety"
      });
    }

    return recommendations;
  }

  /**
   * Analyze appointment patterns from history
   */
  analyzeAppointmentPatterns(history) {
    const insights = {
      preferences: {},
      accessibility: {}
    };

    if (history.length < 2) return insights;

    // Analyze timing preferences
    const successfulAppointments = history.filter(
      (h) => h.outcome === "completed"
    );
    const preferredHours = successfulAppointments.map((h) => {
      const time = h.appointmentTime || h.startTime;
      return parseInt(time.split(":")[0]);
    });

    if (preferredHours.length > 0) {
      // Find most common hours
      const hourCounts = {};
      preferredHours.forEach((hour) => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const topHours = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      insights.preferences.preferredHours = topHours;
    }

    // Analyze accessibility patterns
    const accessibilityIssues = history.filter(
      (h) => h.accessibilityIssues || h.complaints
    );

    if (accessibilityIssues.length > history.length * 0.3) {
      insights.accessibility.needsAccessibilitySupport = true;
    }

    return insights;
  }

  /**
   * Update accessibility profile based on learning insights
   */
  async updateAccessibilityProfile(userId, insights) {
    const profile = await this.getUserAccessibilityProfile(userId);

    // Update profile based on insights
    if (insights.preferences.preferredHours) {
      profile.timing.preferredHours = insights.preferences.preferredHours;
    }

    if (insights.accessibility.needsAccessibilitySupport) {
      profile.cognitive.simpleInterface = true;
    }

    this.accessibilityProfiles.set(userId, profile);
  }
}

// Export singleton instance
const aiSchedulerService = new AISchedulerService();

export default aiSchedulerService;
export { AISchedulerService };
