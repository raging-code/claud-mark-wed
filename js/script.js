// ========== AUDIO PLAYER ==========
const audio = document.getElementById('themeAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const seekSlider = document.getElementById('seekSlider');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');

let isPlaying = false;
let isMuted = false;

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateProgress() {
    if (!isNaN(audio.duration)) {
        seekSlider.value = audio.currentTime / audio.duration;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    }
}

audio.addEventListener('loadedmetadata', () => {
    durationSpan.textContent = formatTime(audio.duration);
    seekSlider.max = 1;
    seekSlider.value = 0;
});

audio.addEventListener('timeupdate', updateProgress);

if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(e => console.log("Audio play error:", e));
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        }
    });
}

if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        isMuted = audio.muted;
        muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });
}

if (seekSlider) {
    seekSlider.addEventListener('input', (e) => {
        const seekTime = e.target.value * audio.duration;
        audio.currentTime = seekTime;
    });
}

audio.addEventListener('ended', () => {
    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
});

// ========== LIQUID MORPH GALLERY (1:1 SQUARE, 1365x1365 optimized) ==========
(function() {
    // Array of high-res square images (1:1) – replace with your own 1365x1365 images
    // Auto-detects local gallery-1.jpg, gallery-2.jpg, etc. up to 10
    let slides = [];
    
    // Try to load local square images (assets/images/gallery-1.jpg, etc.)
    // Fallback to beautiful unsplash square placeholders if none found
    function loadImageSet() {
        return new Promise((resolve) => {
            let testIndex = 1;
            let foundImages = [];
            
            function tryNext() {
                const imgPath = `assets/images/gallery-${testIndex}.jpg`;
                const imgTest = new Image();
                imgTest.onload = () => {
                    foundImages.push(imgPath);
                    testIndex++;
                    tryNext();
                };
                imgTest.onerror = () => {
                    if (foundImages.length === 0) {
                        // Fallback square placeholders (1:1)
                        resolve([
                            'https://picsum.photos/id/104/1365/1365',
                            'https://picsum.photos/id/30/1365/1365',
                            'https://picsum.photos/id/58/1365/1365',
                            'https://picsum.photos/id/26/1365/1365',
                            'https://picsum.photos/id/42/1365/1365',
                            'https://picsum.photos/id/20/1365/1365'
                        ]);
                    } else {
                        resolve(foundImages);
                    }
                };
                imgTest.src = imgPath;
                if (testIndex > 12) { // safety limit
                    if (foundImages.length === 0) {
                        resolve([
                            'https://picsum.photos/id/104/1365/1365',
                            'https://picsum.photos/id/30/1365/1365',
                            'https://picsum.photos/id/58/1365/1365',
                            'https://picsum.photos/id/26/1365/1365',
                            'https://picsum.photos/id/42/1365/1365'
                        ]);
                    } else {
                        resolve(foundImages);
                    }
                }
            }
            tryNext();
        });
    }
    
    const stage = document.getElementById('liquidStage');
    if (!stage) return;
    
    const currentSpan = document.getElementById('currentIdx');
    const totalSpan = document.getElementById('totalSlides');
    const timelineContainer = document.getElementById('timelineContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    let currentIndex = 0;
    let layers = [];
    let autoInterval;
    let slidesData = [];
    
    function createLayers() {
        for (let i = 0; i < 2; i++) {
            const layer = document.createElement('div');
            layer.className = 'liquid-layer';
            if (i === 0) {
                layer.classList.add('active');
                layer.style.opacity = '1';
                layer.style.zIndex = '2';
            } else {
                layer.style.opacity = '0';
                layer.style.zIndex = '1';
            }
            const img = document.createElement('img');
            img.className = 'liquid-img';
            img.alt = 'Prenup photo';
            img.loading = 'lazy';
            layer.appendChild(img);
            const overlay = stage.querySelector('.photo-overlay');
            stage.insertBefore(layer, overlay);
            layers.push({ layer, img });
        }
    }
    
    function renderTimeline() {
        if (!timelineContainer) return;
        timelineContainer.innerHTML = '';
        slidesData.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = 'timeline-dot' + (idx === currentIndex ? ' active' : '');
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(idx);
            });
            timelineContainer.appendChild(dot);
        });
    }
    
    function updateUI() {
        if (currentSpan) currentSpan.textContent = currentIndex + 1;
        if (totalSpan) totalSpan.textContent = slidesData.length;
        const dots = timelineContainer.querySelectorAll('.timeline-dot');
        dots.forEach((dot, i) => {
            if (i === currentIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
    
    function goToSlide(index) {
        if (!slidesData.length) return;
        if (index === currentIndex) return;
        const targetIndex = (index + slidesData.length) % slidesData.length;
        const activeLayer = layers.find(l => l.layer.classList.contains('active'));
        const inactiveLayer = layers.find(l => !l.layer.classList.contains('active'));
        
        inactiveLayer.img.src = slidesData[targetIndex];
        // crossfade
        activeLayer.layer.style.opacity = '0';
        inactiveLayer.layer.style.opacity = '1';
        activeLayer.layer.classList.remove('active');
        inactiveLayer.layer.classList.add('active');
        
        setTimeout(() => {
            activeLayer.layer.style.zIndex = '1';
            inactiveLayer.layer.style.zIndex = '2';
        }, 50);
        
        currentIndex = targetIndex;
        updateUI();
        
        // preload next image into the inactive layer
        const nextIdx = (currentIndex + 1) % slidesData.length;
        const futureInactive = layers.find(l => !l.layer.classList.contains('active'));
        if (futureInactive) futureInactive.img.src = slidesData[nextIdx];
    }
    
    function nextSlide() { goToSlide((currentIndex + 1) % slidesData.length); }
    function prevSlide() { goToSlide((currentIndex - 1 + slidesData.length) % slidesData.length); }
    
    function initGallery(imagesArray) {
        slidesData = imagesArray;
        if (!slidesData.length) return;
        
        createLayers();
        renderTimeline();
        updateUI();
        
        // set initial images
        layers[0].img.src = slidesData[0];
        if (slidesData[1]) layers[1].img.src = slidesData[1];
        else layers[1].img.src = slidesData[0];
        
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        // keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
        });
        
        // touch swipe
        let touchStartX = 0;
        stage.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        stage.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) {
                diff < 0 ? nextSlide() : prevSlide();
            }
        });
        
        // auto-rotate
        function startAuto() { autoInterval = setInterval(nextSlide, 6000); }
        function stopAuto() { clearInterval(autoInterval); }
        startAuto();
        const container = document.querySelector('.liquid-morph-container');
        if (container) {
            container.addEventListener('mouseenter', stopAuto);
            container.addEventListener('mouseleave', startAuto);
            container.addEventListener('touchstart', stopAuto, { passive: true });
            container.addEventListener('touchend', () => { stopAuto(); startAuto(); });
        }
    }
    
    loadImageSet().then(images => {
        initGallery(images);
    }).catch(() => {
        // ultimate fallback
        initGallery([
            'https://picsum.photos/id/104/1365/1365',
            'https://picsum.photos/id/30/1365/1365',
            'https://picsum.photos/id/58/1365/1365',
            'https://picsum.photos/id/26/1365/1365'
        ]);
    });
})();

