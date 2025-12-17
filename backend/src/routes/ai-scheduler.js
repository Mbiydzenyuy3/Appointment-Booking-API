// AI-Powered Accessibility-First Scheduling Routes
import express from "express";
const router = express.Router();
import aiSchedulerController from "../controllers/ai-scheduler-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

/**
 * @route   POST /api/ai-scheduler/suggestions
 * @desc    Get AI-powered accessibility-optimized appointment suggestions
 * @access  Private
 */
router.post("/suggestions", authMiddleware, async (req, res) => {
  await aiSchedulerController.getAccessibilityOptimizedSlots(req, res);
});

/**
 * @route   GET /api/ai-scheduler/profile/:userId
 * @desc    Get user's accessibility profile
 * @access  Private
 */
router.get("/profile/:userId", authMiddleware, async (req, res) => {
  await aiSchedulerController.getAccessibilityProfile(req, res);
});

/**
 * @route   PUT /api/ai-scheduler/preferences/:userId
 * @desc    Update user's accessibility preferences
 * @access  Private
 */
router.put("/preferences/:userId", authMiddleware, async (req, res) => {
  await aiSchedulerController.updateAccessibilityPreferences(req, res);
});

/**
 * @route   POST /api/ai-scheduler/learn/:userId
 * @desc    Learn from user appointment behavior
 * @access  Private
 */
router.post("/learn/:userId", authMiddleware, async (req, res) => {
  await aiSchedulerController.learnFromAppointmentBehavior(req, res);
});

/**
 * @route   POST /api/ai-scheduler/cognitive-optimization/:userId
 * @desc    Get cognitive load optimization suggestions
 * @access  Private
 */
router.post(
  "/cognitive-optimization/:userId",
  authMiddleware,
  async (req, res) => {
    await aiSchedulerController.getCognitiveLoadOptimization(req, res);
  }
);

/**
 * @route   GET /api/ai-scheduler/focus-protection/:userId
 * @desc    Get focus time protection recommendations
 * @access  Private
 */
router.get("/focus-protection/:userId", authMiddleware, async (req, res) => {
  await aiSchedulerController.getFocusTimeProtection(req, res);
});

/**
 * @route   GET /api/ai-scheduler/age-appropriate/:userId
 * @desc    Get age-appropriate scheduling suggestions
 * @access  Private
 */
router.get("/age-appropriate/:userId", authMiddleware, async (req, res) => {
  await aiSchedulerController.getAgeAppropriateSuggestions(req, res);
});

/**
 * @route   POST /api/ai-scheduler/cognitive-monitoring/:userId
 * @desc    Real-time cognitive load monitoring and adaptation
 * @access  Private
 */
router.post(
  "/cognitive-monitoring/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { sessionData, action } = req.body;

      if (!sessionData) {
        return res.status(400).json({
          success: false,
          message: "Session data is required for cognitive monitoring"
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Assess real-time cognitive load
      const cognitiveLoad =
        await aiSchedulerController.assessRealTimeCognitiveLoad(
          user,
          sessionData
        );

      // Generate adaptive responses
      const adaptations = aiSchedulerController.generateInterfaceAdaptations(
        user,
        cognitiveLoad
      );
      const stressIndicators =
        aiSchedulerController.detectStressIndicators(sessionData);

      // Calculate immediate actions
      let immediateActions = [];
      if (cognitiveLoad.currentLoad > 0.8) {
        immediateActions.push({
          type: "mandatory_break",
          duration: 10,
          description: "High cognitive load detected - take a 10-minute break"
        });
      }

      const monitoringResponse = {
        cognitiveLoad,
        adaptations,
        stressIndicators,
        immediateActions,
        recommendations:
          cognitiveLoad.currentLoad > 0.7
            ? [
                "Consider simplifying the current interface",
                "Take a short break to reset cognitive state",
                "Focus on one task at a time"
              ]
            : [],
        nextAssessment: new Date(Date.now() + 30000).toISOString() // 30 seconds
      };

      res.json({
        success: true,
        data: monitoringResponse
      });
    } catch (error) {
      console.error("Cognitive Monitoring Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to perform cognitive load monitoring"
      });
    }
  }
);

export default router;
