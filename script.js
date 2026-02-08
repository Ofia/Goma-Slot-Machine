// Slot machine items
const slotItems = [
    'static/images/cherri.png',
    'static/images/diamond.png',
    'static/images/grapes.png',
    'static/images/watermalon.png',
    'static/images/7.png',
    'static/images/hores%20shoe.png'
];

// Get elements
const playButton = document.getElementById('playButton');
const tvSplash = document.getElementById('tvSplash');
const winMessage = document.getElementById('winMessage');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

let isSpinning = false;
let firstPlay = true;
let transitionsCompleted = 0;
let shuffleIntervals = [null, null, null];

// Initialize reels with items
function initializeReels() {
    reels.forEach((reel, index) => {
        const reelStrip = reel.querySelector('.reel-strip');

        // Create enough items for smooth scrolling
        const itemCount = 15;

        for (let i = 0; i < itemCount; i++) {
            const randomItem = slotItems[Math.floor(Math.random() * slotItems.length)];
            const img = document.createElement('img');
            img.src = randomItem;
            img.className = 'reel-item';
            img.alt = 'Slot item';
            reelStrip.appendChild(img);
        }
    });
}

// Shuffle items in a reel
function shuffleReel(reelStrip) {
    const items = reelStrip.querySelectorAll('.reel-item');
    items.forEach(item => {
        const randomItem = slotItems[Math.floor(Math.random() * slotItems.length)];
        item.src = randomItem;
    });
}

// Start spinning
function spin() {
    if (isSpinning) return;

    // Hide splash screen on first play
    if (firstPlay && tvSplash) {
        tvSplash.classList.add('hidden');
        firstPlay = false;
    }

    isSpinning = true;
    playButton.disabled = true;
    transitionsCompleted = 0;

    // Start spinning all reels
    reels.forEach((reel, index) => {
        const reelStrip = reel.querySelector('.reel-strip');
        reelStrip.classList.add('spinning');

        // Continuously shuffle items while spinning
        shuffleIntervals[index] = setInterval(() => {
            shuffleReel(reelStrip);
        }, 100);
    });

    // Stop reels one by one
    const stopDelays = [2000, 2500, 3000];

    reels.forEach((reel, index) => {
        setTimeout(() => {
            stopReel(reel, index);
        }, stopDelays[index]);
    });
}

// Get the actually visible item in the center of a reel
function getVisibleItem(reel, reelIndex) {
    const reelStrip = reel.querySelector('.reel-strip');
    const items = Array.from(reelStrip.querySelectorAll('.reel-item'));
    const reelRect = reel.getBoundingClientRect();
    const reelCenterY = reelRect.top + reelRect.height / 2;

    // Find the item whose center is closest to the reel's center
    let closestItem = null;
    let minDistance = Infinity;

    items.forEach((item, idx) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(itemCenterY - reelCenterY);

        if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
        }
    });

    console.log(`Reel ${reelIndex} visible item:`, closestItem ? closestItem.src.split('/').pop() : 'none');

    return closestItem ? closestItem.src : null;
}

// Check for winning combinations
function checkWin() {
    console.log('\n=== CHECKING FOR WINS ===');

    // Wait for browser to finish rendering
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Hide any previous message
            winMessage.classList.remove('show', 'jackpot');

            // Get visible items from each reel
            const visibleItems = reels.map((reel, index) => getVisibleItem(reel, index));

            // Extract just the filename
            const items = visibleItems.map(src => {
                if (!src) return null;
                const parts = src.split('/');
                return decodeURIComponent(parts[parts.length - 1]);
            });

            console.log('Item 0:', items[0]);
            console.log('Item 1:', items[1]);
            console.log('Item 2:', items[2]);
            console.log('All match?', items[0] === items[1] && items[1] === items[2]);

            // Check if all three items are the same
            if (items[0] && items[0] === items[1] && items[1] === items[2]) {
                console.log('WIN DETECTED!');
                if (items[0] === '7.png') {
                    console.log('JACKPOT!');
                    showWinMessage('JACK POT!', true);
                } else {
                    console.log('Three in a row!');
                    showWinMessage('Three in a row!', false);
                }
            } else {
                console.log('No win this time');
            }

            // Re-enable play button
            isSpinning = false;
            playButton.disabled = false;

            // Reset transforms for next spin
            setTimeout(() => {
                reels.forEach(r => {
                    const strip = r.querySelector('.reel-strip');
                    strip.style.transition = 'none';
                    strip.style.transform = 'translateY(0)';
                });
            }, 100);
        });
    });
}

// Display win message
function showWinMessage(message, isJackpot) {
    winMessage.innerHTML = `<span>${message}</span>`;
    winMessage.classList.add('show');

    if (isJackpot) {
        winMessage.classList.add('jackpot');
    }

    // Hide message after 3 seconds
    setTimeout(() => {
        winMessage.classList.remove('show', 'jackpot');
    }, 3000);
}

// Stop a reel
function stopReel(reel, reelIndex) {
    const reelStrip = reel.querySelector('.reel-strip');

    // Stop the shuffle interval immediately
    if (shuffleIntervals[reelIndex]) {
        clearInterval(shuffleIntervals[reelIndex]);
        shuffleIntervals[reelIndex] = null;
    }

    // Just remove spinning animation - let it stop naturally wherever it is
    reelStrip.classList.remove('spinning');

    console.log(`Reel ${reelIndex} stopped naturally`);

    transitionsCompleted++;

    // If all reels completed, check for wins after a short delay
    if (transitionsCompleted === reels.length) {
        console.log('All reels stopped, checking wins...');
        // Give it a moment to settle
        setTimeout(() => {
            checkWin();
        }, 200);
    }
}

// Event listeners
playButton.addEventListener('click', spin);

// Initialize when page loads
window.addEventListener('load', initializeReels);
