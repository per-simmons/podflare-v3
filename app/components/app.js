// PodFlare Website JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavbar();
    initVideoCarousel();
    initFaqAccordion();
    initServiceCardAnimations();
    initIntersectionObserver();
    initParallaxEffect();
    
    // Add critical CSS for video display
    const style = document.createElement('style');
    style.textContent = `
        .video-card {
            position: relative;
            overflow: hidden;
            width: 270px;
            height: 480px;
            border-radius: 12px;
            background-color: #1a103c;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .video-card video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            z-index: 5;
            background: #1a103c;
        }
        
        .video-card.playing video {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 5 !important;
        }
        
        .play-button {
            position: absolute;
            z-index: 10;
            cursor: pointer;
        }
        
        /* Force video poster to be visible */
        .video-card video[poster] {
            object-fit: cover !important;
            object-position: center !important;
            background-size: cover !important;
        }
    `;
    document.head.appendChild(style);
    
    // Force all videos to show posters immediately
    setTimeout(() => {
        document.querySelectorAll('.video-card video').forEach(video => {
            if (video.hasAttribute('poster')) {
                const poster = video.getAttribute('poster');
                video.setAttribute('poster', poster);
                console.log('Forcing poster display:', poster);
            }
        });
    }, 100);

    // Debug Mode
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug') === 'true';
    
    if (debugMode) {
        document.body.classList.add('video-debug');
    }
    
    // Mobile nav toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Modern FAQ functionality
    const faqCards = document.querySelectorAll('.faq-card');
    
    faqCards.forEach(card => {
        const header = card.querySelector('.faq-header');
        
        if (header) {
            header.addEventListener('click', () => {
                // Close all other cards
                faqCards.forEach(otherCard => {
                    if (otherCard !== card && otherCard.classList.contains('active')) {
                        otherCard.classList.remove('active');
                    }
                });
                
                // Toggle current card with minimal delay
                card.classList.toggle('active');
                console.log('FAQ card clicked:', card);
            });
        }
    });
});

