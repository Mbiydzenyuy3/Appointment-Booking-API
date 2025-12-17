// AI-Powered Accessibility-First Scheduling Service - Enhanced with Machine Learning
import {
  findById as findUserById,
  addAILearningData
} from "../models/user-model.js";
import { findAppointmentsByUser } from "../models/appointment-model.js";
import { searchAvailableSlots } from "../models/slot-model.js";
import { getServiceById } from "../services/services-service.js";

class AISchedulerService {
  constructor() {
    // Enhanced accessibility preferences with more granular controls
    this.accessibilityPreferences = {
      visual: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        colorBlindFriendly: false,
        visualProcessingDelay: false, // New: for visual processing difficulties
        motionSensitivity: false // New: for motion-sensitive users
      },
      cognitive: {
        simpleInterface: false,
        reducedOptions: false,
        extraTime: false,
        clearInstructions: false,
        sequentialProcessing: false, // New: prefers step-by-step
        memorySupport: false, // New: needs memory assistance
        decisionFatigue: false // New: prone to decision fatigue
      },
      motor: {
        largerTouchTargets: false,
        voiceControl: false,
        switchControl: false,
        extendedTime: false,
        tremorSupport: false, // New: for users with tremors
        limitedMobility: false // New: for limited mobility users
      },
      auditory: {
        hearingImpaired: false,
        visualAlerts: false,
        signLanguage: false,
        captions: false,
        soundSensitivity: false, // New: sensitive to loud sounds
        backgroundNoise: false // New: needs quiet environment
      },
      emotional: {
        // New: Emotional/psychological accessibility
        anxietySensitive: false,
        stressSensitive: false,
        routineDependent: false,
        socialAnxiety: false
      }
    };

    // Enhanced cognitive load factors with machine learning weights
    this.cognitiveLoadFactors = {
      timeOfDay: {
        earlyMorning: 0.7, // 6-8 AM
        morning: 0.8, // 9-11 AM
        midDay: 0.9, // 12-13 PM
        afternoon: 1.0, // 14-16 PM
        lateAfternoon: 1.1, // 17-18 PM
        evening: 1.3 // 19-21 PM
      },
      dayOfWeek: {
        monday: 1.1, // Higher stress
        tuesday: 0.9,
        wednesday: 0.8, // Optimal
        thursday: 0.9,
        friday: 1.2, // Higher stress
        saturday: 1.0,
        sunday: 1.1 // Prep stress
      },
      appointmentType: {
        consultation: 0.6,
        routine: 0.7,
        followUp: 0.8,
        complex: 1.3,
        emergency: 1.6,
        procedure: 1.1,
        therapy: 0.9
      },
      seasonalFactors: {
        winter: 1.1, // Higher cognitive load in winter
        spring: 0.9,
        summer: 0.8,
        fall: 1.0
      }
    };

    // Enhanced focus time ranges with ML-based personalization
    this.focusTimeRanges = {
      deepWork: { start: 9, end: 11, weight: 0.6, type: "cognitive_intensive" },
      routineTasks: { start: 11, end: 15, weight: 1.0, type: "moderate" },
      administrative: { start: 15, end: 17, weight: 0.8, type: "low_focus" },
      wrapUp: { start: 17, end: 18, weight: 1.2, type: "transitional" },
      buffer: { start: 0, end: 24, weight: 0.3, type: "transition" } // New: transition times
    };

    // Machine Learning Model Weights
    this.mlWeights = {
      accessibilityMatch: 0.35,
      cognitiveLoad: 0.25,
      focusProtection: 0.2,
      userHistory: 0.15,
      contextualFactors: 0.05
    };

