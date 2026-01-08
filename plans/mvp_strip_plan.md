# Plan to Strip Down to MVP Features

## Overview
This plan outlines the removal of non-MVP features from the appointment-booking-app to focus on core functionality: basic email/password authentication, provider service creation, time slot management, and client appointment booking.

## Non-MVP Features to Remove
- Reviews (provider reviews, ratings, testimonials)
- Analytics (performance monitoring, credibility metrics, Mixpanel tracking)
- AI Scheduling (AI scheduler, learning data, preferences)
- Referral System (not implemented)
- Google OAuth
- Password Reset
- WebSocket (real-time features)
- Caching (Redis-based)
- Image Handling (profile pictures, business photos)
- Tutorials
- Accessibility Features
- PWA (Progressive Web App)
- Multi-Currency
- Progressive Loading
- Testing Suite
- Complex Onboarding (simplify to basic registration)

## Backend Changes

### Dependencies (package.json)
Remove:
- google-auth-library
- ioredis
- redis
- sharp
- socket.io
- socket.io-client
- supertest
- node-cron (if used for analytics)

Keep: @sendgrid/mail, nodemailer for basic notifications (if needed), but remove password reset logic.

### Database Schema
Create a new migration to:
- Drop tables: provider_reviews, guest_sessions
- Drop columns from users: google_id, profile_picture, email_verified, phone, address, bio, age, accessibility_preferences, ai_learning_data, focus_time_preferences, cognitive_load_profile, accessibility_history, reset_token, reset_token_expiry
- Drop columns from providers: rating, hourly_rate, service_types, profile_views, last_profile_view, certifications, business_photos, testimonials, years_of_experience

Update schema.sql accordingly.

### Files to Delete
- Controllers: ai-scheduler-controller.js
- Services: ai-scheduler-service.js, cache-service.js, image-service.js, performance-monitor.js
- Routes: ai-scheduler.js, performance.js
- Middlewares: cache-middleware.js
- Utils: websocket.js
- Sockets: socket-handler.js, socket.js
- Tests: entire test/ directory
- Migrations: 004,005,006,007,008 (or incorporate drops into new migration)

### Files to Update
- auth-controller.js: Remove Google OAuth, password reset, email verification logic. Simplify to basic email/password login/register.
- provider-controller.js: Remove credibility features, image handling.
- user-model.js: Remove non-MVP fields.
- provider-model.js: Remove non-MVP fields.
- appointment-model.js: Ensure only basic fields.
- service-model.js: Basic fields.
- slot-model.js: Basic fields.
- auth-service.js: Simplify.
- provider-service.js: Remove analytics/credibility.
- email-service.js: Remove password reset emails.
- validators: Remove non-MVP validations.

## Frontend Changes

### Dependencies (package.json)
Remove:
- mixpanel-browser
- socket.io-client
- vite-plugin-pwa
- workbox-window
- pwa
- @axe-core/playwright
- @axe-core/react
- @playwright/test
- lighthouse
- puppeteer
- vitest
- vitest-axe
- @vitest/coverage-v8

Remove test scripts.

### Files to Delete
- Components/Accessibility/
- Components/Auth/GoogleButton.jsx, GoogleAuthDebug.jsx, GoogleAuthDebugger.jsx
- Components/Common/CurrencySelector.jsx
- Components/Common/ProgressiveImage.jsx
- Components/LazyLoading/
- Components/PerformanceDashboard/
- Components/Scheduling/SmartScheduler.jsx, SmartSchedulingDashboard.jsx
- Components/Tutorials/
- public/manifest.json
- public/pwa-*.png
- public/sw.js
- public/dev-dist/sw.js, registerSW.js
- public/accessibility-test.html
- public/offline.html
- dev-dist/ (PWA related)
- playwright-report/
- MULTI_CURRENCY_GUIDE.md
- GOOGLE_OAUTH_IMPLEMENTATION_GUIDE.md
- PERFORMANCE_OPTIMIZATION_GUIDE.md
- .github/ (if CI/CD for tests)
- eslint.config.js (if accessibility related)
- playright.config.js

### Files to Update
- App.jsx: Remove routes for removed features.
- pages/Register.jsx: Simplify to basic email/password.
- pages/LandingPage.jsx: Remove references to advanced features.
- components/landing/: Update to basic features.
- context/AccessibilityContext.jsx: Delete.
- .env: Remove non-MVP env vars (e.g., Google client ID, Mixpanel token).
- vite.config.js: Remove PWA plugin.
- tailwind.config.js: If accessibility customizations, simplify.

## Implementation Steps
1. Backup current codebase.
2. Update package.json files and run npm install.
3. Create and run database migration to drop non-MVP schema elements.
4. Delete identified files.
5. Update remaining files to remove references and logic.
6. Test basic flows: register, login, create service/slots, book appointment.
7. Update documentation if any.

## Risks
- Ensure no dependencies on removed features in remaining code.
- Test thoroughly as removals may break integrations.
- Database migration is irreversible; backup data.

## Post-MVP Considerations
- Re-add features incrementally if needed.
- Keep removed code in git history for reference.