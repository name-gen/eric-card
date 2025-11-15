// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the elements we need
    const captchaContainer = document.querySelector('.baby-captcha-container');
    const cardContainer = document.querySelector('.card-container');
    
    // Puzzle elements
    const puzzleSlotsContainer = document.getElementById('puzzle-slots');
    const puzzlePiecesContainer = document.getElementById('puzzle-pieces');
    const puzzleMessage = document.getElementById('puzzle-message');
    const tryAgainButton = document.getElementById('try-again-button');
    const confirmButton = document.getElementById('confirm-button');
    
    // Card flip elements
    const card = document.getElementById('wishing-card');
    const showMessageButton = document.getElementById('show-message');
    const showVideoButton = document.getElementById('show-video');
    const closeButton = document.querySelector('.close-button');
    const backTitle = document.getElementById('back-title');
    const backContent = document.getElementById('back-content');
    const nephewNameEl = document.getElementById('nephew-name');

    // Variable to keep track of the piece being dragged via touch
    let touchedPiece = null;

    // --- Create Twinkling Stars ---
    const starsContainer = document.querySelector('.stars-container');
    const numberOfStars = 30;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random position
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;

        // Random animation delay and duration for a more natural effect
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${Math.random() * 2 + 2}s`; // Duration between 2s and 4s

        starsContainer.appendChild(star);
    }

    // --- Puzzle Game Logic ---
    const correctWord = "ERIC";
    let letters = correctWord.split('');

    function initializePuzzle() {
        // Clear previous state
        puzzleSlotsContainer.innerHTML = '';
        puzzlePiecesContainer.innerHTML = '';
        puzzleMessage.textContent = "";
        tryAgainButton.classList.add('hidden');
        confirmButton.classList.remove('hidden');

        // Create drop slots
        for (let i = 0; i < correctWord.length; i++) {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot');
            slot.dataset.index = i;
            puzzleSlotsContainer.appendChild(slot);
            addSlotEvents(slot);
        }

        // Create and shuffle draggable letter circles
        const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);
        shuffledLetters.forEach((letter, index) => {
            const piece = document.createElement('div');
            piece.id = `piece-${letter}`;
            piece.classList.add('puzzle-circle');
            piece.dataset.letter = letter;
            piece.draggable = true;

            piece.innerHTML = `
                <div class="circle-face circle-front">${letter}</div>
                <div class="circle-face circle-back"></div>
            `;
            puzzlePiecesContainer.appendChild(piece);
            addPieceEvents(piece);
        });
    }

    function addPieceEvents(piece) {
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', piece.id);
            setTimeout(() => piece.classList.add('dragging'), 0);
        });
        piece.addEventListener('dragend', () => piece.classList.remove('dragging'));

        // --- Touch Events for Mobile ---
        piece.addEventListener('touchstart', (e) => {
            // Prevent page scrolling while dragging
            e.preventDefault();
            touchedPiece = piece;
            piece.classList.add('dragging');
        }, { passive: false });
    }

    // We need global touch listeners to handle moving and dropping
    document.addEventListener('touchmove', (e) => {
        if (!touchedPiece) return;
        // Prevent page scrolling
        e.preventDefault();

        const touch = e.touches[0];
        // Find the element under the finger
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);

        // Visually indicate which slot is being hovered over
        document.querySelectorAll('.puzzle-slot').forEach(slot => {
            if (slot === elementUnderTouch || slot.contains(elementUnderTouch)) {
                slot.classList.add('drag-over');
            } else {
                slot.classList.remove('drag-over');
            }
        });

    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (!touchedPiece) return;

        const touch = e.changedTouches[0];
        const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find the closest puzzle-slot and trigger the drop logic
        const slot = dropZone ? dropZone.closest('.puzzle-slot') : null;
        if (slot) {
            handleDrop(slot, touchedPiece);
        }

        touchedPiece.classList.remove('dragging');
        touchedPiece = null;
    }

    function addSlotEvents(slot) {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');

            const pieceId = e.dataTransfer.getData('text/plain');
            const piece = document.getElementById(pieceId);
            handleDrop(slot, piece);
        });
    }

    // Centralized function to handle dropping a piece into a slot
    function handleDrop(slot, piece) {
        slot.classList.remove('drag-over');
        piece.classList.add('in-slot');

        // If slot is empty, append. If not, swap.
        if (slot.children.length === 0) {
            slot.appendChild(piece);
        } else {
            const existingPiece = slot.children[0];
            const sourceContainer = piece.parentElement; // The container the piece was dragged from
            sourceContainer.appendChild(existingPiece);
            slot.appendChild(piece);
        }
    }

    function checkAnswer() {
        let userAnswer = "";
        const slots = puzzleSlotsContainer.querySelectorAll('.puzzle-slot');
        slots.forEach(slot => {
            if (slot.children.length > 0) {
                userAnswer += slot.children[0].dataset.letter;
            }
        });

        if (userAnswer === correctWord) {
            puzzleMessage.textContent = "You got it!";
            puzzleMessage.style.color = '#00796B';
            confirmButton.classList.add('hidden');
            
            // Flip circles to show the correct word
            document.querySelectorAll('.puzzle-circle').forEach(c => c.classList.remove('is-flipped'));

            // Show the wishing card
            setTimeout(() => {
                captchaContainer.style.opacity = '0';
                setTimeout(() => {
                    captchaContainer.classList.add('hidden');
                    cardContainer.classList.remove('hidden');
                }, 500);
            }, 2000);
        } else {
            puzzleMessage.textContent = "Oops! That's not right.";
            puzzleMessage.style.color = '#d32f2f';
            confirmButton.classList.add('hidden');
            tryAgainButton.classList.remove('hidden');
        }
    }

    function runIntroAnimation() {
        const pieces = document.querySelectorAll('.puzzle-circle');

        // 1. Show letters for 3 seconds
        setTimeout(() => {
            // 2. Flip all circles to their back
            pieces.forEach(piece => piece.classList.add('is-flipped'));

            // 3. Animate to random positions (scramble)
            setTimeout(() => {
                pieces.forEach(piece => {
                    const x = (Math.random() - 0.5) * 200;
                    const y = (Math.random() - 0.5) * 50;
                    piece.style.transform = `translate(${x}px, ${y}px)`;
                });
            }, 500);
        }, 3000);
    }

    function startGame() {
        initializePuzzle();
        runIntroAnimation();
    }

    confirmButton.addEventListener('click', checkAnswer);

    tryAgainButton.addEventListener('click', () => {
        // Reset by re-initializing the game
        startGame();
    });

    startGame(); // Initialize the game on page load

    // --- Typing Effect Logic ---
    const typingTexts = ["Little One!", "Eric!"];
    let textIndex = 0;
    let charIndex = 0;
    let isErasing = false;
    const typingSpeed = 150;
    const erasingSpeed = 100;
    const delayBetweenTexts = 2000; // 2 seconds

    function typeEffect() {
        const currentText = typingTexts[textIndex];
        nephewNameEl.classList.add('typing');

        if (isErasing) {
            // Erase characters
            nephewNameEl.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isErasing = false;
                textIndex = (textIndex + 1) % typingTexts.length;
            }
        } else {
            // Type characters
            nephewNameEl.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentText.length) {
                isErasing = true;
                // Wait before starting to erase
                setTimeout(typeEffect, delayBetweenTexts);
                return;
            }
        }

        setTimeout(typeEffect, isErasing ? erasingSpeed : typingSpeed);
    }

    // Start the typing effect after the initial h2 fade-in animation completes.
    // h2 animation-delay (4.5s) + animation-duration (1.5s) + a small buffer (1s)
    setTimeout(() => {
        // Start by erasing the initial text
        isErasing = true;
        charIndex = nephewNameEl.textContent.length;
        typeEffect();
    }, 7000); // 4.5s + 1.5s + 1s = 7s

    // --- Card Flip Logic ---

    // Event listener for the message icon
    showMessageButton.addEventListener('click', () => {
        // Find the badge and hide it to show the message has been "read"
        const badge = showMessageButton.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }

        // Stop the shaking animation permanently by removing the animation style
        showMessageButton.style.animation = 'none';

        backTitle.textContent = 'A Message From Pheaktra';
        // ** ENTER YOUR WISHING MESSAGE HERE **
        backContent.innerHTML = `
            <p style="text-align: left; font-size: 1.1em; line-height: 1.6;">
                Dearest Eric,<br><br>
                Congratulations to your parents to bring you into the world!  
                They are so incredibly lucky to have a wonderful new addition like you in their lives,
                and they are thrilled for their new adventure as your parents.
                <br><br>
                Welcome to this big, beautiful world! I've been eagerly waiting for your arrival 
                and can't wait to see the joy you'll bring to everyone around you.
                <br><br>
                May your life be a grand adventure filled with wonder, joy, 
                and so much love. I wish you healthy, happiness, 
                and a future filled with boundless opportunities. I can't wait to be a part of your journey and watch you flourish.
                <br><br>
                With all my love,<br>
                Pheaktra
            </p>
        `;
        card.classList.add('is-flipped');
    });

    // Event listener for the YouTube icon
    showVideoButton.addEventListener('click', () => {
        backTitle.textContent = 'A Happy Tune!';
        // Replace 'VIDEO_ID' with the ID from a YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
        const videoId = 'https://www.youtube.com/watch?v=5u4xTa3LR2U&list=RD5u4xTa3LR2U&start_radio=1'; // Example: A gentle lullaby
        backContent.innerHTML = `
            <iframe style="width:100%; height: 100%; border:0;" 
                src="https://www.youtube.com/embed/${videoId}" 
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
        `;
        card.classList.add('is-flipped');
    });

    // Event listener for the close button on the back
    closeButton.addEventListener('click', () => {
        card.classList.remove('is-flipped');
        // Clear content after flip to stop video playback
        setTimeout(() => {
            backContent.innerHTML = '';
        }, 500); // Delay should match CSS transition time
    });
});
