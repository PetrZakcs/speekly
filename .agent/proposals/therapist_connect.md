# Proposal: Speekly Pro Network (Logoped Connection)

## Overview
Connect users directly with certified speech therapists (logopeds) for personalized coaching, creating a hybrid model of AI practice + human expert guidance.

## User Journey
1. **User Profile Analysis**: User practices with AI for a week. The app generates a "Speech Report" (WPM, stutter frequency, mood).
2. **One-Click Share**: User sends this report to a connected therapist before the session.
3. **Booking**: User books a 30-min discovery call or full session via in-app calendar.
4. **Video Call**: Secure video session takes place (integrated via Zoom SDK or Agora).
5. **Prescription**: Therapist sets specific scenarios in Speekly for homework (e.g., "Practice 'Job Interview' 3x this week").

## Business Model
- **Commission**: Speekly takes 15-20% fee per booked session.
- **Subscription**: Therapists pay a monthly fee ($20/mo) to be listed and access patient analytics dashboard.

## Technical Implementation Roadmap

### Phase 1: Directory (Current MVP)
- Simple list of partnered therapists.
- "Contact" button opens default email client.
- **Status:** Implemented (Placeholder in Settings).

### Phase 2: Booking Integration (Next Step)
- Integrate **Calendly** or **Cal.com** API.
- Each therapist links their calendar.
- Users book slots directly within the app WebView.

### Phase 3: Telehealth Integration (Future)
- **Twilio Video** or **Agora** for in-app secure video calls.
- Real-time AI captions during the call for analysis.

## Action Plan for Growth
1. **Partner Pilot**: Find 3-5 Czech logopeds to test the platform manually.
2. **Verification System**: Upload system for diplomas/certification.
3. **Therapist Dashboard**: Web portal for doctors to view patient progress charts (WPM trends, adherence).
