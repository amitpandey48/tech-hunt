// Global variables
let currentUser = null;
let teams = [];
let currentLevel = 1;
let levelTimer = null;
let levelTimerEndsAt = null; // epoch ms
let gameState = {
    level1: { password: 'LEVEL@781', completed: false },
    level2: { password: 'LEVEL@172', completed: false },
    level3: { password: 'LEVEL@093', completed: false },
    level4: { password: 'LEVEL@484', completed: false }
};

// Team data structure
let teamData = {
    // Level 1 teams (20 teams)
    'Team1': { password: 'team1pass', level: 1, status: 'active', partner: 'Team2', submissions: {} },
    'Team2': { password: 'team2pass', level: 1, status: 'active', partner: 'Team1', submissions: {} },
    'Team3': { password: 'team3pass', level: 1, status: 'active', partner: 'Team4', submissions: {} },
    'Team4': { password: 'team4pass', level: 1, status: 'active', partner: 'Team3', submissions: {} },
    'Team5': { password: 'team5pass', level: 1, status: 'active', partner: 'Team6', submissions: {} },
    'Team6': { password: 'team6pass', level: 1, status: 'active', partner: 'Team5', submissions: {} },
    'Team7': { password: 'team7pass', level: 1, status: 'active', partner: 'Team8', submissions: {} },
    'Team8': { password: 'team8pass', level: 1, status: 'active', partner: 'Team7', submissions: {} },
    'Team9': { password: 'team9pass', level: 1, status: 'active', partner: 'Team10', submissions: {} },
    'Team10': { password: 'team10pass', level: 1, status: 'active', partner: 'Team9', submissions: {} },
    'Team11': { password: 'team11pass', level: 1, status: 'active', partner: 'Team12', submissions: {} },
    'Team12': { password: 'team12pass', level: 1, status: 'active', partner: 'Team11', submissions: {} },
    'Team13': { password: 'team13pass', level: 1, status: 'active', partner: 'Team14', submissions: {} },
    'Team14': { password: 'team14pass', level: 1, status: 'active', partner: 'Team13', submissions: {} },
    'Team15': { password: 'team15pass', level: 1, status: 'active', partner: 'Team16', submissions: {} },
    'Team16': { password: 'team16pass', level: 1, status: 'active', partner: 'Team15', submissions: {} },
    'Team17': { password: 'team17pass', level: 1, status: 'active', partner: 'Team18', submissions: {} },
    'Team18': { password: 'team18pass', level: 1, status: 'active', partner: 'Team17', submissions: {} },
    'Team19': { password: 'team19pass', level: 1, status: 'active', partner: 'Team20', submissions: {} },
    'Team20': { password: 'team20pass', level: 1, status: 'active', partner: 'Team19', submissions: {} }
};

// Pending elimination requests awaiting admin approval
// Removed eliminationRequests; admin can directly eliminate teams

// Persist and sync helpers for real-time-ish updates across tabs
function loadTeamDataFromStorage() {
    try {
        const stored = localStorage.getItem('teamData');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
                teamData = { ...teamData, ...parsed };
            }
        } else {
            // Seed initial data
            localStorage.setItem('teamData', JSON.stringify(teamData));
        }
    } catch (e) {
        console.warn('Failed to load teamData from storage', e);
    }
}

function persistTeamData() {
    try {
        localStorage.setItem('teamData', JSON.stringify(teamData));
    } catch (e) {
        console.warn('Failed to persist teamData', e);
    }
}

// Removed load/persist for elimination requests

