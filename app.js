// app.js

// Global variables to share between carousel and grid gallery
let currentCarouselIndex = 0;
let carouselItems = [];
let carouselElement = null;
let itemCount = 0;

// Global functions for carousel control
function updateCarousel() {
    if (!carouselElement) return;
    carouselElement.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    updateIndicators();
}

function updateIndicators() {
    const indicatorsContainer = document.getElementById('indicators');
    if (!indicatorsContainer) return;

    const indicators = indicatorsContainer.querySelectorAll('.indicator');

    // Calculate the range of slides to show in indicators
    let startSlide = Math.max(0, currentCarouselIndex - 4);
    let endSlide = Math.min(itemCount - 1, startSlide + 8);

    // Adjust start if we're near the end
    if (endSlide - startSlide < 8) {
        startSlide = Math.max(0, endSlide - 8);
    }

    // Update each indicator
    indicators.forEach((ind, indicatorIndex) => {
        const slideIndex = startSlide + indicatorIndex;
        const isVisible = slideIndex <= endSlide;
        const isActive = slideIndex === currentCarouselIndex;

        ind.style.display = isVisible ? 'block' : 'none';
        ind.classList.toggle('active', isActive);
        ind.setAttribute('aria-label', isVisible ? `Go to image ${slideIndex + 1}` : '');
    });
}

function goToSlide(index) {
    currentCarouselIndex = index;
    updateCarousel();
}

// Carousel Functionality
function initializeCarousel() {
    const carousel = document.getElementById('galleryCarousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('indicators');

    if (!carousel || !prevBtn || !nextBtn) return;

    carouselElement = carousel;
    carouselItems = carousel.querySelectorAll('.carousel-item');
    itemCount = carouselItems.length;
    currentCarouselIndex = 0;

    // Create 9 indicators for limited display
    const totalIndicators = 9;
    for (let i = 0; i < totalIndicators; i++) {
        const indicator = document.createElement('button');
        indicator.className = 'indicator';
        indicator.setAttribute('aria-label', `Go to image`);
        indicator.addEventListener('click', () => {
            // Calculate which slide this indicator represents
            const indicatorIndex = getIndicatorSlideIndex(i);
            if (indicatorIndex >= 0 && indicatorIndex < itemCount) {
                goToSlide(indicatorIndex);
            }
        });
        indicatorsContainer.appendChild(indicator);
    }

    // Initialize indicators for the starting position
    updateIndicators();

    // Get the slide index for a given indicator position
    function getIndicatorSlideIndex(indicatorIndex) {
        let startSlide = Math.max(0, currentCarouselIndex - 4);
        let endSlide = Math.min(itemCount - 1, startSlide + 8);

        if (endSlide - startSlide < 8) {
            startSlide = Math.max(0, endSlide - 8);
        }

        return startSlide + indicatorIndex;
    }

    // Next slide
    function nextSlide() {
        currentCarouselIndex = (currentCarouselIndex + 1) % itemCount;
        updateCarousel();
    }

    // Previous slide
    function prevSlide() {
        currentCarouselIndex = (currentCarouselIndex - 1 + itemCount) % itemCount;
        updateCarousel();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });
}

// Grid Gallery Click to Update Carousel
function initializeGridGallery() {
    const gridImages = document.querySelectorAll('.gallery img');

    if (!gridImages.length || !carouselItems.length) return;

    gridImages.forEach((gridImg) => {
        gridImg.addEventListener('click', () => {
            // Find the matching carousel image by src
            const matchingCarouselIndex = Array.from(carouselItems).findIndex(carouselItem => {
                const carouselImg = carouselItem.querySelector('img');
                return carouselImg && carouselImg.src === gridImg.src;
            });

            if (matchingCarouselIndex !== -1) {
                // Update carousel to the matching slide
                goToSlide(matchingCarouselIndex);
                
                // Scroll to the carousel container
                const carouselContainer = document.querySelector('.carousel-container');
                if (carouselContainer) {
                    carouselContainer.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        });
    });
}

// Contact Form Email Functionality
function initializeContactForm() {
    const contactForm = document.querySelector('form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const messageType = document.getElementById('messageType').value;
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }

        // Get current date and time
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const formattedDate = `${day}/${month}/${year}`;
        const formattedTime = `${hours}:${minutes}`;

        // Create subject: [MessageType] - Name - DD/MM/YYYY HH:MM
        const subject = `${messageType.charAt(0).toUpperCase() + messageType.slice(1)} - ${name} - ${formattedDate} ${formattedTime}`;

        // Create email body with sender information
        const emailBody = `${message}\n\nFrom: ${name} <${email}>`;

        // Create mailto link
        const businessEmail = 'contact@ansbounce.com'; // Business email address
        const mailtoLink = `mailto:${businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

        // Open email client
        window.location.href = mailtoLink;
    });
}

// Initialize appropriate functionality based on current page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page Loaded!');

    // Check which page we're on and initialize appropriate functionality
    if (document.getElementById('galleryCarousel')) {
        initializeCarousel();
        initializeGridGallery();
    }

    if (document.querySelector('form')) {
        initializeContactForm();
    }
});