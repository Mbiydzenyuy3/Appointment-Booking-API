// Analytics service for tracking user behavior and events
// This is a mock implementation - in production, you'd integrate with services like Google Analytics, Mixpanel, etc.

class AnalyticsService {
  constructor() {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.isEnabled = import.meta.env.PROD; // Only enable in production
  }

  // Initialize analytics
  init() {
    // Any initialization logic here
    if (this.isEnabled) {
      console.log("Analytics initialized");
    }
  }

  // Generate a unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Identify user for tracking
  identifyUser(userId, traits = {}) {
    this.userId = userId;
    if (this.isEnabled) {
      console.log("Analytics: User identified", { userId, traits });
      // In production, send to analytics service
    }
  }

  // Track page views
  trackPageView(pageName, properties = {}) {
    this.trackEvent("page_view", {
      page: pageName,
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Track user login
  trackLogin(method = "email") {
    this.trackEvent("user_login", {
      method,
      timestamp: new Date().toISOString()
    });
  }

  // Track user registration
  trackRegistrationCompleted(userType, method = "email") {
    this.trackEvent("user_registration_completed", {
      user_type: userType,
      method,
      timestamp: new Date().toISOString()
    });
  }

  // Track appointment booking
  trackAppointmentBooked(appointmentData) {
    this.trackEvent("appointment_booked", {
      appointment_id: appointmentData.id,
      service_id: appointmentData.serviceId,
      provider_id: appointmentData.providerId,
      price: appointmentData.price,
      currency: appointmentData.currency,
      timestamp: new Date().toISOString()
    });
  }

  // Track booking completed
  trackBookingCompleted(
    appointmentId,
    serviceId,
    serviceName,
    isGuest = false
  ) {
    this.trackEvent("booking_completed", {
      appointment_id: appointmentId,
      service_id: serviceId,
      service_name: serviceName,
      booking_type: isGuest ? "guest" : "authenticated",
      timestamp: new Date().toISOString()
    });
  }

  // Track booking failure
  trackBookingFailed(reason, appointmentData = {}) {
    this.trackEvent("appointment_booking_failed", {
      reason,
      service_id: appointmentData.serviceId,
      provider_id: appointmentData.providerId,
      timestamp: new Date().toISOString()
    });
  }

  // Track appointment cancellation
  trackAppointmentCancelled(appointmentId, reason = "") {
    this.trackEvent("appointment_cancelled", {
      appointment_id: appointmentId,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  // Track appointment rescheduling
  trackAppointmentRescheduled(appointmentId, oldDate, newDate) {
    this.trackEvent("appointment_rescheduled", {
      appointment_id: appointmentId,
      old_date: oldDate,
      new_date: newDate,
      timestamp: new Date().toISOString()
    });
  }

  // Track search events
  trackSearch(query, filters = {}, resultsCount = 0) {
    this.trackEvent("search_performed", {
      query,
      filters,
      results_count: resultsCount,
      timestamp: new Date().toISOString()
    });
  }

  // Track provider profile views
  trackProviderProfileView(providerId, source = "search") {
    this.trackEvent("provider_profile_view", {
      provider_id: providerId,
      source,
      timestamp: new Date().toISOString()
    });
  }

  // Track service selection
  trackServiceSelected(serviceId, providerId) {
    this.trackEvent("service_selected", {
      service_id: serviceId,
      provider_id: providerId,
      timestamp: new Date().toISOString()
    });
  }

  // Track explore page view
  trackExploreView(properties = {}) {
    this.trackEvent("explore_view", {
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  // Track service viewed
  trackServiceViewed(serviceId, serviceName) {
    this.trackEvent("service_viewed", {
      service_id: serviceId,
      service_name: serviceName,
      timestamp: new Date().toISOString()
    });
  }

  // Track booking started
  trackBookingStarted(serviceId, serviceName, isGuest = false) {
    this.trackEvent("booking_started", {
      service_id: serviceId,
      service_name: serviceName,
      booking_type: isGuest ? "guest" : "authenticated",
      timestamp: new Date().toISOString()
    });
  }

  // Track time slot selection
  trackTimeSlotSelected(slotId, date, time) {
    this.trackEvent("time_slot_selected", {
      slot_id: slotId,
      date,
      time,
      timestamp: new Date().toISOString()
    });
  }

  // Track form interactions
  trackFormInteraction(formName, fieldName, action = "focus") {
    this.trackEvent("form_interaction", {
      form_name: formName,
      field_name: fieldName,
      action,
      timestamp: new Date().toISOString()
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.trackEvent("error_occurred", {
      error_message: error.message,
      error_stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Track performance metrics
  trackPerformance(metricName, value, unit = "ms") {
    this.trackEvent("performance_metric", {
      metric_name: metricName,
      value,
      unit,
      timestamp: new Date().toISOString()
    });
  }

  // Generic event tracking
  trackEvent(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        user_id: this.userId,
        session_id: this.sessionId
      },
      timestamp: new Date().toISOString()
    };

    this.events.push(event);

    if (this.isEnabled) {
      console.log("Analytics Event:", event);
      // In production, send to analytics service
      this.sendToAnalyticsService(event);
    }
  }

  // Send event to analytics service (mock implementation)
  async sendToAnalyticsService(event) {
    try {
      // Mock implementation - in production, this would send to your analytics provider
      // Example: Google Analytics, Mixpanel, Amplitude, etc.

      // For now, just log to console in development
      if (import.meta.env.DEV) {
        console.log("📊 Analytics Event:", event);
      }

      // In production, you might do:
      // await fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error("Failed to send analytics event:", error);
    }
  }

  // Get events for debugging
  getEvents() {
    return this.events;
  }

  // Clear events
  clearEvents() {
    this.events = [];
  }

  // Enable/disable analytics
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Export individual functions for convenience
export const identifyUser = (userId, traits) =>
  analytics.identifyUser(userId, traits);
export const trackPageView = (pageName, properties) =>
  analytics.trackPageView(pageName, properties);
export const trackLogin = (method) => analytics.trackLogin(method);
export const trackRegistrationCompleted = (userType, method) =>
  analytics.trackRegistrationCompleted(userType, method);
export const trackAppointmentBooked = (appointmentData) =>
  analytics.trackAppointmentBooked(appointmentData);
export const trackBookingCompleted = (
  appointmentId,
  serviceId,
  serviceName,
  isGuest
) =>
  analytics.trackBookingCompleted(
    appointmentId,
    serviceId,
    serviceName,
    isGuest
  );
export const trackBookingFailed = (reason, appointmentData) =>
  analytics.trackBookingFailed(reason, appointmentData);
export const trackAppointmentCancelled = (appointmentId, reason) =>
  analytics.trackAppointmentCancelled(appointmentId, reason);
export const trackAppointmentRescheduled = (appointmentId, oldDate, newDate) =>
  analytics.trackAppointmentRescheduled(appointmentId, oldDate, newDate);
export const trackSearch = (query, filters, resultsCount) =>
  analytics.trackSearch(query, filters, resultsCount);
export const trackProviderProfileView = (providerId, source) =>
  analytics.trackProviderProfileView(providerId, source);
export const trackServiceSelected = (serviceId, providerId) =>
  analytics.trackServiceSelected(serviceId, providerId);
export const trackTimeSlotSelected = (slotId, date, time) =>
  analytics.trackTimeSlotSelected(slotId, date, time);
export const trackFormInteraction = (formName, fieldName, action) =>
  analytics.trackFormInteraction(formName, fieldName, action);
export const trackError = (error, context) =>
  analytics.trackError(error, context);
export const trackPerformance = (metricName, value, unit) =>
  analytics.trackPerformance(metricName, value, unit);
export const trackEvent = (eventName, properties) =>
  analytics.trackEvent(eventName, properties);
export const trackExploreView = (properties) =>
  analytics.trackExploreView(properties);
export const trackServiceViewed = (serviceId, serviceName) =>
  analytics.trackServiceViewed(serviceId, serviceName);
export const trackBookingStarted = (serviceId, serviceName, isGuest) =>
  analytics.trackBookingStarted(serviceId, serviceName, isGuest);
export const initAnalytics = () => analytics.init();

export default analytics;