// Listen for changes from other tabs and update views in real time
window.addEventListener('storage', (event) => {
    if (event.key === 'teamData' && event.newValue) {
        try {
            const incoming = JSON.parse(event.newValue);
            if (incoming && typeof incoming === 'object') {
                teamData = { ...teamData, ...incoming };
                const currentPage = window.location.pathname.split('/').pop();
                if (currentPage === 'admin-dashboard.html') {
                    displayAdminStats();
                    displayTeamsTable();
                } else if (currentPage === 'dashboard.html') {
                    // If current user's level changed elsewhere, refresh UI
                    const user = localStorage.getItem('currentUser');
                    if (user && teamData[user]) {
                        document.getElementById('currentLevel').textContent = teamData[user].level;
                        const levelsContainer = document.getElementById('levelsContainer');
                        if (levelsContainer) {
                            levelsContainer.innerHTML = '';
                            if (teamData[user].status === 'eliminated') {
                                const message = document.createElement('div');
                                message.className = 'eliminated-message';
                                message.innerHTML = `
                                    <div class="level-card current">
                                        <div class="level-title">Eliminated</div>
                                        <div class="level-status status-locked">Sorry! The answer is submitted and you are eliminated.</div>
                                    </div>
                                `;
                                levelsContainer.appendChild(message);
                            } else {
                                for (let i = 1; i <= 4; i++) {
                                    const levelCard = createLevelCard(i, teamData[user].level);
                                    levelsContainer.appendChild(levelCard);
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to parse incoming teamData', e);
        }
    }
    // No eliminationRequests syncing needed
});

// Admin password
const adminPassword = 'LEAD@121';

// Quiz questions
const quizQuestions = {
    1: {
        question: "What does \"HTTP\" stand for?",
        options: [
            "HyperText Transfer Protocol",
            "HighText Transfer Protocol", 
            "Hyper Transfer Text Program",
            "High Transfer Text Process"
        ],
        correct: 0
    },
    2: {
        question: "Which company developed the Windows Operating System?",
        options: [
            "Apple",
            "Microsoft",
            "Google", 
            "IBM"
        ],
        correct: 1
    },
    3: {
        question: "What is the shortcut key for \"Copy\" in most computers?",
        options: [
            "Ctrl + P",
            "Ctrl + V",
            "Ctrl + C",
            "Ctrl + X"
        ],
        correct: 2
    },
    4: {
        question: "Which of the following is an input device?",
        options: [
            "Monitor",
            "Printer",
            "Keyboard",
            "Speaker"
        ],
        correct: 2
    }
};

// Riddles for each level
const riddles = {
    1: {
        // Level 1 riddles (10 riddles for 10 pairs)
        1: { text: "Fresh walls rise with shining grace, Yet I stand guard, a smaller place. Not tall in size, but firm in sight, I watch the halls both day and night. If learning's block you wish to see, Find the post that watches free.", answer: "KUDOS" },
        2: { text: "Where coins jingle and packets rustle loud, The most famous spot that draws a crowd. Not a classroom, yet lessons learned— How empty pockets quickly turned! Here chilled darkness swirls with cream, And cookies dance in frozen dream. But treasures aren't found on display, Turn your back to where you pay. Behind temptation's busy door, Where weary souls rest and restore, A silver seat waits patiently there, With secrets hidden in its care.", answer: "BRAVO" },
        3: { text: "Where hungry minds gather near, Three faces watch throughout the year. One greets the Statue's morning light, One sees the Taj at noon so bright, One watches Opera House at night. These silent guardians never sleep, Different hours they always keep. But look not up where hands do race, But look not up where hands do race, The secret hides in green's embrace. Beneath world time, where nature grows, Your next clue waits where no one knows.", answer: "WELLDONE" },
        4: { text: "Where power suits and wisdom meet, Along the path beneath your feet, Knowledge watchers keep their doors, While students pass through corridor floors. Between where young minds learn their trade, And where important choices are made, A herald stands in silent pride, Of binary dreams and coding side. Not flesh and bone, but paper, pin, Where computing tales are held within. This messenger of silicon art, Holds the key to your next part. Look where algorithms find their fame, Upon the board that bears the name.", answer: "HATSOFF" },
        5: { text: "Not all stallions have four legs to stand, Some have two wheels, throttle in hand. Among the metal steeds at rest, One holds a code from the past. Take a perfect twenty squared, Subtract the centuries paired. Add the age when Cristo died, Plus one more year beside. Or solve it as the Romans would, One M, nine Cs, if you could. Three Xs and four Is to see, Ancient numbers set you free. Search the steed that bears this mark, Hidden close within its arc. Not where riders place their feet, Your treasure makes this quest complete", answer: "CHEERS" },
        6: { text: "Not all steeds need reins to run, Some have four wheels beneath the sun. Among the metal beasts that shine, One bears a number, yours to find. Take thirty perfect, squared with care, Subtract six score from what's there. Or start with five times perfect four, Then add another eighty more. The Romans carved it in their way, Five hundred with D they'd say. Two hundred more with doubled C, Then L for fifty, can't you see? Three tens with X complete the score, Ancient digits, nothing more. Seek the chariot bearing this sign, Where metal meets the modern line. Not beneath where tires meet ground, Your treasure waits to be found", answer: "FELICITATIONS" },
        7: { text: "Where giants leap but never fly, And orange moons arc through the sky, I stand as sentinel, tall and thin, Guarding the circle where victories begin. My head holds nothing but empty air, Yet thousands aim their hopes up there. I've felt the thunder of running feet, The rubber kiss of triumph and defeat. Warriors dance around my base, In this concrete coliseum space. I watch the sweat, I hear the call, But never move, I just stand tall. Look low, not high, for what you seek, Where my foundation meets concrete. The answer hides where no one scores, Down where my shadow sweeps the floors. Beneath the net where dreams take flight, In the arena of the endless fight, Your secret waits in stillness deep— Check the base where I take my sleep", answer: "GOODJOB" },
        8: { text: "Where memories linger, yet wander away,\n And treasures forgotten quietly stay.\n A silent keeper of things once dear,\n Awaiting the seeker to draw them near.\n Not in plain sight, nor tossed aside,\n But in a nook where time may hide.\n Keys and trinkets, notes or shoes,\n All wait in patience for someone to choose.\n Seek the chest where lost things rest,\n Your hidden clue awaits its quest.", answer: "THREECHEERS" },
        9: { text: "In a tiny world where secrets preen, Perched are watchers, though never seen. Featherless guardians in a cozy crest, Holding the key where they make their rest. Near hands that heal, yet out of plain sight, Among the miniatures that mimic flight. Count not wings, but notice the nest, Where quiet watchers guard your quest. Look closer, seeker, where stillness perches, A clue awaits amid the gentle searches. The small and subtle, the hidden and wise, Hold the next secret beneath their eyes", answer: "RESPECT" },
        10: { text: "Behind the panes where victors rest, And achievements shine their very best, Metal memories stand in rows, Each one a story that glory knows.\n Yet among the champions' metallic pride, A softer creation sits inside. Born not from victory's golden hand, But paper folded, carefully planned.\n Petals that will never wilt or fade, A blossom crafted, delicately made. Not growing from soil, root, or seed, But from skilled fingers' patient deed.\n The secret hides where beauty sits, Just below where the flower fits. In the shrine where honors are displayed, Seek the bloom and find your aid.", answer: "PROPS" }
    },
    2: {
        // Level 2 riddles (5 riddles for 5 pairs)
        1: { text: "Amidst the halls where footsteps tread, A patch of green lifts weary head. Leaves may dance and flowers sway, A peaceful corner by night or day. Yet hidden here, not just serene, A guardian rests, though seldom seen. It does not bloom, nor breathe, nor grow, But waits for danger’s fiery glow. Coiled and silent, in crimson attire, It guards the place from sudden fire. Not just a garden of beauty and grace, But safety’s shield within this space. Search where calm and caution meet, Your hidden clue lies at its feet.", answer: "EXCELLENT" },
        2: { text: "A silent sentinel touches the sky, Its shadow falls as people pass by. Many have gathered, many have gazed, Upon this mark where spirits are raised. But your path is not to the height above, Where winds embrace with pride and love. Instead, seek lower, where quiet hides, Where stillness with the earth abides. Not carved in stone, not cast in steel, Yet life surrounds with subtle feel. There, beneath the watcher’s grace, Your hidden clue has found its place.", answer: "WONDERFUL" },
        3: { text: "Where the masses gather to be fed, And coins exchange for daily bread, A chamber echoes with the sound, Of hunger met and answers found. Upon the wall, a sacred text, Declares what offering comes next. Not carved in stone or bound in leather, But changed like seasons, light as feather. The oracle speaks in listed lines, Of sustenance and daily signs. Yet woven in the mundane scroll, Lies something to complete your goal. Not what you eat, but what you read, The very letters plant the seed. The custodian of the feast's design, Has hidden truth within the line. Where steam rises and voices blend, And appetites meet their end, Seek the proclamation on the wall, Your answer's there among it all", answer: "SUPERB" },
        4: { text: "Where the seat of judgment sits enthroned, And decisions carved in stone are honed, A pathway climbs beside this gate, Where souls ascend to higher fate. I am the dragon's ancient foe, Dressed in crimson head to toe. Though I breathe no water, wind, or air, I suffocate what dances there. Chained to walls like a captured beast, I wait for chaos to be released. My belly full of frozen breath, I stand between the living and their death. Seek the place where power sleeps, Where the ascending passage creeps. There I hang in patient wait, A silent guardian by the gate.", answer: "FANTASTIC" },
        5: { text: "I am the keeper of whispers that everyone may hear, A canvas of tomorrow, though yesterday lingers near. My belly swells with fragments of a thousand different tales, Yet silence is my language, written upon my scales. I drink no water, yet I'm drowning in a paper sea, I have no legs to wander, but travelers come to me. The guardian of volumes watches from my back, While I face the rushing river where no water leaves a track. Silver teeth once bit me, holding fast what I must show, My skin bears many scars from all the things I've come to know. I am older every morning, yet refreshed with every dawn, A phoenix made of parchment, with yesterday's news gone. Where the many roads converge into a single beating heart, Where voices blend to thunder before they drift apart, There I stand as witness to the chaos and the calm— Find me where the crossroads rest within the central palm", answer: "BRILLIANT" }
    },
    3: {
        // Level 3 riddles (3 different riddles for 3 teams)
        1: { text: "Where bodies broken find their mend, And silent suffering meets its end, A guardian in sterile light, Turns darkness back to something bright. Ask four remedies for four who roam, Bandages to guide you home. For what strange ailment, if he may ask? A headache's cure—that's your task. Glass bottles line the sacred wall, Yet one elixir beats them all. Not for fever, cough, or ache, But for a different path to take. The keeper knows what isn't shown, A remedy that's theirs alone. The answer's written in this verse, Count and name to break the curse. Where campus wounds are washed and wrapped, And student ailments carefully mapped, Seek the one who heals with care, Request what's hidden in plain air.", answer: "PROGRAM" },
        2: { text: "In halls where silence is the law, And knowledge breathes without a flaw, A keeper watches over all, The guardian behind the wall. Seek the vessel that holds no tale, Where ink and words have failed to sail. A spine exists, a cover too, But what should fill it never grew. Born incomplete, forever hollow, No story leads, no plot to follow. The absence makes it what it is, A contradiction in the quiz. Decode what shouldn't be but stands, Request the void with empty hands. The keeper knows the paradox well, Ask for what has naught to tell. Where stories sleep in ordered lines, Seek what defies all the designs, Name the impossible to the one who knows, And forward on your journey goes.", answer: "SCRIPT" },
        3: { text: "Where exhaustion meets its liquid cure, And bitter comfort makes minds endure, A keeper stands with practiced hand, Master of the roasted land. Behind the counter, secrets hide, The keeper is your faithful guide. But what you need won't be displayed, It's in the shadows, specially made. Approach the master, speak the phrase, Two simple words to end this maze: Ask for something off the chart, \"The special drink\" to reach the next part. Where steam and chatter mix as one, Seek the spot where energy flows, The keeper there already knows.", answer: "ALGORITHM" }
    },
    4: {
        // Level 4 riddles (1 SAME riddle for final 3 teams)
        1: { text: "Check the walls where crimson soldiers wait, Your path ascends beside the office gate. Card catalog sleeps in silent rows, Given victories frozen as time flows. To courts where rubber meets the ground, You will find the sentinels, five are found. Seek the keeper with the healing touch, Request the brew they guard so much. Where hunger calls and masses dine, The oracle displays its line. Metal chariots bearing ancient code, Paper blossoms mark the road. Count the branches, turn around, Empty volumes can be found. Every corner holds a key, Yet what you seek stays close to thee. The guardian knows the special name, Speak the words to win this game. Behind the bark and under glass, Truth awaits for those who pass.", answer: "NIRVAN" },
        2: { text: "Check the walls where crimson soldiers wait, Your path ascends beside the office gate. Card catalog sleeps in silent rows, Given victories frozen as time flows. To courts where rubber meets the ground, You will find the sentinels, five are found. Seek the keeper with the healing touch, Request the brew they guard so much. Where hunger calls and masses dine, The oracle displays its line. Metal chariots bearing ancient code, Paper blossoms mark the road. Count the branches, turn around, Empty volumes can be found. Every corner holds a key, Yet what you seek stays close to thee. The guardian knows the special name, Speak the words to win this game. Behind the bark and under glass, Truth awaits for those who pass.", answer: "NIRVAN" },
        3: { text: "Check the walls where crimson soldiers wait, Your path ascends beside the office gate. Card catalog sleeps in silent rows, Given victories frozen as time flows. To courts where rubber meets the ground, You will find the sentinels, five are found. Seek the keeper with the healing touch, Request the brew they guard so much. Where hunger calls and masses dine, The oracle displays its line. Metal chariots bearing ancient code, Paper blossoms mark the road. Count the branches, turn around, Empty volumes can be found. Every corner holds a key, Yet what you seek stays close to thee. The guardian knows the special name, Speak the words to win this game. Behind the bark and under glass, Truth awaits for those who pass.", answer: "NIRVAN" }
    }
};

// Navigation functions
function goToTeamLogin() {
    window.location.href = 'team-login.html';
}

function goToAdminLogin() {
    window.location.href = 'admin-login.html';
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function goToAdminDashboard() {
    window.location.href = 'admin-dashboard.html';
}

function goBack() {
    window.location.href = 'index.html';
}

// Team login functions
function loginTeam() {
    const teamName = document.getElementById('teamName').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!teamName || !password) {
        alert('Please enter both team name and password');
        return;
    }
    
    if (teamData[teamName] && teamData[teamName].password === password) {
        currentUser = teamName;
        localStorage.setItem('currentUser', teamName);
        goToDashboard();
    } else {
        alert('Invalid team name or password');
    }
}

// Admin login functions
function loginAdmin() {
    const password = document.getElementById('adminPassword').value.trim();
    
    if (password === adminPassword) {
        localStorage.setItem('isAdmin', 'true');
        goToAdminDashboard();
    } else {
        alert('Invalid admin password');
    }
}

// Dashboard functions
function loadDashboard() {
    loadTeamDataFromStorage();
    const user = localStorage.getItem('currentUser');
    if (!user) {
        goToTeamLogin();
        return;
    }
    
    currentUser = user;
    displayTeamProgress();
}

function displayTeamProgress() {
    const team = teamData[currentUser];
    if (!team) {
        alert('Team not found');
        goToTeamLogin();
        return;
    }
    
    document.getElementById('teamName').textContent = currentUser;
    document.getElementById('currentLevel').textContent = team.level;
    
    const levelsContainer = document.getElementById('levelsContainer');
    levelsContainer.innerHTML = '';
    
    // If eliminated, show sorry message and block progression UI
    if (team.status === 'eliminated') {
        const message = document.createElement('div');
        message.className = 'eliminated-message';
        message.innerHTML = `
            <div class="level-card current">
                <div class="level-title">Eliminated</div>
                <div class="level-status status-locked">Sorry! The other team submitted the answer first. You are eliminated.</div>
            </div>
        `;
        levelsContainer.appendChild(message);
        return;
    }
    
    for (let i = 1; i <= 4; i++) {
        const levelCard = createLevelCard(i, team.level);
        levelsContainer.appendChild(levelCard);
    }
}

function createLevelCard(levelNumber, currentLevel) {
    const card = document.createElement('div');
    card.className = 'level-card';
    
    let status = 'locked';
    let statusText = 'Locked';
    
    if (levelNumber < currentLevel) {
        status = 'completed';
        statusText = 'Completed';
    } else if (levelNumber === currentLevel) {
        status = 'current';
        statusText = 'Current Level';
    }
    
    card.classList.add(status);
    
    card.innerHTML = `
        <div class="level-number">${levelNumber}</div>
        <div class="level-title">Level ${levelNumber}</div>
        <div class="level-status status-${status}">${statusText}</div>
        ${status === 'current' ? `<button class="btn btn-primary" onclick="startLevel(${levelNumber})">Start Level</button>` : ''}
    `;
    
    return card;
}

function startLevel(levelNumber) {
    const team = teamData[currentUser];
    if (team && team.status === 'eliminated') {
        alert('Sorry! The answer is submitted by your opponent first and you are eliminated.');
        return;
    }
    if (levelNumber === 1) {
        showLevelPassword(levelNumber);
    } else {
        // Check if previous level is completed
        if (team.level < levelNumber) {
            alert('Complete the previous level first');
            return;
        }
        showLevelPassword(levelNumber);
    }
}

function showLevelPassword(levelNumber) {
    const password = prompt(`Enter password for Level ${levelNumber}:`);
    if (password === gameState[`level${levelNumber}`].password) {
        showQuiz(levelNumber);
    } else {
        alert('Incorrect password');
    }
}

function showQuiz(levelNumber) {
    const quiz = quizQuestions[levelNumber];
    if (!quiz) {
        alert('Quiz not found for this level');
        return;
    }
    // Start or resume 25-minute timer
    startLevelTimer(levelNumber);
    
    const quizHTML = `
        <div class="quiz-container">
            <h2>Level ${levelNumber} - Tech Quiz</h2>
            <div class="timer" id="levelTimerDisplay">Loading timer...</div>
            <div class="quiz-question">${quiz.question}</div>
            <div class="quiz-options">
                ${quiz.options.map((option, index) => 
                    `<button class="quiz-option" onclick="selectAnswer(${index}, ${levelNumber})">${String.fromCharCode(65 + index)}) ${option}</button>`
                ).join('')}
            </div>
            <button class="btn btn-primary" onclick="submitQuiz(${levelNumber})" id="submitBtn" disabled>Submit Answer</button>
        </div>
    `;
    
    document.body.innerHTML = quizHTML;
}

let selectedAnswer = null;

function selectAnswer(answerIndex, levelNumber) {
    selectedAnswer = answerIndex;
    
    // Remove previous selection
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    event.target.classList.add('selected');
    
    // Enable submit button
    document.getElementById('submitBtn').disabled = false;
}

function submitQuiz(levelNumber) {
    if (selectedAnswer === null) {
        alert('Please select an answer');
        return;
    }
    
    const quiz = quizQuestions[levelNumber];
    if (selectedAnswer === quiz.correct) {
        alert('Correct! Moving to riddle round...');
        showRiddle(levelNumber);
    } else {
        alert('Incorrect answer. Try again.');
        selectedAnswer = null;
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.getElementById('submitBtn').disabled = true;
    }
}

function showRiddle(levelNumber) {
    const team = teamData[currentUser];
    const teamNumber = parseInt(currentUser.replace('Team', ''));
    
    let riddleIndex;
    if (levelNumber === 1) {
        riddleIndex = Math.ceil(teamNumber / 2);
    } else if (levelNumber === 2) {
        riddleIndex = Math.ceil(teamNumber / 2);
    } else if (levelNumber === 3) {
        riddleIndex = teamNumber;
    } else if (levelNumber === 4) {
        riddleIndex = teamNumber;
    }
    
    const riddle = riddles[levelNumber][riddleIndex];
    if (!riddle) {
        alert('Riddle not found');
        return;
    }
    
    const riddleHTML = `
        <div class="riddle-container">
            <h2>Level ${levelNumber} - Riddle</h2>
            <div class="timer" id="levelTimerDisplay">Loading timer...</div>
            <div class="riddle-text">${riddle.text}</div>
            <input type="text" class="answer-input" id="riddleAnswer" placeholder="Enter your answer here...">
            <button class="btn btn-primary" onclick="submitRiddle(${levelNumber}, '${riddle.answer}')">Submit Answer</button>
            <button class="btn btn-secondary" onclick="goToDashboard()">Back to Dashboard</button>
        </div>
    `;
    
    document.body.innerHTML = riddleHTML;
}

function submitRiddle(levelNumber, correctAnswer) {
    const userAnswer = document.getElementById('riddleAnswer').value.trim().toUpperCase();
    
    if (userAnswer === correctAnswer) {
        // Record submission timestamp for this level
        const team = teamData[currentUser];
        if (team) {
            if (!team.submissions) team.submissions = {};
            team.submissions[levelNumber] = Date.now();
        }
        alert('Correct! You have advanced to the next level!');
        
        // Update team level
        
        // Admin approval flow removed
        team.level = levelNumber + 1;
        
        // Save to localStorage (and notify other tabs)
        persistTeamData();
        clearLevelTimer();
        
        // If not the final level, immediately prompt for next level password
        if (levelNumber < 4) {
            showLevelPassword(levelNumber + 1);
            return;
        }
        
        // Final level completed
        alert('Congratulations! You have completed all levels!');
        goToDashboard();
    } else {
        alert('Incorrect answer. Try again.');
    }
}

// Timer helpers (25 minutes per level)
function startLevelTimer(levelNumber) {
    const team = teamData[currentUser];
    if (!team) return;
    const timerKey = `${currentUser}-level-${levelNumber}-deadline`;
    const existing = localStorage.getItem(timerKey);
    const now = Date.now();
    const twentyFiveMinutesMs = 25 * 60 * 1000;
    if (existing) {
        levelTimerEndsAt = parseInt(existing, 10);
    } else {
        levelTimerEndsAt = now + twentyFiveMinutesMs;
        localStorage.setItem(timerKey, String(levelTimerEndsAt));
    }
    renderTimer();
    if (levelTimer) clearInterval(levelTimer);
    levelTimer = setInterval(() => {
        renderTimer();
        if (Date.now() >= levelTimerEndsAt) {
            clearLevelTimer();
            // Auto-eliminate on expiry if still on this level and active
            const t = teamData[currentUser];
            if (t && t.status === 'active' && t.level === levelNumber) {
                t.status = 'eliminated';
                persistTeamData();
                alert('Time up! You are eliminated for exceeding the 25-minute limit.');
                goToDashboard();
            }
        }
    }, 1000);
}

function clearLevelTimer() {
    if (levelTimer) clearInterval(levelTimer);
    levelTimer = null;
    levelTimerEndsAt = null;
}

function renderTimer() {
    const el = document.getElementById('levelTimerDisplay');
    if (!el || !levelTimerEndsAt) return;
    const remaining = Math.max(0, levelTimerEndsAt - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    el.textContent = `Time left: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Admin dashboard functions
function loadAdminDashboard() {
    loadTeamDataFromStorage();
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
        goToAdminLogin();
        return;
    }
    
    displayAdminStats();
    displayTeamsTable();
    // Periodic refresh as a fallback in case storage event is throttled
    if (!window.__adminRefreshInterval) {
        window.__adminRefreshInterval = setInterval(() => {
            loadTeamDataFromStorage();
            displayAdminStats();
            displayTeamsTable();
        }, 5000);
    }
}

function displayAdminStats() {
    const totalTeams = Object.keys(teamData).length;
    const activeTeams = Object.values(teamData).filter(team => team.status === 'active').length;
    const eliminatedTeams = totalTeams - activeTeams;
    const currentRound = Math.max(...Object.values(teamData).map(team => team.level));
    
    document.getElementById('totalTeams').textContent = totalTeams;
    document.getElementById('activeTeams').textContent = activeTeams;
    document.getElementById('eliminatedTeams').textContent = eliminatedTeams;
    document.getElementById('currentRound').textContent = currentRound;
}

function displayTeamsTable() {
    const tableBody = document.getElementById('teamsTableBody');
    tableBody.innerHTML = '';
    
    Object.entries(teamData).forEach(([teamName, team]) => {
        const row = document.createElement('tr');
        const lastSub = team.submissions ? Math.max(0, ...Object.values(team.submissions)) : 0;
        const lastSubText = lastSub ? new Date(lastSub).toLocaleString() : '-';
        row.innerHTML = `
            <td>${teamName}</td>
            <td>Level ${team.level}</td>
            <td>${team.status}</td>
            <td>${team.partner}</td>
            <td>${lastSubText}</td>
            <td>
                ${team.status === 'active' ? `<button class="btn btn-primary" onclick="eliminateTeam('${teamName}')">Eliminate</button>` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function eliminateTeam(teamName) {
    if (!teamData[teamName]) return;
    if (teamData[teamName].status !== 'active') return;
    teamData[teamName].status = 'eliminated';
    persistTeamData();
    displayAdminStats();
    displayTeamsTable();
}

function resetAllTeams() {
    if (!confirm('Are you sure you want to reset all teams to start?')) return;
    Object.entries(teamData).forEach(([name, team]) => {
        team.level = 1;
        team.status = 'active';
        team.submissions = {};
    });
    // Clear any level timers stored per user/level
    try {
        Object.keys(localStorage).forEach((key) => {
            if (/-level-\d+-deadline$/.test(key)) {
                localStorage.removeItem(key);
            }
        });
    } catch (e) {
        // ignore
    }
    persistTeamData();
    displayAdminStats();
    displayTeamsTable();
    alert('All teams have been reset to start.');
}

// Initialize page based on current location
document.addEventListener('DOMContentLoaded', function() {
    // Ensure team data is loaded on any page
    loadTeamDataFromStorage();
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'dashboard.html':
            loadDashboard();
            break;
        case 'admin-dashboard.html':
            loadAdminDashboard();
            break;
        default:
            // Homepage or login pages - no special initialization needed
            break;
    }
});
