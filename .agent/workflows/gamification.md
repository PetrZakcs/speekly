---
description: Implement gamification system
---
1. Define leveling logic:
   - 10 XP per practice minute
   - Level = sqrt(XP) * 0.5 (approx)
   - Store XP in Supabase/AsyncStorage
2. Create `Badge` component in `App.js`:
   - "First Steps" (1 session)
   - "Speech Warrior" (7 day streak)
   - "Master Orator" (1000 mins)
3. Update `HomeScreen` to display Level and XP progress bar.
4. Add visual feedback (confetti/sound) on Level Up.