// Navbar handling
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    
    if (!navbar) return;
    
    // Navbar scroll behavior
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 0) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Mobile menu toggle
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when a link is clicked
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Video carousel functionality
function initVideoCarousel() {
    const videoContainer = document.querySelector('.video-container');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const videoCards = document.querySelectorAll('.video-card');
    
    if (!videoContainer || !prevBtn || !nextBtn || videoCards.length === 0) return;
    
    console.log("Initializing video carousel with", videoCards.length, "cards");
    
    let currentIndex = 0;
    let isAnimating = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let userInitiatedPlayback = false; // Track if user has started playing videos
    
    // Store original poster paths for all videos
    videoCards.forEach(card => {
        const video = card.querySelector('video');
        if (video && video.hasAttribute('poster')) {
            // Store the original poster path
            video.dataset.poster = video.getAttribute('poster');
            
            // Make sure poster is visible
            video.setAttribute('poster', video.dataset.poster);
            
            // Ensure video is visible
            video.style.display = 'block';
            
            // Only remove poster when actually playing
            video.addEventListener('playing', () => {
                video.removeAttribute('poster');
                video.classList.add('playing');
            });
            
            // Always restore poster when paused
            video.addEventListener('pause', () => {
                console.log("Pause event fired - restoring poster");
                if (video.dataset.poster) {
                    video.setAttribute('poster', video.dataset.poster);
                }
            });
            
            // Also restore poster when ended
            video.addEventListener('ended', () => {
                console.log("Ended event fired - restoring poster");
                if (video.dataset.poster) {
                    video.setAttribute('poster', video.dataset.poster);
                }
            });
        }
    });
    
    // Filter out cards without video sources
    const validVideoCards = [];
    videoCards.forEach((card, cardIndex) => {
        const video = card.querySelector('video');
        if (video && video.src && video.src.trim() !== '') {
            // Verify video path
            console.log(`[${cardIndex}] Video source:`, video.src);
            
            // Store the card index for debugging
            card.dataset.originalIndex = cardIndex;
            
            // Add to valid cards
            validVideoCards.push(card);
            
            // Store index in the DOM element
            card.dataset.index = validVideoCards.length - 1;
        } else {
            // Hide cards without valid videos
            card.style.display = 'none';
        }
    });
    
    // If no valid videos, exit
    if (validVideoCards.length === 0) {
        console.error("No valid video cards found!");
        return;
    }
    
    // Set up the container for proper centering - do this once at initialization
    videoContainer.style.position = 'relative';
    videoContainer.style.left = '50%';
    videoContainer.style.transform = 'translateX(-50%)';
    videoContainer.style.width = '96vw'; // Wider container to show more cards
    videoContainer.style.overflow = 'visible'; // Allow cards to peek outside
    
    console.log(`Found ${validVideoCards.length} valid video cards`);
    
    // Initialize video posters and ensure they're visible
    function initializeVideoThumbnails() {
        console.log("Initializing video thumbnails...");
        validVideoCards.forEach(card => {
            const video = card.querySelector('video');
            if (video) {
                // Force disable preload to ensure poster shows
                video.preload = "none";
                
                // CRITICAL: Get and store the poster path from HTML
                if (!video.dataset.poster) {
                    if (video.hasAttribute('poster')) {
                        video.dataset.poster = video.getAttribute('poster');
                        console.log(`Found and stored poster for video: ${video.src}`);
                        console.log(`Poster path: ${video.dataset.poster}`);
                    } else {
                        console.warn(`Missing poster attribute for video: ${video.src}`);
                    }
                }
                
                // Force the poster to be visible with direct style
                video.style.objectFit = 'cover';
                video.style.width = '100%';
                video.style.height = '100%';
                
                if (video.dataset.poster) {
                    video.setAttribute('poster', video.dataset.poster);
                    console.log(`Set poster for video: ${video.src}`);
                    
                    // Force poster through CSS as a fallback
                    const posterUrl = video.dataset.poster;
                    video.style.background = `url(${posterUrl}) center center / cover no-repeat`;
                }
                
                // Debug poster attribute to verify it's set
                console.log(`Video poster attribute is: ${video.getAttribute('poster')}`);
                
                // Reset video to ensure poster shows
                video.load();
            }
        });
    }
    
    // Call initialization immediately
    initializeVideoThumbnails();
    
    // And call it again after a delay to catch any videos loaded later
    setTimeout(initializeVideoThumbnails, 500);
    
    // Calculate and position all cards initially
    positionCards(currentIndex);
    
    // Handle play button clicks for maximum reliability
    validVideoCards.forEach((card, index) => {
        const video = card.querySelector('video');
        const playButton = card.querySelector('.play-button');
        
        if (!video || !playButton) return;
        
        // Ensure play button is properly styled
        playButton.style.position = 'absolute';
        playButton.style.top = '50%';
        playButton.style.left = '50%';
        playButton.style.transform = 'translate(-50%, -50%)';
        playButton.style.width = '60px';
        playButton.style.height = '60px';
        playButton.style.borderRadius = '50%';
        playButton.style.backgroundColor = 'rgba(209, 246, 2, 0.2)';
        playButton.style.border = '2px solid #d1f602';
        playButton.style.display = 'flex';
        playButton.style.alignItems = 'center';
        playButton.style.justifyContent = 'center';
        playButton.style.cursor = 'pointer';
        playButton.style.transition = 'all 0.3s ease';
        playButton.style.zIndex = '10';
        playButton.style.opacity = '1';
        
        // Style the play icon
        const playIcon = playButton.querySelector('i');
        if (playIcon) {
            playIcon.style.color = '#d1f602';
            playIcon.style.fontSize = '24px';
        }
        
        // Add hover effect
        playButton.addEventListener('mouseenter', () => {
            playButton.style.backgroundColor = 'rgba(209, 246, 2, 0.3)';
            playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        playButton.addEventListener('mouseleave', () => {
            playButton.style.backgroundColor = 'rgba(209, 246, 2, 0.2)';
            playButton.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // Add click handler to the entire card area
        card.addEventListener('click', function(e) {
            if (e.target === playButton || playButton.contains(e.target)) {
                // Let the play button handler handle it
                return;
            }
            
            console.log("Card clicked (not play button):", index);
            
            // Make this card active if it's not already
            if (index !== currentIndex) {
                // Pause current active video
                const activeVideo = validVideoCards[currentIndex].querySelector('video');
                if (activeVideo) {
                    activeVideo.pause();
                    validVideoCards[currentIndex].classList.remove('playing');
                }
                
                // Update active card
                currentIndex = index;
                positionCards(currentIndex);
            }
        });
        
        // Direct, simple play/pause toggle
        playButton.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            console.log("Play button clicked on card", index, "Current active index:", currentIndex);
            
            // Ensure we've registered user interaction 
            document.documentElement.classList.add('user-interaction');
            
            // Basic play/pause toggle logic
            if (video.paused) {
                // Set flag that user has initiated playback
                userInitiatedPlayback = true;
                
                // If we're not the active card, make us active
                if (index !== currentIndex) {
                    console.log("Making card", index, "the new active card");
                    
                    // Pause current active video
                    const activeVideo = validVideoCards[currentIndex].querySelector('video');
                    if (activeVideo) {
                        activeVideo.pause();
                        validVideoCards[currentIndex].classList.remove('playing');
                    }
                    
                    // Update active card
                    currentIndex = index;
                    positionCards(currentIndex);
                    
                    // Play after positioning animation finishes
                    setTimeout(function() {
                        console.log("Playing video after repositioning");
                        playVideoWithSound(video, card);
                    }, 300);
                } else {
                    // Already active, just play
                    console.log("Card already active, just playing");
                    playVideoWithSound(video, card);
                }
            } else {
                // Video is playing, pause it
                video.pause();
                card.classList.remove('playing');
                
                // Update button icon
                const icon = playButton.querySelector('i');
                if (icon) icon.className = 'fas fa-play';
                
                // Show poster again
                if (video.dataset.poster) {
                    video.setAttribute('poster', video.dataset.poster);
                }
            }
        });
        
        // Add hover functionality for play/pause button visibility
        let hideTimeout;
        card.addEventListener('mouseenter', () => {
            // Always show play button on hover, regardless of play state
            clearTimeout(hideTimeout);
            const playButton = card.querySelector('.play-button');
            if (playButton) {
                playButton.style.opacity = '1';
                playButton.style.transform = 'translate(-50%, -50%) scale(1.2)';  // Slightly enlarge on hover
                playButton.style.backgroundColor = 'rgba(209, 246, 2, 0.3)';  // Brighter background
            }
        });

        card.addEventListener('mouseleave', () => {
            const playButton = card.querySelector('.play-button');
            if (playButton) {
                playButton.style.transform = 'translate(-50%, -50%) scale(1)';
                playButton.style.backgroundColor = 'rgba(209, 246, 2, 0.2)';
                
                // Only auto-hide if video is playing
                if (!video.paused) {
                    hideTimeout = setTimeout(() => {
                        playButton.style.opacity = '0';
                    }, 2000);
                }
            }
        });
        
        // Test if video is actually playable on this card
        video.addEventListener('canplay', () => {
            console.log(`Video can play: ${video.src}`);
            card.classList.add('video-can-play');
            // Remove any error state
            card.classList.remove('video-error');
            const errorMsg = card.querySelector('.video-error-message');
            if (errorMsg) errorMsg.remove();
        });
    });
    
    // Helper function to play video with sound - completely revised for reliability
    function playVideoWithSound(video, card) {
        if (!video || !card) {
            console.error("Invalid video or card provided to playVideoWithSound");
            return;
        }
        
        console.log("Attempting to play video:", video.src);
        console.log("Current poster:", video.getAttribute('poster'));
        
        // Critical: Make sure video is visible BEFORE playing
        video.style.display = 'block';
        video.style.opacity = '1';
        video.style.visibility = 'visible';
        
        // Reset video if needed
        if (video.currentTime >= video.duration - 0.1) {
            video.currentTime = 0;
        }
        
        // Set up video for playback
        video.muted = false;
        
        // Store poster again just to be safe
        if (video.hasAttribute('poster') && !video.dataset.poster) {
            video.dataset.poster = video.getAttribute('poster');
            console.log("Stored poster from attribute:", video.dataset.poster);
        }
        
        // Force user interaction flag for autoplay policies
        document.documentElement.classList.add('user-interaction');
        
        // Play with catch for errors
        video.play()
            .then(() => {
                console.log("▶️ Video playing successfully!");
                card.classList.add('playing');
                
                // Update play button to show pause icon
                const playButton = card.querySelector('.play-button');
                if (playButton) {
                    const icon = playButton.querySelector('i');
                    if (icon) icon.className = 'fas fa-pause';
                    
                    // Show the button initially, fade out after delay if not hovering
                    playButton.style.opacity = '1';
                    
                    if (!card.matches(':hover')) {
                        setTimeout(() => {
                            if (card.classList.contains('playing')) {
                                playButton.style.opacity = '0';
                            }
                        }, 2000);
                    }
                }
            })
            .catch(error => {
                console.error("❌ Error playing video:", error);
                
                // Try with muted as fallback (common browser restriction)
                console.log("Trying muted playback as fallback...");
                video.muted = true;
                
                video.play()
                    .then(() => {
                        console.log("🔇 Video playing (muted)");
                        card.classList.add('playing');
                        
                        // Note: Removed muted indicator UI as requested
                    })
                    .catch(finalError => {
                        console.error("⛔ Final play error:", finalError);
                        // Restore poster on complete failure
                        if (video.dataset.poster) {
                            video.setAttribute('poster', video.dataset.poster);
                        }
                    });
            });
    }
    
    // Helper functions for hover controls
    function hideHoverControls(card) {
        const controls = card.querySelector('.video-hover-controls');
        if (controls) controls.style.opacity = '0';
    }
    
    function showHoverControls(card) {
        const controls = card.querySelector('.video-hover-controls');
        if (controls) controls.style.opacity = '1';
    }
    
    // Position all cards based on current index - core animation function
    function positionCards(activeIndex) {
        if (isAnimating) return;
        isAnimating = true;
        
        const totalCards = validVideoCards.length;
        const visualIndex = ((activeIndex % totalCards) + totalCards) % totalCards;
        currentIndex = visualIndex;

        console.log("Positioning cards, active index:", visualIndex);

        // IMPORTANT: Force all videos to display their thumbnails first
        validVideoCards.forEach((card) => {
            const video = card.querySelector('video');
            if (video) {
                // Ensure poster is set for all videos
                if (video.hasAttribute('poster')) {
                    const posterSrc = video.getAttribute('poster');
                    video.setAttribute('poster', posterSrc);
                } else if (video.dataset.poster) {
                    video.setAttribute('poster', video.dataset.poster);
                }
            }
        });

        // Only after ensuring all posters are visible, start positioning
        setTimeout(() => {
            // Position each card with transforms
            validVideoCards.forEach((card, index) => {
                // Calculate multiple offsets to create infinite effect
                let offset = index - visualIndex;
                
                // Adjust offset to create the illusion of infinite cards
                if (offset > totalCards / 2) {
                    offset -= totalCards;
                } else if (offset < -totalCards / 2) {
                    offset += totalCards;
                }
                
                // Basic card positioning
                card.style.position = 'absolute';
                
                // Use consistent card width + spacing for accurate positioning
                // Card width is 270px, plus some spacing between cards
                const CARD_WIDTH_WITH_SPACING = 280; // Width + spacing
                
                if (offset === 0) {
                    // Center card - position directly in the center
                    card.style.left = '50%';
                    card.style.transform = `translateX(-50%) translateY(-50%) scale(1.05)`;
                    card.style.opacity = 1;
                    card.style.zIndex = 100;
                    card.style.display = 'block';
                    card.style.visibility = 'visible';
                    card.style.pointerEvents = 'auto';
                } else {
                    // Show exactly 7 cards total (3 on each side of center)
                    const isVisible = Math.abs(offset) <= 3; // Show only 3 cards on each side
                    
                    // Keep adjacent cards larger for better visibility
                    const scale = Math.max(0.85, 0.95 - (Math.abs(offset) * 0.04));
                    
                    // Keep adjacent cards more visible
                    const opacity = Math.max(0.7, 0.95 - (Math.abs(offset) * 0.1));
                    
                    // Adjust spacing for cleaner layout with exactly 7 cards
                    const CARD_SPACING = 300; // Proper spacing to fit exactly 7 cards without overlap
                    const xPosition = offset * CARD_SPACING;
                    
                    if (isVisible) {
                        // Make cards visible with proper transform
                        card.style.display = 'block';
                        card.style.visibility = 'visible';
                        card.style.pointerEvents = 'auto';
                        card.style.left = '50%';
                        card.style.transform = `translateX(calc(-50% + ${xPosition}px)) translateY(-50%) scale(${scale})`;
                        card.style.opacity = opacity;
                        card.style.zIndex = 100 - Math.abs(offset);
                        
                        // Ensure play button is always visible for all cards
                        const playButton = card.querySelector('.play-button');
                        if (playButton) {
                            playButton.style.opacity = '1';
                            playButton.style.display = 'flex';
                            playButton.style.pointerEvents = 'auto';
                        }
                    } else {
                        // Position offscreen cards
                        card.style.left = '50%';
                        card.style.transform = `translateX(calc(-50% + ${xPosition}px)) translateY(-50%) scale(${scale})`;
                        card.style.opacity = 0;
                        card.style.visibility = 'hidden';
                        card.style.pointerEvents = 'none';
                    }
                }
                
                // Update active state
                if (index === visualIndex) {
                    card.classList.add('active');
                    
                    // Check if we should autoplay based on user activity
                    if (userInitiatedPlayback) {
                        const video = card.querySelector('video');
                        if (video) {
                            // Slight delay to ensure smooth transition
                            setTimeout(() => {
                                playVideoWithSound(video, card);
                            }, 300);
                        }
                    } else {
                        // Just show play button if user hasn't initiated playback yet
                        const playButton = card.querySelector('.play-button');
                        if (playButton) {
                            // Ensure play icon is shown
                            const icon = playButton.querySelector('i');
                            if (icon) icon.className = 'fas fa-play';
                            
                            // Make play button fully visible
                            playButton.style.opacity = '1';
                        }
                    }
                } else {
                    card.classList.remove('active');
                    card.classList.remove('playing');
                    
                    // Always pause and reset non-active videos
                    const video = card.querySelector('video');
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                        video.classList.remove('playing');
                        
                        // Ensure non-active videos always show their poster
                        if (video.dataset.poster) {
                            video.setAttribute('poster', video.dataset.poster);
                        }
                    }
                }
            });

            // Reset animation flag after transition completes
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }, 50);
    }
    
    // Navigation buttons
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAnimating) return;
        
        document.documentElement.classList.add('user-interaction');
        
        // Ensure all thumbnails are visible before navigating
        validVideoCards.forEach(card => {
            const video = card.querySelector('video');
            if (video && video.dataset.poster) {
                video.setAttribute('poster', video.dataset.poster);
            }
        });
        
        // Update and animate without bounds checking
        positionCards(currentIndex - 1);
        
        prevBtn.classList.add('clicked');
        setTimeout(() => prevBtn.classList.remove('clicked'), 400);
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAnimating) return;
        
        document.documentElement.classList.add('user-interaction');
        
        // Ensure all thumbnails are visible before navigating
        validVideoCards.forEach(card => {
            const video = card.querySelector('video');
            if (video && video.dataset.poster) {
                video.setAttribute('poster', video.dataset.poster);
            }
        });
        
        // Update and animate without bounds checking
        positionCards(currentIndex + 1);
        
        nextBtn.classList.add('clicked');
        setTimeout(() => nextBtn.classList.remove('clicked'), 400);
    });

    // Touch swipe for mobile - update for infinite scroll
    videoContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        
        // Set user-interaction flag for autoplay on mobile
        document.documentElement.classList.add('user-interaction');
    }, { passive: true });
    
    videoContainer.addEventListener('touchend', e => {
        if (isAnimating) return;
        
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > 50) {
            // Pause any playing video
            const activeVideo = validVideoCards[currentIndex].querySelector('video');
            if (activeVideo && !activeVideo.paused) {
                activeVideo.pause();
                validVideoCards[currentIndex].classList.remove('playing');
            }
            
            // Update without bounds checking
            positionCards(currentIndex + (swipeDistance < 0 ? 1 : -1));
        }
    }, { passive: true });
    
    // Initialize first layout
    validVideoCards[currentIndex].classList.add('active');
    
    // Force all thumbnails to be visible initially
    validVideoCards.forEach(card => {
        const video = card.querySelector('video');
        if (video && video.hasAttribute('poster')) {
            const posterPath = video.getAttribute('poster');
            video.dataset.poster = posterPath;
            video.setAttribute('poster', posterPath);
            console.log(`Initial poster set for video ${video.src}: ${posterPath}`);
        }
    });
    
    // Set user interaction flag on navigation button click
    document.querySelector('.carousel-btn.prev').addEventListener('click', () => {
        document.documentElement.classList.add('user-interaction');
    });
    
    // Set user interaction flag on any click
    document.addEventListener('click', () => {
        document.documentElement.classList.add('user-interaction');
    }, { once: true });
    
    // Position cards
    positionCards(currentIndex);
}

