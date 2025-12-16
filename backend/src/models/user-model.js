//models/user-model.js - Enhanced with AI Accessibility Features

import bcrypt from "bcryptjs"; // For password hashing
import { query } from "../config/db.js";

/**
 * Create a new user in the database with accessibility support
 */
export const UserModel = async ({
  name,
  email,
  password,
  user_type,
  age,
  accessibilityPreferences = {}
}) => {
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultAccessibilityPreferences = {
      visual: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        colorBlindFriendly: false
      },
      cognitive: {
        simpleInterface: false,
        reducedOptions: false,
        extraTime: false,
        clearInstructions: false
      },
      motor: {
        largerTouchTargets: false,
        voiceControl: false,
        switchControl: false,
        extendedTime: false
      },
      auditory: {
        hearingImpaired: false,
        visualAlerts: false,
        signLanguage: false,
        captions: false
      },
      ...accessibilityPreferences
    };

    const { rows } = await query(
      `INSERT INTO users (name, email, password, user_type, age, accessibility_preferences, ai_learning_data, focus_time_preferences, cognitive_load_profile, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING user_id, name, email, user_type, age, accessibility_preferences`,
      [
        name,
        email,
        hashedPassword,
        user_type,
        age || null,
        JSON.stringify(defaultAccessibilityPreferences),
        JSON.stringify([]), // Empty AI learning data array
        JSON.stringify({
          protectedRanges: [],
          interruptionSensitivity: "medium",
          optimalFocusPeriods: []
        }),
        JSON.stringify({
          baselineLoad: 1.0,
          optimalTimeWindows: [],
          stressFactors: [],
          supportNeeds: []
        })
      ]
    );
    return rows[0]; // Return only necessary fields (excluding password)
  } catch (error) {
    throw new Error(
      `Database Error: Failed to create user. Details: ${error.message}`
    );
  }
};

/**
 * Find a user by their email address
 */
export const findByEmail = async (email) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, password, user_type, age, accessibility_preferences, ai_learning_data, focus_time_preferences, cognitive_load_profile 
       FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  } catch (error) {
    throw new Error(
      `Database Error: Failed to fetch user by email. Details: ${error.message}`
    );
  }
};

/**
 * Find user by ID with full accessibility profile
 */
export const findById = async (userId) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, user_type, age, accessibility_preferences, ai_learning_data, focus_time_preferences, cognitive_load_profile, accessibility_history, created_at, updated_at
       FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    return rows[0] ?? null;
  } catch (error) {
    throw new Error(
      `Database Error: Failed to fetch user by ID. Details: ${error.message}`
    );
  }
};

/**
 * Update user's accessibility preferences
 */
export const updateAccessibilityPreferences = async (userId, preferences) => {
  try {
    const { rows } = await query(
      `UPDATE users 
       SET accessibility_preferences = $1, 
           accessibility_history = COALESCE(accessibility_history, '[]'::jsonb) || $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, accessibility_preferences, accessibility_history`,
      [
        JSON.stringify(preferences),
        JSON.stringify([
          {
            preferences: preferences,
            timestamp: new Date().toISOString(),
            source: "user_update"
          }
        ]),
        userId
      ]
    );
    return rows[0];
  } catch (error) {
    throw new Error(
      `Database Error: Failed to update accessibility preferences. Details: ${error.message}`
    );
  }
};

/**
 * Add AI learning data for user behavior analysis
 */
export const addAILearningData = async (userId, learningData) => {
  try {
    const { rows } = await query(
      `UPDATE users 
       SET ai_learning_data = COALESCE(ai_learning_data, '[]'::jsonb) || $1,
           cognitive_load_profile = COALESCE(cognitive_load_profile, '{}'::jsonb) || $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING ai_learning_data, cognitive_load_profile`,
      [
        JSON.stringify([
          {
            ...learningData,
            timestamp: new Date().toISOString(),
            source: "behavioral_analysis"
          }
        ]),
        JSON.stringify(learningData.cognitiveLoadProfile || {}),
        userId
      ]
    );
    return rows[0];
  } catch (error) {
    throw new Error(
      `Database Error: Failed to add AI learning data. Details: ${error.message}`
    );
  }
};

/**
 * Update focus time preferences
 */
export const updateFocusTimePreferences = async (userId, focusPreferences) => {
  try {
    const { rows } = await query(
      `UPDATE users 
       SET focus_time_preferences = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING focus_time_preferences`,
      [JSON.stringify(focusPreferences), userId]
    );
    return rows[0];
  } catch (error) {
    throw new Error(
      `Database Error: Failed to update focus time preferences. Details: ${error.message}`
    );
  }
};

/**
 * Update cognitive load profile
 */
export const updateCognitiveLoadProfile = async (userId, profile) => {
  try {
    const { rows } = await query(
      `UPDATE users 
       SET cognitive_load_profile = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING cognitive_load_profile`,
      [JSON.stringify(profile), userId]
    );
    return rows[0];
  } catch (error) {
    throw new Error(
      `Database Error: Failed to update cognitive load profile. Details: ${error.message}`
    );
  }
};

/**
 * Get user's complete accessibility profile
 */