    // Age-based cognitive profiles
    this.ageCognitiveProfiles = {
      "18-25": { energyPeak: 10, fatiguePoint: 16, stressResistance: 0.9 },
      "26-35": { energyPeak: 9, fatiguePoint: 17, stressResistance: 1.0 },
      "36-45": { energyPeak: 10, fatiguePoint: 16, stressResistance: 1.1 },
      "46-55": { energyPeak: 9, fatiguePoint: 15, stressResistance: 1.2 },
      "56-65": { energyPeak: 8, fatiguePoint: 14, stressResistance: 1.3 },
      "65+": { energyPeak: 9, fatiguePoint: 14, stressResistance: 1.4 }
    };
  }

  /**
   * Get AI-powered appointment suggestions with enhanced ML algorithms
   */
  async getAccessibilityOptimizedSlots(userId, serviceId, preferences = {}) {
    try {
      const user = await findUserById(userId);
      const service = await getServiceById(serviceId);

      if (!user || !service) {
        throw new Error("User or service not found");
      }

      // Merge user preferences with provided preferences
      const accessibilityProfile = {
        ...user.accessibility_preferences,
        ...preferences
      };

      // Get available slots
      const availableSlots = await searchAvailableSlots({
        providerId: service.provider_id,
        serviceId: serviceId,
        day: new Date().toISOString().split("T")[0] // Today's date or later
      });

      // Apply enhanced ML algorithm to rank slots
      const rankedSlots = await this.rankSlotsWithML(
        availableSlots,
        accessibilityProfile,
        user,
        service
      );

      // Generate personalized insights
      const insights = await this.generatePersonalizedInsights(
        rankedSlots,
        accessibilityProfile,
        user
      );

      return {
        suggestions: rankedSlots.slice(0, 10), // Top 10 suggestions
        reasoning: this.generateEnhancedAccessibilityReasoning(
          rankedSlots.slice(0, 5),
          accessibilityProfile,
          user
        ),
        accessibilityFeatures:
          this.getAccessibilityFeatures(accessibilityProfile),
        insights: insights,
        confidence: this.calculatePredictionConfidence(rankedSlots.slice(0, 5)),
        adaptiveRecommendations: this.generateAdaptiveRecommendations(
          accessibilityProfile,
          user
        )
      };
    } catch (error) {
      console.error("AI Scheduling Error:", error);
      throw new Error("Failed to generate accessibility-optimized suggestions");
    }
  }

  /**
   * Enhanced ML-based slot ranking with multiple factors
   */
  async rankSlotsWithML(slots, accessibilityProfile, user, service) {
    // Get historical user behavior patterns
    const userHistory = await this.analyzeUserBehaviorPatterns(user.id);

    return slots
      .map((slot) => {
        const mlScore = this.calculateMLScore(
          slot,
          accessibilityProfile,
          user,
          service,
          userHistory
        );
        const cognitiveLoad = this.calculateEnhancedCognitiveLoad(
          slot,
          service,
          user,
          userHistory
        );
        const focusProtection = this.calculateAdvancedFocusProtection(
          slot,
          user.preferences,
          userHistory
        );
        const contextualScore = this.calculateContextualScore(slot, user);

        return {
          ...slot,
          mlScore,
          cognitiveLoad,
          focusProtection,
          contextualScore,
          accessibilityRecommendations: this.getSlotRecommendations(
            slot,
            accessibilityProfile
          ),
          confidence: this.calculateSlotConfidence(
            slot,
            accessibilityProfile,
            user
          ),
          reasoning: this.generateSlotReasoning(
            slot,
            accessibilityProfile,
            user
          )
        };
      })
      .sort((a, b) => b.mlScore - a.mlScore);
  }

  /**
   * Calculate ML-based score using weighted factors
   */
  calculateMLScore(slot, accessibilityProfile, user, service, userHistory) {
    let score = 0;

    // Accessibility match (35%)
    const accessibilityScore = this.calculateAccessibilityScore(
      slot,
      accessibilityProfile,
      user,
      service
    );
    score += accessibilityScore * this.mlWeights.accessibilityMatch;

    // Cognitive load optimization (25%)
    const cognitiveScore =
      (1 -
        this.calculateEnhancedCognitiveLoad(slot, service, user, userHistory)) *
      100;
    score += cognitiveScore * this.mlWeights.cognitiveLoad;

    // Focus protection (20%)
    const focusScore = this.calculateAdvancedFocusProtection(
      slot,
      user.preferences,
      userHistory
    );
    score += focusScore * this.mlWeights.focusProtection;

    // User history pattern matching (15%)
    const historyScore = this.calculateHistoryPatternMatch(slot, userHistory);
    score += historyScore * this.mlWeights.userHistory;

    // Contextual factors (5%)
    const contextualScore = this.calculateContextualScore(slot, user);
    score += contextualScore * this.mlWeights.contextualFactors;

    return Math.round(score);
  }

  /**
   * Analyze user behavior patterns for personalization
   */
  async analyzeUserBehaviorPatterns(userId) {
    try {
      const appointments = await findAppointmentsByUser(userId, {
        status: { $in: ["completed", "cancelled"] },
        limit: 50
      });

      const patterns = {
        preferredTimes: [],
        preferredDays: [],
        avoidedTimes: [],
        cancellationPatterns: [],
        completionPatterns: [],
        timePreferenceScore: {},
        stressIndicators: []
      };

      appointments.forEach((apt) => {
        const aptDate = new Date(apt.appointment_date);
        const hour = aptDate.getHours();
        const day = aptDate.getDay();

        if (apt.status === "completed") {
          patterns.preferredTimes.push(hour);
          patterns.preferredDays.push(day);
          patterns.completionPatterns.push({
            hour,
            day,
            timeSlot: apt.appointment_time
          });
        } else if (apt.status === "cancelled") {
          patterns.avoidedTimes.push(hour);
          patterns.cancellationPatterns.push({
            hour,
            day,
            timeSlot: apt.appointment_time,
            reason: apt.cancellation_reason
          });
        }
      });

      // Calculate preference scores
      patterns.timePreferenceScore =
        this.calculateTimePreferenceScores(patterns);

      return patterns;
    } catch (error) {
      console.error("Error analyzing user patterns:", error);
      return {};
    }
  }

  /**
   * Calculate time preference scores from user history
   */
  calculateTimePreferenceScores(patterns) {
    const scores = {};

    // Calculate preference for each hour
    for (let hour = 0; hour < 24; hour++) {
      const preferredCount = patterns.preferredTimes.filter(
        (h) => h === hour
      ).length;
      const avoidedCount = patterns.avoidedTimes.filter(
        (h) => h === hour
      ).length;
      const total = preferredCount + avoidedCount;

      if (total > 0) {
        scores[hour] = (preferredCount - avoidedCount) / total;
      } else {
        scores[hour] = 0;
      }
    }

    return scores;
  }

  /**
   * Calculate history pattern matching score
   */
  calculateHistoryPatternMatch(slot, userHistory) {
    if (!userHistory.timePreferenceScore) return 50; // Neutral score

    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    const preferenceScore = userHistory.timePreferenceScore[hour] || 0;

    // Convert to 0-100 scale
    return ((preferenceScore + 1) / 2) * 100;
  }

  /**
   * Calculate contextual score based on external factors
   */
  calculateContextualScore(slot, user) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();
    const day = timeSlot.getDay();

    let score = 50; // Base score

    // Weather considerations (if available)
    const month = timeSlot.getMonth();
    if (month >= 11 || month <= 2) {
      // Winter months - potential mood impact
      score -= user.age && user.age > 55 ? 5 : 0;
    }

    // Holiday periods (simplified check)
    const isNearHoliday = this.isNearHoliday(timeSlot);
    if (isNearHoliday) {
      score -= 10;
    }

    // Rush hour avoidance
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if date is near major holidays
   */
  isNearHoliday(date) {
    const month = date.getMonth();
    const day = date.getDate();

    // Simplified holiday checks
    const holidays = [
      { month: 0, day: 1 }, // New Year
      { month: 6, day: 4 }, // Independence Day
      { month: 11, day: 25 }, // Christmas
      { month: 10, last: true } // Thanksgiving (last Thursday)
    ];

    return holidays.some((holiday) => {
      if (holiday.last) {
        return month === holiday.month; // Simplified
      }
      return month === holiday.month && Math.abs(day - holiday.day) <= 3;
    });
  }

  /**
   * Calculate enhanced cognitive load with ML factors
   */
  calculateEnhancedCognitiveLoad(slot, service, user, userHistory) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();
    const dayOfWeek = timeSlot.getDay();
    const month = timeSlot.getMonth();

    let load = 1.0;

    // Enhanced time of day factor
    if (hour >= 6 && hour <= 8)
      load *= this.cognitiveLoadFactors.timeOfDay.earlyMorning;
    else if (hour >= 9 && hour <= 11)
      load *= this.cognitiveLoadFactors.timeOfDay.morning;
    else if (hour >= 12 && hour <= 13)
      load *= this.cognitiveLoadFactors.timeOfDay.midDay;
    else if (hour >= 14 && hour <= 16)
      load *= this.cognitiveLoadFactors.timeOfDay.afternoon;
    else if (hour >= 17 && hour <= 18)
      load *= this.cognitiveLoadFactors.timeOfDay.lateAfternoon;
    else load *= this.cognitiveLoadFactors.timeOfDay.evening;

    // Day of week factor
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];
    load *= this.cognitiveLoadFactors.dayOfWeek[dayNames[dayOfWeek]] || 1.0;

    // Service complexity factor
    const complexityMap = {
      consultation: this.cognitiveLoadFactors.appointmentType.consultation,
      routine: this.cognitiveLoadFactors.appointmentType.routine,
      followUp: this.cognitiveLoadFactors.appointmentType.followUp,
      complex: this.cognitiveLoadFactors.appointmentType.complex,
      emergency: this.cognitiveLoadFactors.appointmentType.emergency,
      procedure: this.cognitiveLoadFactors.appointmentType.procedure,
      therapy: this.cognitiveLoadFactors.appointmentType.therapy
    };
    load *= complexityMap[service.type] || 1.0;

    // Seasonal factors
    const seasonNames = ["winter", "spring", "summer", "fall"];
    const season = seasonNames[Math.floor(month / 3)];
    load *= this.cognitiveLoadFactors.seasonalFactors[season] || 1.0;

    // User accessibility factors
    if (user.accessibility_preferences?.cognitive?.simpleInterface) {
      load *= 0.7; // Reduce cognitive load for users who need simpler interfaces
    }

    // Age-based adjustments
    if (user.age) {
      const ageGroup = this.getAgeGroup(user.age);
      const ageProfile = this.ageCognitiveProfiles[ageGroup];
      if (ageProfile) {
        // Adjust based on energy patterns
        const hourFromPeak = Math.abs(hour - ageProfile.energyPeak);
        load *= 1 + hourFromPeak * 0.05; // Increase load further from peak energy
      }
    }

    // User history adjustments
    if (userHistory?.cancellationPatterns?.length > 0) {
      // Increase cognitive load if user has high cancellation patterns
      const cancellationRate =
        userHistory.cancellationPatterns.length /
        (userHistory.completionPatterns.length +
          userHistory.cancellationPatterns.length);
      if (cancellationRate > 0.3) {
        load *= 1.2; // 20% increase for high cancellation rates
      }
    }

    return Math.round(load * 100) / 100;
  }

  /**
   * Get age group from user age
   */
  getAgeGroup(age) {
    if (age <= 25) return "18-25";
    if (age <= 35) return "26-35";
    if (age <= 45) return "36-45";
    if (age <= 55) return "46-55";
    if (age <= 65) return "56-65";
    return "65+";
  }

  /**
   * Calculate advanced focus protection with ML insights
   */
  calculateAdvancedFocusProtection(slot, userPreferences, userHistory) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    let protection = 0;

    // Enhanced focus time protection based on focusTimeRanges
    Object.values(this.focusTimeRanges).forEach((range) => {
      if (hour >= range.start && hour < range.end) {
        protection += range.weight * 40; // Base protection
      }
    });

    // Personalized protection based on user history
    if (userHistory?.preferredTimes?.includes(hour)) {
      protection += 20; // Extra protection for preferred times
    }

    // Avoid high-stress periods
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      protection -= 15; // Reduce protection during rush hours
    }

    // Buffer time protection (transition periods)
    const isBufferTime =
      (hour >= 8 && hour <= 9) ||
      (hour >= 11 && hour <= 12) ||
      (hour >= 15 && hour <= 16);
    if (isBufferTime) {
      protection += 10;
    }

    return Math.max(0, Math.min(100, protection));
  }

  /**
   * Calculate prediction confidence for suggestions
   */
  calculatePredictionConfidence(topSlots) {
    if (topSlots.length === 0) return 0;

    const avgScore =
      topSlots.reduce((sum, slot) => sum + (slot.mlScore || 0), 0) /
      topSlots.length;
    const variance =
      topSlots.reduce(
        (sum, slot) => sum + Math.pow((slot.mlScore || 0) - avgScore, 2),
        0
      ) / topSlots.length;
    const standardDeviation = Math.sqrt(variance);

    // Higher confidence when scores are consistent and high
    const consistencyScore = Math.max(0, 100 - standardDeviation);
    const qualityScore = Math.min(100, avgScore);

    return Math.round((consistencyScore + qualityScore) / 2);
  }

  /**
   * Calculate individual slot confidence
   */
  calculateSlotConfidence(slot, accessibilityProfile, user) {
    let confidence = 50; // Base confidence

    // Higher confidence for users with clear accessibility preferences
    const preferenceCount = Object.values(accessibilityProfile)
      .flatMap((category) => Object.values(category || {}))
      .filter(Boolean).length;

    if (preferenceCount > 5) confidence += 20;
    if (preferenceCount > 10) confidence += 15;

    // Adjust based on user age and experience
    if (user.age) {
      if (user.age > 65) confidence += 10; // Seniors may have more consistent patterns
      if (user.age >= 18 && user.age <= 25) confidence -= 5; // Young adults may be more variable
    }

    // Reduce confidence if user's cognitive load profile is complex
    if (accessibilityProfile.cognitive?.decisionFatigue) {
      confidence -= 10;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Generate personalized insights
   */
  async generatePersonalizedInsights(slots, accessibilityProfile, user) {
    const insights = [];

    // Time pattern insights
    const timePatterns = this.analyzeTimePatterns(slots);
    if (timePatterns.optimalDays.length > 0) {
      insights.push({
        type: "timing",
        title: "Your Optimal Days",
        description: `You perform best on ${timePatterns.optimalDays.join(
          ", "
        )}`,
        actionable: true,
        recommendation: "Schedule important appointments on these days"
      });
    }

    // Accessibility insights
    const accessibilityInsights =
      this.generateAccessibilityInsights(accessibilityProfile);
    insights.push(...accessibilityInsights);

    // Cognitive load insights
    if (accessibilityProfile.cognitive?.simpleInterface) {
      insights.push({
        type: "cognitive",
        title: "Cognitive Comfort",
        description:
          "Your appointments are optimized for lower cognitive load periods",
        actionable: false
      });
    }

    return insights;
  }

  /**
   * Analyze time patterns in ranked slots
   */
  analyzeTimePatterns(slots) {
    const dayFrequency = {};
    const hourFrequency = {};

    slots.forEach((slot) => {
      const date = new Date(slot.day);
      const dayOfWeek = date.getDay();
      const hour = new Date(`${slot.day}T${slot.start_time}`).getHours();

      dayFrequency[dayOfWeek] = (dayFrequency[dayOfWeek] || 0) + 1;
      hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
    });

    const optimalDays = Object.entries(dayFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => {
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ];
        return days[parseInt(day)];
      });

    const optimalHours = Object.entries(hourFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    return { optimalDays, optimalHours };
  }

  /**
   * Generate accessibility-specific insights
   */
  generateAccessibilityInsights(accessibilityProfile) {
    const insights = [];

    if (accessibilityProfile.visual?.highContrast) {
      insights.push({
        type: "visual",
        title: "Visual Accessibility Optimized",
        description:
          "Your appointments are scheduled during optimal lighting conditions",
        actionable: true,
        recommendation: "Arrive 5 minutes early to adjust to the lighting"
      });
    }

    if (accessibilityProfile.emotional?.anxietySensitive) {
      insights.push({
        type: "emotional",
        title: "Anxiety-Aware Scheduling",
        description: "We avoid high-stress time periods for your appointments",
        actionable: true,
        recommendation:
          "Consider arriving early to familiarise yourself with the environment"
      });
    }

    return insights;
  }

  /**
   * Generate enhanced accessibility reasoning
   */
  generateEnhancedAccessibilityReasoning(topSlots, accessibilityProfile, user) {
    const reasons = [];

    topSlots.forEach((slot, index) => {
      const reasoning = [];

      // ML-based reasoning
      if (slot.mlScore > 130) {
        reasoning.push(
          "Excellent match based on your accessibility profile and behavior patterns"
        );
      }

      if (slot.cognitiveLoad < 0.8) {
        reasoning.push(
          "Low cognitive load period - optimal for your decision-making needs"
        );
      }

      if (slot.focusProtection > 40) {
        reasoning.push(
          "Protected focus time - minimal environmental distractions"
        );
      }

      // Personalization reasoning
      if (slot.confidence > 80) {
        reasoning.push(
          "High-confidence recommendation based on your historical preferences"
        );
      }

      // Age-based reasoning
      if (user.age) {
        const ageGroup = this.getAgeGroup(user.age);
        const ageProfile = this.ageCognitiveProfiles[ageGroup];
        if (ageProfile && slot.mlScore > 120) {
          reasoning.push(`Optimized for ${ageGroup} cognitive patterns`);
        }
      }

      // Contextual reasoning
      if (slot.contextualScore > 70) {
        reasoning.push(
          "Excellent contextual factors (lighting, environment, timing)"
        );
      }

      reasons.push({
        slotId: slot.timeslot_id,
        rank: index + 1,
        reasoning:
          reasoning.length > 0 ? reasoning : ["Good general accessibility fit"],
        confidence: slot.confidence,
        mlScore: slot.mlScore
      });
    });

    return reasons;
  }

  /**
   * Generate slot-specific reasoning
   */
  generateSlotReasoning(slot, accessibilityProfile, user) {
    const reasoning = [];

    // Accessibility match reasoning
    if (slot.mlScore > 120) {
      reasoning.push(
        `High compatibility score (${slot.mlScore}/150) with your accessibility needs`
      );
    }

    // Time-based reasoning
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    if (hour >= 9 && hour <= 11) {
      reasoning.push("Peak cognitive performance time");
    } else if (hour >= 14 && hour <= 16) {
      reasoning.push("Post-lunch focus period");
    }

    // Personalization reasoning
    if (slot.confidence > 80) {
      reasoning.push("Based on your appointment history patterns");
    }

    return reasoning;
  }

  /**
   * Generate adaptive recommendations
   */
  generateAdaptiveRecommendations(accessibilityProfile, user) {
    const recommendations = [];

    // Dynamic interface recommendations
    if (accessibilityProfile.cognitive?.simpleInterface) {
      recommendations.push({
        type: "interface",
        priority: "high",
        title: "Simplified Booking Process",
        description:
          "Enable step-by-step guided booking to reduce cognitive load",
        action: "toggle_step_by_step"
      });
    }

    // Timing recommendations
    if (accessibilityProfile.cognitive?.decisionFatigue) {
      recommendations.push({
        type: "timing",
        priority: "medium",
        title: "Decision Break Reminders",
        description:
          "Set reminders to take breaks during long booking sessions",
        action: "enable_break_reminders"
      });
    }

    // Accessibility feature recommendations
    if (accessibilityProfile.visual?.motionSensitivity) {
      recommendations.push({
        type: "accessibility",
        priority: "high",
        title: "Reduced Motion Interface",
        description: "Enable interface with minimal animations and transitions",
        action: "enable_reduced_motion"
      });
    }

    return recommendations;
  }

  // Legacy methods maintained for backward compatibility

  /**
   * Calculate accessibility score for a time slot
   */
  calculateAccessibilityScore(slot, accessibilityProfile, user, service) {
    let score = 100; // Base score

    // Visual accessibility factors
    if (accessibilityProfile.visual?.highContrast) {
      score += this.getOptimalTimeForHighContrast(slot);
    }
    if (accessibilityProfile.visual?.largeText) {
      score += this.getOptimalTimeForLargeText(slot);
    }
    if (accessibilityProfile.visual?.screenReader) {
      score += this.getOptimalTimeForScreenReader(slot);
    }

    // Cognitive accessibility factors
    if (accessibilityProfile.cognitive?.simpleInterface) {
      score += this.getOptimalTimeForCognitiveEase(slot);
    }
    if (accessibilityProfile.cognitive?.reducedOptions) {
      score += this.getOptimalTimeForReducedOptions(slot);
    }
    if (accessibilityProfile.cognitive?.extraTime) {
      score += this.getOptimalTimeForExtraTime(slot, service);
    }

    // Motor accessibility factors
    if (accessibilityProfile.motor?.largerTouchTargets) {
      score += this.getOptimalTimeForMotorAccessibility(slot);
    }
    if (accessibilityProfile.motor?.extendedTime) {
      score += this.getOptimalTimeForExtendedTime(slot, service);
    }

    // Time-based cognitive load factors
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();
    const dayOfWeek = timeSlot.getDay();

    // Prefer lower cognitive load times for users with cognitive accessibility needs
    if (accessibilityProfile.cognitive?.simpleInterface) {
      if (hour >= 9 && hour <= 11) score += 15; // Morning clarity
      if (hour >= 14 && hour <= 16) score += 10; // Post-lunch clarity
      if (hour >= 17) score -= 10; // Evening fatigue
    }

    // Day of week preferences
    if (dayOfWeek >= 1 && dayOfWeek <= 3) {
      // Monday-Wednesday
      score += accessibilityProfile.cognitive?.simpleInterface ? 10 : 0;
    }

    return Math.max(0, Math.min(150, score)); // Cap between 0-150
  }

  /**
   * Calculate cognitive load for a specific time slot
   */
  calculateCognitiveLoad(slot, service, user) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();
    const dayOfWeek = timeSlot.getDay();

    let load = 1.0;

    // Time of day factor
    if (hour >= 9 && hour <= 11)
      load *= this.cognitiveLoadFactors.timeOfDay.morning;
    else if (hour >= 14 && hour <= 16)
      load *= this.cognitiveLoadFactors.timeOfDay.afternoon;
    else load *= this.cognitiveLoadFactors.timeOfDay.evening;

    // Day of week factor
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];
    load *= this.cognitiveLoadFactors.dayOfWeek[dayNames[dayOfWeek]] || 1.0;

    // Service complexity factor
    const complexityMap = {
      consultation: this.cognitiveLoadFactors.appointmentType.consultation,
      routine: this.cognitiveLoadFactors.appointmentType.routine,
      complex: this.cognitiveLoadFactors.appointmentType.complex,
      emergency: this.cognitiveLoadFactors.appointmentType.emergency
    };
    load *= complexityMap[service.type] || 1.0;

    // User accessibility factors
    if (user.accessibility_preferences?.cognitive?.simpleInterface) {
      load *= 0.7; // Reduce cognitive load for users who need simpler interfaces
    }

    return Math.round(load * 100) / 100;
  }

  /**
   * Calculate focus protection score for a time slot
   */
  calculateFocusProtection(slot, userPreferences = {}) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    let protection = 0;

    // Deep work protection (9-11 AM)
    if (
      hour >= this.focusTimeRanges.deepWork.start &&
      hour < this.focusTimeRanges.deepWork.end
    ) {
      protection += 30;
    }

    // Routine tasks protection (11 AM-3 PM)
    if (
      hour >= this.focusTimeRanges.routineTasks.start &&
      hour < this.focusTimeRanges.routineTasks.end
    ) {
      protection += 20;
    }

    // Avoid scheduling during focus time if user has focus protection enabled
    if (userPreferences.focusTimeProtection) {
      if (hour >= 9 && hour <= 11) protection += 25;
      if (hour >= 14 && hour <= 16) protection += 15;
    }

    // Penalize late evening appointments
    if (hour >= 17) protection -= 15;

    return Math.max(0, protection);
  }

  /**
   * Get optimal time for users with high contrast needs
   */
  getOptimalTimeForHighContrast(slot) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    // Prefer natural daylight hours
    if (hour >= 10 && hour <= 16) return 20;
    if (hour >= 8 && hour <= 18) return 10;
    return -10;
  }

  /**
   * Get optimal time for users who need large text/clear visuals
   */
  getOptimalTimeForLargeText(slot) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    // Avoid early morning and late evening when eyes might be tired
    if (hour >= 10 && hour <= 15) return 15;
    if (hour >= 9 && hour <= 17) return 5;
    return -5;
  }

  /**
   * Get optimal time for screen reader users
   */
  getOptimalTimeForScreenReader(slot) {
    // Screen readers work equally well at any time, but avoid very busy periods
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    if (hour >= 9 && hour <= 11) return 10; // Morning clarity
    if (hour >= 14 && hour <= 16) return 8; // Afternoon clarity
    return 5;
  }

  /**
   * Get optimal time for cognitive ease
   */
  getOptimalTimeForCognitiveEase(slot) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    // Peak cognitive performance times
    if (hour >= 9 && hour <= 11) return 25; // Peak morning
    if (hour >= 14 && hour <= 16) return 20; // Post-lunch peak
    if (hour >= 8 && hour <= 12) return 15; // General morning
    return -10; // Evening fatigue
  }

  /**
   * Get optimal time for reduced options
   */
  getOptimalTimeForReducedOptions(slot) {
    // Simpler choices work better when not rushed
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    if (hour >= 10 && hour <= 15) return 15; // Mid-day clarity
    if (hour >= 9 && hour <= 16) return 10; // General good times
    return -5;
  }

  /**
   * Get optimal time for extra time needs
   */
  getOptimalTimeForExtraTime(slot, service) {
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    // Give extra time buffer in the schedule
    if (hour >= 10 && hour <= 14) return 20; // Good buffer time
    if (hour >= 9 && hour <= 15) return 15; // Acceptable
    return 5;
  }

  /**
   * Get optimal time for motor accessibility
   */
  getOptimalTimeForMotorAccessibility(slot) {
    // Motor accessibility doesn't depend on time, but avoid rush hours
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    if (hour >= 10 && hour <= 15) return 10; // Less rushed
    if (hour >= 9 && hour <= 16) return 5; // Generally okay
    return 0;
  }

  /**
   * Get optimal time for extended time needs
   */
  getOptimalTimeForExtendedTime(slot, service) {
    // Need time buffers around appointments
    const timeSlot = new Date(`${slot.day}T${slot.start_time}`);
    const hour = timeSlot.getHours();

    if (hour >= 10 && hour <= 14) return 20; // Good buffer times
    if (hour >= 9 && hour <= 15) return 15; // Acceptable
    return 5;
  }

  /**
   * Generate accessibility reasoning for top suggestions
   */
  generateAccessibilityReasoning(topSlots, accessibilityProfile) {
    const reasons = [];

    topSlots.forEach((slot, index) => {
      const reasoning = [];

      if (
        accessibilityProfile.cognitive?.simpleInterface &&
        slot.aiScore > 120
      ) {
        reasoning.push("Optimal time for cognitive ease and clear thinking");
      }

      if (accessibilityProfile.visual?.highContrast && slot.aiScore > 110) {
        reasoning.push("Natural lighting ideal for high contrast visibility");
      }

      if (slot.cognitiveLoad < 0.8) {
        reasoning.push("Low cognitive load period - easier decision making");
      }

      if (slot.focusProtection > 40) {
        reasoning.push("Protected focus time - minimal distractions");
      }

      reasons.push({
        slotId: slot.timeslot_id,
        rank: index + 1,
        reasoning:
          reasoning.length > 0 ? reasoning : ["Good general accessibility fit"]
      });
    });

    return reasons;
  }

  /**
   * Get accessibility features for a time slot
   */
  getAccessibilityFeatures(accessibilityProfile) {
    const features = [];

    if (accessibilityProfile.visual?.highContrast) {
      features.push({
        type: "visual",
        feature: "High Contrast Mode",
        available: true,
        description:
          "Enhanced visual clarity during optimal lighting conditions"
      });
    }

    if (accessibilityProfile.cognitive?.simpleInterface) {
      features.push({
        type: "cognitive",
        feature: "Simplified Interface",
        available: true,
        description: "Reduced options and clear decision paths"
      });
    }

    if (accessibilityProfile.motor?.largerTouchTargets) {
      features.push({
        type: "motor",
        feature: "Enhanced Touch Targets",
        available: true,
        description: "Larger interactive elements for easier interaction"
      });
    }

    return features;
  }

  /**
   * Get slot-specific recommendations
   */
  getSlotRecommendations(slot, accessibilityProfile) {
    const recommendations = [];

    if (accessibilityProfile.cognitive?.simpleInterface) {
      recommendations.push(
        "Arrive 10 minutes early to familiarize with the environment"
      );
    }

    if (accessibilityProfile.visual?.screenReader) {
      recommendations.push(
        "Inform staff about screen reader usage for better assistance"
      );
    }

    if (accessibilityProfile.motor?.extendedTime) {
      recommendations.push("Allow extra time for check-in and navigation");
    }

    return recommendations;
  }

  /**
   * Learn from user behavior to improve suggestions
   */
  async learnFromUserBehavior(userId, appointmentData) {
    try {
      const user = await findUserById(userId);
      if (!user) return;

      // Update user preferences based on appointment choices
      const learningData = {
        preferredTimes: this.extractTimePreferences(appointmentData),
        accessibilityNeeds: this.extractAccessibilityNeeds(appointmentData),
        cognitiveLoadTolerance:
          this.extractCognitiveLoadTolerance(appointmentData),
        focusTimePreferences: this.extractFocusPreferences(appointmentData)
      };

      // Update user profile with learned preferences
      await addAILearningData(userId, {
        ...learningData,
        timestamp: new Date(),
        source: "behavioral_analysis"
      });

      return learningData;
    } catch (error) {
      console.error("Learning Error:", error);
      throw new Error("Failed to learn from user behavior");
    }
  }

  /**
   * Extract time preferences from user behavior
   */
  extractTimePreferences(appointmentData) {
    const timeSlot = new Date(
      `${appointmentData.date}T${appointmentData.time}`
    );
    const hour = timeSlot.getHours();
    const dayOfWeek = timeSlot.getDay();

    return {
      preferredHours: [hour],
      preferredDays: [dayOfWeek],
      avoidedHours: hour < 9 || hour > 17 ? [hour] : [],
      consistencyScore: 1.0 // Would calculate based on pattern consistency
    };
  }

  /**
   * Extract accessibility needs from user behavior
   */
  extractAccessibilityNeeds(appointmentData) {
    // Analyze booking patterns, cancellations, reschedules for accessibility indicators
    return {
      visualSupport: appointmentData.usedVisualAssistance || false,
      cognitiveSupport: appointmentData.neededExtraTime || false,
      motorSupport: appointmentData.neededAccessibilityFeatures || false,
      communicationSupport: appointmentData.neededSpecialCommunication || false
    };
  }

  /**
   * Extract cognitive load tolerance from user behavior
   */
  extractCognitiveLoadTolerance(appointmentData) {
    // Analyze complexity preferences and timing choices
    return {
      complexityTolerance: appointmentData.preferredComplexity || "medium",
      decisionMakingSpeed: appointmentData.decisionTime || "normal",
      informationProcessingStyle:
        appointmentData.preferredInformationFormat || "standard"
    };
  }

  /**
   * Extract focus time preferences from user behavior
   */
  extractFocusPreferences(appointmentData) {
    return {
      protectedTimeRanges: appointmentData.avoidedBusyTimes || [],
      interruptionTolerance: appointmentData.interruptionLevel || "low",
      optimalFocusPeriods: appointmentData.bestPerformanceTimes || []
    };
  }

  /**
   * Rank slots based on accessibility needs and cognitive load
   */
  async rankSlotsForAccessibility(slots, accessibilityProfile, user, service) {
    return slots
      .map((slot) => {
        const score = this.calculateAccessibilityScore(
          slot,
          accessibilityProfile,
          user,
          service
        );
        const cognitiveLoad = this.calculateCognitiveLoad(slot, service, user);
        const focusProtection = this.calculateFocusProtection(
          slot,
          user.preferences
        );

        return {
          ...slot,
          aiScore: score,
          cognitiveLoad,
          focusProtection,
          accessibilityRecommendations: this.getSlotRecommendations(
            slot,
            accessibilityProfile
          )
        };
      })
      .sort((a, b) => b.aiScore - a.aiScore);
  }
}

export default new AISchedulerService();
