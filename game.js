document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const ball = document.getElementById('ball');
    const goalkeeper = document.getElementById('goalkeeper');
    const goalArea = document.getElementById('goal-area');
    const scoreVal = document.getElementById('score-value');
    const streakVal = document.getElementById('streak-value');
    const gameMessage = document.getElementById('game-message');
    const shootBtn = document.getElementById('shoot-btn');
    const dirIndicator = document.getElementById('direction-indicator');
    const pwrIndicator = document.getElementById('power-indicator');

    // Game Constants & State
    let score = 0;
    let streak = 0;
    let gameState = 'IDLE'; 
    let lastShots = []; 
    
    let dirVal = 0; 
    let pwrVal = 0; 
    let dirDir = 1; 
    let pwrDir = 1;

    let lockedDir = 0;
    let lockedPwr = 0;

    // Animation loop for indicators
    function updateBars() {
        if (gameState === 'LOCKING_DIR') {
            dirVal += 2.5 * dirDir;
            if (dirVal >= 100 || dirVal <= 0) dirDir *= -1;
            dirIndicator.style.left = `${dirVal}%`;
        } else if (gameState === 'LOCKING_PWR') {
            pwrVal += 3.5 * pwrDir;
            if (pwrVal >= 100 || pwrVal <= 0) pwrDir *= -1;
            pwrIndicator.style.bottom = `${pwrVal}%`;
        }
        requestAnimationFrame(updateBars);
    }
    updateBars();

    function startGame() {
        gameState = 'LOCKING_DIR';
        shootBtn.textContent = 'LOCK DIRECTION';
        gameMessage.textContent = 'Lock your direction!';
        dirVal = 50;
        pwrVal = 0;
        dirDir = 1;
        pwrDir = 1;
    }

    shootBtn.addEventListener('click', () => {
        if (gameState === 'IDLE') {
            startGame();
        } else if (gameState === 'LOCKING_DIR') {
            lockedDir = dirVal;
            gameState = 'LOCKING_PWR';
            shootBtn.textContent = 'LOCK POWER & SHOOT';
            gameMessage.textContent = 'Lock your power!';
        } else if (gameState === 'LOCKING_PWR') {
            lockedPwr = pwrVal;
            gameState = 'SHOOTING';
            shootBtn.disabled = true;
            performShot();
        }
    });

    function performShot() {
        // AI Logic
        let playerX = Math.floor(lockedDir / 34); 
        let gkGuessX = Math.floor(Math.random() * 3);
        let gkGuessY = Math.floor(Math.random() * 3); 

        if (lastShots.length >= 3) {
            const lastThreeMatch = lastShots.slice(-3).every(v => v === lastShots[lastShots.length-1]);
            if (lastThreeMatch && Math.random() < 0.7) {
                gkGuessX = lastShots[lastShots.length-1]; 
            }
        }

        const reactionDelay = Math.max(80, 400 - (streak * 40));

        // Move GK
        setTimeout(() => {
            // Net area bottom = 340px * 0.4 = 136px from bottom
            // GK stays within: bottom 136px to top of net (204px from bottom of goal = ~204px)
            const gkPositionsX = ['5%', 'calc(50% - 45px)', 'calc(95% - 90px)'];
            const gkPositionsY = ['136px', '188px', '240px']; // low, mid, high inside net
            
            goalkeeper.style.left = gkPositionsX[gkGuessX];
            goalkeeper.style.bottom = gkPositionsY[gkGuessY];
            
            if (gkGuessX === 0) goalkeeper.style.transform = 'rotate(-30deg)';
            else if (gkGuessX === 2) goalkeeper.style.transform = 'rotate(30deg)';
            else goalkeeper.style.transform = 'rotate(0deg)';
        }, reactionDelay);

        // Move Ball into the goal net area
        // Net occupies: bottom 136px to 340px from bottom (top of goal-area)
        // lockedDir 0-100 => horizontal spread
        // lockedPwr 0-100 => height inside net (136 = low, 300 = high)
        const goalRect = goalArea.getBoundingClientRect();
        const goalW = goalRect.width;

        // Horizontal: clamp to 15%-85% of width to stay within posts
        const minX = goalW * 0.12;
        const maxX = goalW * 0.88;
        const ballTargetX = minX + (lockedDir / 100) * (maxX - minX);

        // Vertical: 0% power => bottom of net (136px), 100% => near top (300px)
        let isOut = lockedPwr > 92;
        const minY = 136;  // bottom of net
        const maxY = 300;  // top of net
        const ballTargetY = isOut ? 380 : minY + (lockedPwr / 100) * (maxY - minY);

        ball.style.transition = 'all 0.65s cubic-bezier(0.22, 0.61, 0.36, 1)';
        ball.style.left = `${ballTargetX - 18}px`;
        ball.style.bottom = `${ballTargetY}px`;
        ball.style.transform = `scale(${0.5 + (lockedPwr / 200)}) rotate(720deg)`;

        // Result
        setTimeout(() => {
            const gkRect = goalkeeper.getBoundingClientRect();
            const ballRect = ball.getBoundingClientRect();

            const overlapped = !(
                ballRect.right < gkRect.left ||
                ballRect.left > gkRect.right ||
                ballRect.bottom < gkRect.top ||
                ballRect.top > gkRect.bottom
            );

            if (isOut) {
                gameMessage.textContent = '❌ WIDE AND HIGH!';
                gameMessage.style.color = '#ff4b2b';
                streak = 0;
            } else if (overlapped) {
                gameMessage.textContent = '🧤 STUNNING SAVE!';
                gameMessage.style.color = '#ff4b2b';
                streak = 0;
            } else {
                score++;
                streak++;
                scoreVal.textContent = score;
                streakVal.textContent = streak;
                gameMessage.textContent = '⚽ GOALLLLLLL!!!';
                gameMessage.style.color = '#FEBE10';
            }

            lastShots.push(playerX);
            if (lastShots.length > 10) lastShots.shift();

            setTimeout(() => {
                resetUI();
            }, 2000);
        }, 650);
    }

    function resetUI() {
        ball.style.transition = 'none';
        ball.style.bottom = '0px';
        ball.style.left = 'calc(50% - 20px)';
        ball.style.transform = 'scale(1) rotate(0deg)';
        
        goalkeeper.style.left = 'calc(50% - 45px)';
        goalkeeper.style.bottom = '136px';
        goalkeeper.style.transform = 'rotate(0deg)';
        
        gameState = 'IDLE';
        shootBtn.disabled = false;
        shootBtn.textContent = 'START NEW ROUND';
        gameMessage.textContent = 'Ready for the next one?';
        gameMessage.style.color = '#fff';
    }

    resetUI();
});
