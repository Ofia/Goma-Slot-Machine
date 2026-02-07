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
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

let isSpinning = false;
let firstPlay = true;

// Initialize reels with items
function initializeReels() {
    reels.forEach((reel, index) => {
        const reelStrip = reel.querySelector('.reel-strip');

        // Create enough items for smooth scrolling (reduced from 20 to 15)
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

    // Start spinning all reels
    reels.forEach(reel => {
        const reelStrip = reel.querySelector('.reel-strip');
        reelStrip.classList.add('spinning');

        // Continuously shuffle items while spinning for variety
        const shuffleInterval = setInterval(() => {
            if (!reelStrip.classList.contains('spinning')) {
                clearInterval(shuffleInterval);
            } else {
                shuffleReel(reelStrip);
            }
        }, 100);
    });

    // Stop reels one by one
    const stopDelays = [2000, 2500, 3000]; // Stop times for each reel

    reels.forEach((reel, index) => {
        setTimeout(() => {
            stopReel(reel, index === reels.length - 1);
        }, stopDelays[index]);
    });
}

// Stop a reel
function stopReel(reel, isLastReel) {
    const reelStrip = reel.querySelector('.reel-strip');

    // Remove spinning animation
    reelStrip.classList.remove('spinning');

    // Calculate position to center an item in the viewport
    const items = reelStrip.querySelectorAll('.reel-item');
    const reelHeight = reel.offsetHeight;
    const itemHeight = items[0].offsetHeight;
    const itemMargin = itemHeight * 0.04; // 2% top + 2% bottom margin
    const totalItemHeight = itemHeight + itemMargin;

    // Pick random item to display
    const randomIndex = Math.floor(Math.random() * (items.length - 3)) + 1;

    // Center the selected item in the reel viewport
    const offset = (randomIndex * totalItemHeight) - (reelHeight / 2) + (itemHeight / 2);

    reelStrip.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    reelStrip.style.transform = `translateY(-${offset}px)`;

    // If this is the last reel, enable play button again
    if (isLastReel) {
        setTimeout(() => {
            isSpinning = false;
            playButton.disabled = false;

            // Reset transforms for next spin
            reels.forEach(r => {
                const strip = r.querySelector('.reel-strip');
                strip.style.transition = 'none';
                strip.style.transform = 'translateY(0)';
            });
        }, 500);
    }
}

// Event listener
playButton.addEventListener('click', spin);

// Initialize when page loads
window.addEventListener('load', initializeReels);
