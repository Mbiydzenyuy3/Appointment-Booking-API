import mixpanel from "mixpanel-browser";

// Initialize Mixpanel with your project token
const MIXPANEL_TOKEN =
  import.meta.env.VITE_MIXPANEL_TOKEN || "your-mixpanel-token-here";

let isInitialized = false;

export const initAnalytics = () => {
  if (isInitialized) return;

  try {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      autocapture: true,
      record_sessions_percent: 100,
      track_pageview: true,
      persistence: "localStorage",
      distinct_id:
        localStorage.getItem("mixpanel_device_id") || generateDeviceId()
    });

    const deviceId = mixpanel.get_distinct_id();
    localStorage.setItem("mixpanel_device_id", deviceId);

    isInitialized = true;
    console.log("Analytics initialized with device ID:", deviceId);
  } catch (error) {
    console.error("Failed to initialize analytics:", error);
  }
};

const generateDeviceId = () => {
  return (
    "device_" +
    Math.random().toString(36).substr(2, 9) +
    Date.now().toString(36)
  );
};

export const trackEvent = (eventName, properties = {}) => {
  if (!isInitialized) {
    console.warn("Analytics not initialized");
    return;
  }

  try {
    mixpanel.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};

export const identifyUser = (userId, userProperties = {}) => {
  if (!isInitialized) {
    console.warn("Analytics not initialized");
    return;
  }

  try {
    mixpanel.identify(userId);
    mixpanel.people.set({
      $user_id: userId,
      ...userProperties,
      identified_at: new Date().toISOString()
    });

    console.log("User identified:", userId);
  } catch (error) {
    console.error("Failed to identify user:", error);
  }
};

export const trackPageView = (pageName, properties = {}) => {
  trackEvent("Page View", {
    page: pageName,
    ...properties
  });
};

export const trackExploreView = (properties = {}) => {
  trackEvent("Explore Services Viewed", properties);
};

export const trackServiceViewed = (serviceId, serviceName, properties = {}) => {
  trackEvent("Service Viewed", {
    service_id: serviceId,
    service_name: serviceName,
    ...properties
  });
};

export const trackBookingStarted = (
  serviceId,
  serviceName,
  isGuest = false
) => {
  trackEvent("Booking Started", {
    service_id: serviceId,
    service_name: serviceName,
    booking_type: isGuest ? "guest" : "authenticated",
    step: 1
  });
};

export const trackBookingCompleted = (
  appointmentId,
  serviceId,
  serviceName,
  isGuest = false,
  properties = {}
) => {
  trackEvent("Booking Completed", {
    appointment_id: appointmentId,
    service_id: serviceId,
    service_name: serviceName,
    booking_type: isGuest ? "guest" : "authenticated",
    ...properties
  });
};

export const trackBookingFailed = (
  serviceId,
  serviceName,
  error,
  isGuest = false
) => {
  trackEvent("Booking Failed", {
    service_id: serviceId,
    service_name: serviceName,
    booking_type: isGuest ? "guest" : "authenticated",
    error_message: error
  });
};

export const trackRegistrationStarted = (source = "unknown") => {
  trackEvent("Registration Started", {
    source: source
  });
};

export const trackRegistrationCompleted = (userId, userType) => {
  identifyUser(userId, {
    user_type: userType,
    registration_completed: true
  });

  trackEvent("Registration Completed", {
    user_type: userType
  });
};

export const trackLogin = (userId, userType) => {
  identifyUser(userId, {
    user_type: userType,
    last_login: new Date().toISOString()
  });

  trackEvent("User Logged In", {
    user_type: userType
  });
};

export { mixpanel };
