// app.js

// Global variables to share between carousel and grid gallery
let currentCarouselIndex = 0;
let currentFilter = 'all';
let carouselItems = [];
let visibleCarouselItems = [];
let carouselElement = null;
let itemCount = 0;

// Global functions for carousel control
function updateCarousel() {
    if (!carouselElement || !visibleCarouselItems.length) return;
    pauseAllMedia();
    carouselElement.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    updateIndicators();
    
    // Show fullscreen button only on active slide
    const activeItem = visibleCarouselItems[currentCarouselIndex];
    carouselItems.forEach(item => {
        const btn = item.querySelector('.fullscreen-btn');
        if (btn) btn.style.display = item === activeItem ? 'block' : 'none';
    });
}

function pauseAllMedia() {
    if (!carouselItems.length) return;
    carouselItems.forEach(item => {
        const video = item.querySelector('video');
        if (video && !video.paused) {
            video.pause();
        }
    });
}

function getMediaSource(node) {
    if (!node) return '';
    if (node.tagName === 'IMG') return node.src;
    if (node.tagName === 'VIDEO') {
        if (node.currentSrc) return node.currentSrc;
        const sourceElement = node.querySelector('source');
        return sourceElement ? sourceElement.src : node.src || '';
    }
    if (node.tagName === 'SOURCE') return node.src;
    return '';
}

function getFilterType(item) {
    if (!item) return 'all';
    if (item.tagName === 'IMG') return 'images';
    if (item.tagName === 'VIDEO') return 'videos';
    if (item.querySelector && item.querySelector('video')) return 'videos';
    if (item.querySelector && item.querySelector('img')) return 'images';
    return 'all';
}

function applyFilter(filter = currentFilter) {
    currentFilter = filter;
    const filterType = filter === 'all' ? 'all' : filter;

    const gridItems = document.querySelectorAll('.gallery img, .gallery video');
    gridItems.forEach((item) => {
        const type = getFilterType(item);
        const shouldShow = filterType === 'all' || type === filterType;
        item.classList.toggle('hidden', !shouldShow);
    });

    carouselItems.forEach((item) => {
        const type = getFilterType(item);
        const shouldShow = filterType === 'all' || type === filterType;
        item.classList.toggle('hidden', !shouldShow);
    });

    visibleCarouselItems = Array.from(carouselItems).filter(item => !item.classList.contains('hidden'));
    itemCount = visibleCarouselItems.length;
    if (currentCarouselIndex >= itemCount) {
        currentCarouselIndex = 0;
    }

    updateCarousel();
}

function updateIndicators() {
    const indicatorsContainer = document.getElementById('indicators');
    if (!indicatorsContainer) return;

    const indicators = indicatorsContainer.querySelectorAll('.indicator');
    const totalVisibleSlides = visibleCarouselItems.length;

    if (!totalVisibleSlides) {
        indicators.forEach((ind) => {
            ind.style.display = 'none';
            ind.classList.remove('active');
            ind.setAttribute('aria-label', '');
        });
        return;
    }

    if (currentCarouselIndex >= totalVisibleSlides) {
        currentCarouselIndex = 0;
    }

    let startSlide = Math.max(0, currentCarouselIndex - 4);
    let endSlide = Math.min(totalVisibleSlides - 1, startSlide + 8);

    if (endSlide - startSlide < 8) {
        startSlide = Math.max(0, endSlide - 8);
    }

    indicators.forEach((ind, indicatorIndex) => {
        const slideIndex = startSlide + indicatorIndex;
        const isVisible = slideIndex <= endSlide;
        const isActive = slideIndex === currentCarouselIndex;

        ind.style.display = isVisible ? 'block' : 'none';
        ind.classList.toggle('active', isActive);
        ind.setAttribute('aria-label', isVisible ? `Go to media ${slideIndex + 1}` : '');
    });
}

function goToSlide(index) {
    if (!visibleCarouselItems.length) return;
    currentCarouselIndex = Math.max(0, Math.min(index, visibleCarouselItems.length - 1));
    updateCarousel();
}