// ========== RSVP DROPDOWN & FORM HANDLER ==========
(function() {
    const dropdown = document.getElementById('attendingDropdown');
    if (dropdown) {
        const selectedDiv = dropdown.querySelector('.dropdown-selected');
        const optionsDiv = dropdown.querySelector('.dropdown-options');
        const hiddenInput = document.getElementById('attending');
        const options = dropdown.querySelectorAll('.dropdown-option');

        if (selectedDiv) {
            selectedDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                if (optionsDiv) optionsDiv.classList.toggle('show');
                selectedDiv.classList.toggle('open');
            });
        }

        options.forEach(opt => {
            opt.addEventListener('click', function(e) {
                const value = this.getAttribute('data-value');
                const text = this.innerText;
                if (selectedDiv) selectedDiv.innerText = text;
                if (hiddenInput) hiddenInput.value = value;
                if (optionsDiv) optionsDiv.classList.remove('show');
                if (selectedDiv) selectedDiv.classList.remove('open');
                options.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                if (optionsDiv) optionsDiv.classList.remove('show');
                if (selectedDiv) selectedDiv.classList.remove('open');
            }
        });
    }

    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const attendingValue = document.getElementById('attending')?.value || '';
            if (!attendingValue) {
                document.getElementById('rsvpMessage').innerHTML = '<div class="alert alert-danger">Please select an attendance option.</div>';
                return;
            }
            const formData = new FormData(this);
            try {
                const response = await fetch('rsvp/save_rsvp.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                const msgDiv = document.getElementById('rsvpMessage');
                if (result.success) {
                    msgDiv.innerHTML = '<div class="alert alert-success">Thank you! Your RSVP has been saved.</div>';
                    this.reset();
                    const selectedDiv = document.querySelector('.dropdown-selected');
                    if (selectedDiv) selectedDiv.innerText = 'Select an option';
                    const hiddenAttend = document.getElementById('attending');
                    if (hiddenAttend) hiddenAttend.value = '';
                    document.querySelectorAll('.dropdown-option').forEach(o => o.classList.remove('selected'));
                } else {
                    msgDiv.innerHTML = '<div class="alert alert-danger">Error: ' + (result.error || 'Something went wrong') + '</div>';
                }
            } catch (err) {
                document.getElementById('rsvpMessage').innerHTML = '<div class="alert alert-danger">Network error. Please try again.</div>';
            }
        });
    }
})();