// FAQ accordion functionality
function initFaqAccordion() {
    // Function is empty as the event handlers are set in the DOMContentLoaded event
    console.log('FAQ accordion initialized');
}

// Service card animations
function initServiceCardAnimations() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.service-icon');
            if (icon) {
                icon.style.transform = 'translateY(-5px) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.service-icon');
            if (icon) {
                icon.style.transform = 'translateY(0) rotate(0)';
            }
        });
    });
}

// Intersection Observer for scroll animations
function initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Add specific animations to children based on section
                if (entry.target.classList.contains('services')) {
                    const cards = entry.target.querySelectorAll('.service-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('slide-up');
                        }, index * 100);
                    });
                }
                
                if (entry.target.classList.contains('how-it-works')) {
                    const steps = entry.target.querySelectorAll('.step');
                    steps.forEach((step, index) => {
                        setTimeout(() => {
                            step.classList.add('slide-in');
                        }, index * 200);
                    });
                }
                
                if (entry.target.classList.contains('faq')) {
                    const faqItems = entry.target.querySelectorAll('.faq-item');
                    faqItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('slide-up');
                        }, index * 100);
                    });
                }
                
                // Stop observing after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Create dummy videos for development
function createDummyVideos() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach((card, index) => {
        const video = card.querySelector('video');
        
        if (!video.src || video.src.includes('placeholder')) {
            // For development only: create a colored rectangle video
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext('2d');
            
            // Create gradient based on index
            const colors = [
                ['#7450dc', '#5462ff'],
                ['#5462ff', '#53f4a3'],
                ['#53f4a3', '#e93aa5'],
                ['#e93aa5', '#7450dc'],
                ['#5462ff', '#e93aa5']
            ];
            
            const colorIndex = index % colors.length;
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, colors[colorIndex][0]);
            gradient.addColorStop(1, colors[colorIndex][1]);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add text or icon to indicate it's a video
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '60px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Video ' + (index + 1), canvas.width / 2, canvas.height / 2);
            
            // Convert canvas to video source
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                video.src = url;
            });
        }
    });
}

