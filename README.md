# Tech Treasure Hunt Website

A comprehensive web application for managing a college tech event treasure hunt with 20 participating teams.

## Features

### 🏠 Homepage
- Complete rules and guidelines for the treasure hunt
- Detailed instructions on how the game works
- Login buttons for teams and admins

### 👥 Team Login System
- Secure team authentication with team name and password
- 20 pre-configured teams (Team1-Team20)
- Each team has a unique password

### 🔐 Admin Login System
- Admin-only access with password protection
- Monitor all teams and track progress
- Real-time statistics and team management

### 🎯 Team Dashboard
- Visual progress tracking with level cards
- Current level display
- Locked/completed/current level indicators
- Direct access to start current level

### 📊 Admin Dashboard
- Real-time team statistics
- Complete team list with status tracking
- Partner team assignments
- Current round monitoring

### 🧠 Quiz System
- Tech-related multiple choice questions for each level
- Immediate feedback on answers
- Unlock riddles only after correct quiz completion

### 🎲 Riddle System
- Team pairing logic (2 teams per riddle in early rounds)
- Unique riddles for each team pair
- Case-insensitive answer checking
- Automatic level progression

## Game Flow

### Level 1 (20 Teams → 10 Winners)
1. **Quiz Question**: "What does 'HTTP' stand for?"
2. **Riddles**: 10 different riddles for 10 team pairs
3. **Elimination**: First team to solve advances, partner eliminated

### Level 2 (10 Teams → 5 Winners)
1. **Quiz Question**: "Which company developed the Windows Operating System?"
2. **Riddles**: 5 different riddles for 5 team pairs
3. **Elimination**: Same pairing system as Level 1

### Level 3 (5 Teams → 3 Winners)
1. **Quiz Question**: "What is the shortcut key for 'Copy' in most computers?"
2. **Riddles**: 3 different riddles (one per team)
3. **Elimination**: Top 3 teams advance

### Level 4 (3 Teams → 1 Winner)
1. **Quiz Question**: "Which of the following is an input device?"
2. **Riddles**: 3 different final riddles
3. **Winner**: First team to solve becomes champion

## Technical Details

### Passwords
- **Level 1**: LEVEL@781
- **Level 2**: LEVEL@172
- **Level 3**: LEVEL@093
- **Level 4**: LEVEL@484
- **Admin**: admin123

### Team Credentials
All teams follow the pattern: `TeamX` with password `teamXpass` (e.g., Team1/team1pass)

### File Structure
```
├── index.html              # Homepage
├── team-login.html         # Team login page
├── admin-login.html        # Admin login page
├── dashboard.html          # Team dashboard
├── admin-dashboard.html    # Admin dashboard
├── styles.css             # All styling
└── script.js              # All functionality
```

## Usage Instructions

### For Teams
1. Go to the homepage and read rules/instructions
2. Click "Team Login" and enter credentials
3. View dashboard to see current level
4. Click "Start Level" to begin
5. Enter level password when prompted
6. Complete quiz question
7. Solve the riddle to advance

### For Admins
1. Go to the homepage
2. Click "Admin Login" and enter password
3. Monitor all teams in real-time
4. Track progress and eliminations
5. View team statistics and pairings

## Customization

### Adding New Riddles
Edit the `riddles` object in `script.js`:
```javascript
riddles: {
    1: {
        1: { text: "Your riddle here", answer: "ANSWER" },
        // Add more riddles...
    }
}
```

### Modifying Quiz Questions
Edit the `quizQuestions` object in `script.js`:
```javascript
quizQuestions: {
    1: {
        question: "Your question?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0  // Index of correct answer
    }
}
```

### Changing Passwords
Update the `gameState` object in `script.js` for level passwords or modify team credentials in `teamData`.

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile devices
- Local storage for session management

## Security Notes
- All passwords are stored in plain text (suitable for local/controlled environment)
- Session data stored in browser localStorage
- No server-side validation (client-side only)

## Future Enhancements
- Server-side implementation for better security
- Real-time updates via WebSocket
- Timer functionality for each round
- Photo/video clue support
- Advanced analytics and reporting
