# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Appointment Booking application.

## Prerequisites

- Google Cloud Console account
- A project created in Google Cloud Console
- Node.js application with the existing authentication system

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or Google Identity API for newer projects)

## Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: "Appointment Booking App"
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (for development) or publish for production

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `http://localhost:5173` (Vite dev server)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback/google`
   - `http://localhost:5173/auth/callback/google`
   - `https://yourdomain.com/auth/callback/google`
6. Copy the **Client ID** and **Client Secret**

## Step 4: Environment Variables

Add the following environment variables to your backend `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/callback/google
```

For frontend `.env` file:

```env
# Frontend Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 5: Backend Implementation

### Install Required Dependencies

```bash
npm install google-auth-library
```

### Backend Route Implementation

Update your auth controller with Google OAuth handlers:

```javascript
// In backend/src/controllers/auth-controller.js
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Google OAuth callback handler
export async function googleAuthCallback(req, res, next) {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: "Google token is required."
      });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await AuthService.getUserByEmail(email);

    if (!user) {
      // Create new user with Google OAuth data
      const userData = {
        name,
        email,
        password: null, // No password for OAuth users
        user_type: "client", // Default to client, can be changed later
        google_id: googleId,
        profile_picture: picture,
        email_verified: true
      };

      user = await AuthService.createGoogleUser(userData);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.user_id,
        email: user.email,
        user_type: user.user_type,
        provider_id: user.provider_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      message: "Google authentication successful",
      data: {
        user_id: user.user_id,
        email: user.email,
        user_type: user.user_type,
        name: user.name,
        profile_picture: user.profile_picture
      }
    });
  } catch (err) {
    logError("Error in Google OAuth", err);
    next(err);
  }
}
```

### Update Auth Service

Add Google user creation method to your auth service:

```javascript
// In backend/src/services/auth-service.js
export async function createGoogleUser(userData) {
  const client = await query("BEGIN");

  try {
    // Insert user
    const userResult = await query(
      `INSERT INTO users (name, email, password, user_type, google_id, profile_picture, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, email, user_type`,
      [
        userData.name,
        userData.email,
        userData.password, // null for OAuth users
        userData.user_type,
        userData.google_id,
        userData.profile_picture,
        userData.email_verified || false
      ]
    );

    const user = userResult.rows[0];
    await query("COMMIT");

    return user;
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
}
```

### Database Schema Updates

Add Google OAuth fields to users table:

```sql
-- Add to your users table migration
ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) UNIQUE,
ADD COLUMN profile_picture TEXT,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
```

## Step 6: Frontend Implementation

### Install Google Sign-In SDK

Add to your HTML file:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Frontend Google OAuth Hook

Create a custom hook for Google authentication:

```javascript
// frontend/src/hooks/useGoogleAuth.js
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export function useGoogleAuth() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);

    try {
      // Initialize Google Sign-In
      const google = window.google;

      if (!google) {
        throw new Error("Google SDK not loaded");
      }

      // Configure Google Sign-In
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });

      // Render the sign-in button
      google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: "100%"
        }
      );
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      // Send token to backend
      const backendResponse = await api.post("/auth/google-auth", {
        tokenId: response.credential
      });

      if (backendResponse.data.success) {
        // Store token and update auth context
        localStorage.setItem("token", backendResponse.data.token);

        // Trigger login in auth context
        await login(
          backendResponse.data.data.email,
          null,
          true,
          backendResponse.data.data
        );
      }
    } catch (error) {
      console.error("Google authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading
  };
}
```

### Update Login Page

Add Google Sign-In button to your login page:

```javascript
// In frontend/src/pages/Login.jsx
import { useGoogleAuth } from "../hooks/useGoogleAuth.js";

export default function Login() {
  const { signInWithGoogle, isLoading } = useGoogleAuth();

  // Add to your JSX
  <button
    type='button'
    onClick={signInWithGoogle}
    disabled={isLoading}
    className='w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
  >
    <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
      <path
        fill='#4285F4'
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      />
      <path
        fill='#34A853'
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      />
      <path
        fill='#FBBC05'
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      />
      <path
        fill='#EA4335'
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      />
    </svg>
    {isLoading ? "Signing in..." : "Continue with Google"}
  </button>;
}
```

## Step 7: Testing

1. Start your development servers
2. Navigate to the login page
3. Click "Continue with Google"
4. Complete the Google sign-in flow
5. Verify that you're redirected and authenticated

## Security Considerations

1. **Token Validation**: Always validate Google tokens on the backend
2. **HTTPS**: Use HTTPS in production for OAuth flows
3. **State Parameter**: Implement state parameter to prevent CSRF attacks
4. **Token Expiration**: Handle token expiration gracefully
5. **Error Handling**: Implement proper error handling for OAuth failures

## Production Deployment

1. Update OAuth credentials with production URLs
2. Set up proper domain verification
3. Submit OAuth consent screen for verification (if required)
4. Monitor OAuth usage in Google Cloud Console

## Troubleshooting

### Common Issues

1. **Invalid Client ID**: Ensure your client ID is correct and matches the domain
2. **Redirect URI Mismatch**: Verify redirect URIs match exactly
3. **API Not Enabled**: Ensure Google+ API or Google Identity API is enabled
4. **CORS Issues**: Configure CORS properly for cross-origin requests

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify network requests in DevTools
3. Check Google Cloud Console for API usage
4. Review server logs for backend errors

## Additional Resources

- [Google Sign-In JavaScript API](https://developers.google.com/identity/sign-in/web)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

This setup will provide seamless Google authentication for your Appointment Booking application, allowing users to sign in with their Google accounts quickly and securely.