export const getAccessibilityProfile = async (userId) => {
  try {
    const { rows } = await query(
      `SELECT 
         id, name, email, user_type, age,
         accessibility_preferences,
         ai_learning_data,
         focus_time_preferences,
         cognitive_load_profile,
         accessibility_history,
         created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];

    // Parse JSON fields if they're strings
    return {
      ...user,
      accessibility_preferences:
        typeof user.accessibility_preferences === "string"
          ? JSON.parse(user.accessibility_preferences)
          : user.accessibility_preferences,
      ai_learning_data:
        typeof user.ai_learning_data === "string"
          ? JSON.parse(user.ai_learning_data)
          : user.ai_learning_data,
      focus_time_preferences:
        typeof user.focus_time_preferences === "string"
          ? JSON.parse(user.focus_time_preferences)
          : user.focus_time_preferences,
      cognitive_load_profile:
        typeof user.cognitive_load_profile === "string"
          ? JSON.parse(user.cognitive_load_profile)
          : user.cognitive_load_profile,
      accessibility_history:
        typeof user.accessibility_history === "string"
          ? JSON.parse(user.accessibility_history)
          : user.accessibility_history
    };
  } catch (error) {
    throw new Error(
      `Database Error: Failed to get accessibility profile. Details: ${error.message}`
    );
  }
};

/**
 * Get users with specific accessibility needs for targeted scheduling
 */
export const findUsersByAccessibilityNeeds = async (needs) => {
  try {
    const queryConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Build dynamic query based on accessibility needs
    if (needs.visual) {
      queryConditions.push(
        `accessibility_preferences->'visual' ? '${Object.keys(
          needs.visual
        ).find((key) => needs.visual[key])}'`
      );
    }
    if (needs.cognitive) {
      queryConditions.push(
        `accessibility_preferences->'cognitive' ? '${Object.keys(
          needs.cognitive
        ).find((key) => needs.cognitive[key])}'`
      );
    }
    if (needs.motor) {
      queryConditions.push(
        `accessibility_preferences->'motor' ? '${Object.keys(needs.motor).find(
          (key) => needs.motor[key]
        )}'`
      );
    }
    if (needs.auditory) {
      queryConditions.push(
        `accessibility_preferences->'auditory' ? '${Object.keys(
          needs.auditory
        ).find((key) => needs.auditory[key])}'`
      );
    }

    let queryString = `
      SELECT id, name, email, user_type, accessibility_preferences, focus_time_preferences, cognitive_load_profile
      FROM users
    `;

    if (queryConditions.length > 0) {
      queryString += ` WHERE ${queryConditions.join(" OR ")}`;
    }

    const { rows } = await query(queryString, queryParams);
    return rows;
  } catch (error) {
    throw new Error(
      `Database Error: Failed to find users by accessibility needs. Details: ${error.message}`
    );
  }
};

/**
 * Compare provided password with the stored hashed password
 */
export const comparePassword = async (providedPassword, storedPassword) => {
  try {
    const isMatch = await bcrypt.compare(providedPassword, storedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error comparing passwords: ${error.message}`);
  }
};

/**
 * Get AI scheduling analytics for a user
 */
export const getAISchedulingAnalytics = async (userId) => {
  try {
    const { rows } = await query(
      `SELECT 
         ai_learning_data,
         cognitive_load_profile,
         focus_time_preferences,
         accessibility_history,
         (SELECT COUNT(*) FROM appointments WHERE user_id = $1) as total_appointments,
         (SELECT COUNT(*) FROM appointments WHERE user_id = $1 AND status = 'completed') as completed_appointments,
         (SELECT COUNT(*) FROM appointments WHERE user_id = $1 AND status = 'cancelled') as cancelled_appointments
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];

    return {
      aiLearningData:
        typeof user.ai_learning_data === "string"
          ? JSON.parse(user.ai_learning_data)
          : user.ai_learning_data,
      cognitiveLoadProfile:
        typeof user.cognitive_load_profile === "string"
          ? JSON.parse(user.cognitive_load_profile)
          : user.cognitive_load_profile,
      focusTimePreferences:
        typeof user.focus_time_preferences === "string"
          ? JSON.parse(user.focus_time_preferences)
          : user.focus_time_preferences,
      accessibilityHistory:
        typeof user.accessibility_history === "string"
          ? JSON.parse(user.accessibility_history)
          : user.accessibility_history,
      analytics: {
        totalAppointments: parseInt(user.total_appointments),
        completedAppointments: parseInt(user.completed_appointments),
        cancelledAppointments: parseInt(user.cancelled_appointments),
        completionRate:
          user.total_appointments > 0
            ? (
                (user.completed_appointments / user.total_appointments) *
                100
              ).toFixed(2)
            : 0
      }
    };
  } catch (error) {
    throw new Error(
      `Database Error: Failed to get AI scheduling analytics. Details: ${error.message}`
    );
  }
};

module.exports = {
  UserModel,
  findByEmail,
  findById,
  updateAccessibilityPreferences,
  addAILearningData,
  updateFocusTimePreferences,
  updateCognitiveLoadProfile,
  getAccessibilityProfile,
  findUsersByAccessibilityNeeds,
  comparePassword,
  getAISchedulingAnalytics
};