// ========== SAKURA PETALS ANIMATION (preserved) ==========
(function() {
    const petalContainer = document.querySelector('.sakura-petals');
    if (!petalContainer) return;
    
    const isMobile = window.innerWidth <= 768;
    const sizeFactor = isMobile ? 0.4 : 1.0;
    
    const petalImages = [
        'assets/images/sakura-petal.png',
        'assets/images/sakura-petal1.png',
        'assets/images/sakura-petal2.png'
    ];
    const petalCount = 45;
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        const randomIndex = Math.floor(Math.random() * petalImages.length);
        const randomImage = petalImages[randomIndex];
        petal.style.backgroundImage = `url('${randomImage}')`;
        petal.style.backgroundSize = 'contain';
        petal.style.backgroundRepeat = 'no-repeat';
        petal.style.position = 'absolute';
        petal.style.pointerEvents = 'none';
        
        let minSize = 22, maxSize = 55;
        if (randomIndex === 0 || randomIndex === 1) {
            minSize = minSize * 1.5;
            maxSize = maxSize * 1.5;
        }
        let size = minSize + Math.random() * (maxSize - minSize);
        size = size * sizeFactor;
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        
        petal.style.left = Math.random() * 100 + '%';
        petal.style.top = -Math.random() * 40 + '%';
        
        const duration = 14 + Math.random() * 24;
        const delay = Math.random() * 20;
        const easing = ['linear', 'ease-in', 'ease-out', 'ease-in-out'][Math.floor(Math.random() * 4)];
        petal.style.animation = `fall ${duration}s ${easing} infinite`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.opacity = 0.3 + Math.random() * 0.5;
        petal.style.willChange = 'transform';
        if (Math.random() > 0.7) petal.style.filter = 'blur(0.5px)';
        
        petalContainer.appendChild(petal);
    }
    
    if (!document.querySelector('#petal-keyframes')) {
        const style = document.createElement('style');
        style.id = 'petal-keyframes';
        style.textContent = `@keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(720deg); } }`;
        document.head.appendChild(style);
    }
})();

// ========== LOVE STORY LIGHTBOX (FULLSCREEN) ==========
(function() {
    const lightbox = document.getElementById('loveLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    // Get all love story cards
    const loveCards = document.querySelectorAll('.love-card');
    let currentImageIndex = 0;
    let imagesArray = [];
    let captionsArray = [];
    
    // Build arrays from love story cards
    loveCards.forEach((card, idx) => {
        const img = card.querySelector('.love-img img');
        const title = card.querySelector('.love-caption h4')?.innerText || '';
        const date = card.querySelector('.love-date')?.innerText || '';
        const fullCaption = `${title} — ${date}`;
        imagesArray.push(img.src);
        captionsArray.push(fullCaption);
        
        // Add click event to each card's image area
        const imgWrapper = card.querySelector('.love-img');
        if (imgWrapper) {
            imgWrapper.style.cursor = 'pointer';
            imgWrapper.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImageIndex = idx;
                openLightbox(currentImageIndex);
            });
        }
    });
    
    function openLightbox(index) {
        if (!lightbox) return;
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent scrolling
    }
    
    function updateLightboxImage() {
        if (lightboxImg && imagesArray[currentImageIndex]) {
            lightboxImg.src = imagesArray[currentImageIndex];
            if (lightboxCaption) {
                lightboxCaption.textContent = captionsArray[currentImageIndex] || '';
            }
        }
    }
    
    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % imagesArray.length;
        updateLightboxImage();
    }
    
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + imagesArray.length) % imagesArray.length;
        updateLightboxImage();
    }
    
    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    
    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
})();