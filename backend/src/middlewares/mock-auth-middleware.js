// Mock auth middleware for development testing
export default function mockAuthMiddleware(req, res, next) {
  // Mock user data - in a real app this would come from JWT verification
  req.user = {
    sub: "123e4567-e89b-12d3-a456-426614174000",
    user_id: "123e4567-e89b-12d3-a456-426614174000",
    user_type: "client",
    provider_id: null
  };

  console.log("Mock auth: bypassing authentication for testing");
  next();
}