// Carousel Functionality
function initializeCarousel() {
    const carousel = document.getElementById('galleryCarousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('indicators');

    if (!carousel || !prevBtn || !nextBtn || !indicatorsContainer) return;

    carouselElement = carousel;
    carouselItems = carousel.querySelectorAll('.carousel-item');
    currentCarouselIndex = 0;

    // Add fullscreen buttons to each carousel item
    carouselItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'fullscreen-btn';
        btn.setAttribute('aria-label', 'Enter Fullscreen');
        btn.innerHTML = '⤢';
        item.appendChild(btn);
    });

    // Create 9 indicators for limited display
    const totalIndicators = 9;
    for (let i = 0; i < totalIndicators; i++) {
        const indicator = document.createElement('button');
        indicator.className = 'indicator';
        indicator.setAttribute('aria-label', `Go to media`);
        indicator.addEventListener('click', () => {
            const indicatorIndex = getIndicatorSlideIndex(i);
            if (indicatorIndex >= 0 && indicatorIndex < visibleCarouselItems.length) {
                goToSlide(indicatorIndex);
            }
        });
        indicatorsContainer.appendChild(indicator);
    }

    applyFilter('all');

    // Get the slide index for a given indicator position
    function getIndicatorSlideIndex(indicatorIndex) {
        const totalVisibleSlides = visibleCarouselItems.length;
        let startSlide = Math.max(0, currentCarouselIndex - 4);
        let endSlide = Math.min(totalVisibleSlides - 1, startSlide + 8);

        if (endSlide - startSlide < 8) {
            startSlide = Math.max(0, endSlide - 8);
        }

        return startSlide + indicatorIndex;
    }

    // Next slide
    function nextSlide() {
        if (!visibleCarouselItems.length) return;
        currentCarouselIndex = (currentCarouselIndex + 1) % visibleCarouselItems.length;
        updateCarousel();
    }

    // Previous slide
    function prevSlide() {
        if (!visibleCarouselItems.length) return;
        currentCarouselIndex = (currentCarouselIndex - 1 + visibleCarouselItems.length) % visibleCarouselItems.length;
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

    // Fullscreen functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('fullscreen-btn')) {
            const item = e.target.closest('.carousel-item');
            const media = item.querySelector('img, video');
            if (media && document.fullscreenEnabled) {
                media.requestFullscreen().catch(console.error);
            }
        }
    });

    // Handle fullscreen exit button
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            // Add exit button
            const exitBtn = document.createElement('button');
            exitBtn.className = 'fullscreen-exit-btn';
            exitBtn.innerHTML = '✕';
            exitBtn.style.position = 'fixed';
            exitBtn.style.top = '10px';
            exitBtn.style.right = '10px';
            exitBtn.style.zIndex = '9999';
            exitBtn.style.background = 'rgba(0, 0, 0, 0.5)';
            exitBtn.style.color = 'white';
            exitBtn.style.border = 'none';
            exitBtn.style.width = '40px';
            exitBtn.style.height = '40px';
            exitBtn.style.borderRadius = '50%';
            exitBtn.style.cursor = 'pointer';
            exitBtn.style.fontSize = '18px';
            exitBtn.style.display = 'flex';
            exitBtn.style.alignItems = 'center';
            exitBtn.style.justifyContent = 'center';
            exitBtn.setAttribute('aria-label', 'Exit Fullscreen');
            exitBtn.addEventListener('click', () => document.exitFullscreen());
            document.body.appendChild(exitBtn);
            window.fullscreenExitBtn = exitBtn;
        } else {
            // Remove exit button
            if (window.fullscreenExitBtn) {
                window.fullscreenExitBtn.remove();
                window.fullscreenExitBtn = null;
            }
        }
    });
}

function initializeGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons.length) return;

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            applyFilter(filter);
            filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
        });
    });
}

// Grid Gallery Click to Update Carousel
function initializeGridGallery() {
    const gridItems = document.querySelectorAll('.gallery img, .gallery video');

    if (!gridItems.length || !carouselItems.length) return;

    gridItems.forEach((gridItem) => {
        gridItem.addEventListener('click', () => {
            const targetSource = getMediaSource(gridItem);
            const matchingCarouselIndex = visibleCarouselItems.findIndex(carouselItem => {
                const carouselImage = carouselItem.querySelector('img');
                const carouselVideo = carouselItem.querySelector('video');
                const carouselSource = carouselImage ? getMediaSource(carouselImage) : getMediaSource(carouselVideo);
                return carouselSource === targetSource;
            });

            if (matchingCarouselIndex !== -1) {
                goToSlide(matchingCarouselIndex);
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
        const businessEmail = 'ashtay743@gmail.com'; // Business email address
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
        initializeGalleryFilter();
    }

    if (document.querySelector('form')) {
        initializeContactForm();
    }
});