import api from "../services/api.js";

// Test function to verify authentication
export const testAuth = async () => {
  console.log("🧪 Testing authentication...");

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ No token found in localStorage");
    return { success: false, error: "No token found" };
  }

  try {
    // Test a simple authenticated endpoint (adjust the endpoint as needed)
    const response = await api.get("/auth/me");
    console.log("✅ Authentication test successful");
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "❌ Authentication test failed:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      return { success: false, error: "Token invalid or expired" };
    }

    return { success: false, error: error.response?.data || error.message };
  }
};

// Test service creation endpoint specifically
export const testServiceCreation = async (
  testData = {
    name: "Test Service",
    description: "Test Description",
    price: 100,
    currency: "USD",
    durationMinutes: 60
  }
) => {
  console.log("🧪 Testing service creation...");

  try {
    const response = await api.post("/services/create", testData);
    console.log("✅ Service creation test successful");
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "❌ Service creation test failed:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};
