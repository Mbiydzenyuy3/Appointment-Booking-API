// Mock auth controller for development testing
export async function getUserProfile(req, res, next) {
  try {
    // Mock user data for testing
    const mockUserData = {
      user_id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Test User",
      email: "test@example.com",
      user_type: "client",
      phone: "+1234567890",
      address: "123 Test Street, Test City",
      bio: "This is a test user profile",
      profile_picture: "",
      provider_info: null,
      created_at: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: mockUserData
    });
  } catch (err) {
    console.error("Mock profile error:", err);
    res.status(500).json({
      success: false,
      message: "Mock server error"
    });
  }
}

export async function updateUserProfile(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      message: "Profile updated successfully (mock)"
    });
  } catch (err) {
    console.error("Mock update error:", err);
    res.status(500).json({
      success: false,
      message: "Mock server error"
    });
  }
}