// Call this if no real videos are available
window.addEventListener('load', () => {
    // Check if there are real videos, otherwise create placeholders
    const videos = document.querySelectorAll('.video-card video');
    let needsDummyVideos = false;
    
    videos.forEach(video => {
        if (!video.src || video.src.includes('placeholder')) {
            needsDummyVideos = true;
        }
    });
    
    if (needsDummyVideos) {
        createDummyVideos();
    }
});

// Parallax blob effect
function initParallaxEffect() {
    const blob1 = document.querySelector('.blob-shape');
    const blob2 = document.querySelector('.blob-shape-2');
    const heroSection = document.querySelector('.hero');
    
    if (!blob1 || !blob2 || !heroSection) return;
    
    heroSection.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Move blobs in opposite directions for parallax effect
        blob1.style.transform = `translate(${x * 30}px, ${y * 30}px) scale(1.05)`;
        blob2.style.transform = `translate(${-x * 30}px, ${-y * 30}px) scale(0.95)`;
    });
}

// Generate video thumbnails from gradients if posters are not available
function initVideoThumbnails() {
    // This function is no longer needed since we're using actual thumbnails
    console.log('Using actual video thumbnails');
}

// Debug function for video playback - call this from console if needed
window.debugVideos = function() {
    console.log("=== VIDEO DEBUG ===");
    
    // Enable debug mode visually
    document.documentElement.classList.add('video-debug');
    
    // Get all video elements
    const videos = document.querySelectorAll('video');
    console.log(`Found ${videos.length} video elements`);
    
    // Check each video
    videos.forEach((video, i) => {
        console.group(`Video #${i + 1}`);
        
        // Basic info
        console.log('Source:', video.src);
        console.log('Poster:', video.poster);
        console.log('Size:', video.videoWidth, 'x', video.videoHeight);
        console.log('Duration:', video.duration);
        console.log('Current time:', video.currentTime);
        console.log('Paused:', video.paused);
        console.log('Muted:', video.muted);
        console.log('Volume:', video.volume);
        console.log('Loop:', video.loop);
        console.log('Controls:', video.controls);
        console.log('Autoplay:', video.autoplay);
        console.log('PlaysinLine:', video.playsInline);
        console.log('Preload:', video.preload);
        console.log('Ready State:', video.readyState, 
            video.readyState === 0 ? '(HAVE_NOTHING)' : 
            video.readyState === 1 ? '(HAVE_METADATA)' : 
            video.readyState === 2 ? '(HAVE_CURRENT_DATA)' : 
            video.readyState === 3 ? '(HAVE_FUTURE_DATA)' : 
            video.readyState === 4 ? '(HAVE_ENOUGH_DATA)' : '');
        console.log('Network State:', video.networkState,
            video.networkState === 0 ? '(NETWORK_EMPTY)' : 
            video.networkState === 1 ? '(NETWORK_IDLE)' : 
            video.networkState === 2 ? '(NETWORK_LOADING)' : 
            video.networkState === 3 ? '(NETWORK_NO_SOURCE)' : '');
        console.log('Error:', video.error);
        
        // Test accessing the video directly in browser
        const directUrl = video.src;
        if (directUrl) {
            console.log('Test direct URL:', directUrl);
            // Create a link to open the video directly
            const linkToVideo = document.createElement('a');
            linkToVideo.href = directUrl;
            linkToVideo.target = '_blank';
            linkToVideo.textContent = 'Open video directly';
            linkToVideo.style.position = 'absolute';
            linkToVideo.style.top = '10px';
            linkToVideo.style.left = '10px';
            linkToVideo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            linkToVideo.style.color = 'white';
            linkToVideo.style.padding = '5px 10px';
            linkToVideo.style.borderRadius = '4px';
            linkToVideo.style.fontSize = '12px';
            linkToVideo.style.zIndex = '100';
            
            // Add the link to the video's parent
            if (video.parentElement) {
                video.parentElement.appendChild(linkToVideo);
            }
        }
        
        // Add play button directly on the video for testing
        const playTestBtn = document.createElement('button');
        playTestBtn.textContent = 'Test Play';
        playTestBtn.style.position = 'absolute';
        playTestBtn.style.bottom = '10px';
        playTestBtn.style.left = '10px';
        playTestBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        playTestBtn.style.color = 'white';
        playTestBtn.style.padding = '5px 10px';
        playTestBtn.style.borderRadius = '4px';
        playTestBtn.style.fontSize = '12px';
        playTestBtn.style.zIndex = '100';
        playTestBtn.style.cursor = 'pointer';
        
        playTestBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            console.log('Testing direct play...');
            video.muted = true; // Mute to ensure it can autoplay
            video.load();
            video.play().then(() => {
                console.log('Video plays successfully!');
            }).catch(err => {
                console.error('Video play error:', err);
            });
        });
        
        if (video.parentElement) {
            video.parentElement.appendChild(playTestBtn);
        }
        
        console.groupEnd();
    });
    
    // Check user interaction state
    console.log('User interaction registered:', document.documentElement.classList.contains('user-interaction'));
    
    // Manually trigger user interaction
    document.documentElement.classList.add('user-interaction');
    console.log('User interaction flag set');
    
    console.log("=== END DEBUG ===");
    
    // Return helpful message
    return "Debug mode activated. Check console for video details. Add ?debug=1 to URL to activate on page load.";
};

// Activate debug mode when URL has debug parameter
window.addEventListener('load', () => {
    if (window.location.search.includes('debug=1')) {
        setTimeout(() => {
            console.log('Auto-activating debug mode from URL parameter');
            window.debugVideos();
        }, 2000);
    }
}); 