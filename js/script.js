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

// ========== NEW WEDDING GALLERY (BOOTSTRAP 5 CAROUSEL) ==========
(function() {
    function loadGalleryImages() {
        return new Promise((resolve) => {
            let testIndex = 1;
            let foundImages = [];
            function tryNext() {
                const imgPath = `assets/images/gallery-${testIndex}.webp`;
                const imgTest = new Image();
                imgTest.onload = () => {
                    foundImages.push(imgPath);
                    testIndex++;
                    tryNext();
                };
                imgTest.onerror = () => {
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
                };
                imgTest.src = imgPath;
                if (testIndex > 12) {
                    if (foundImages.length === 0) {
                        resolve([
                            'https://picsum.photos/id/104/1365/1365',
                            'https://picsum.photos/id/30/1365/1365',
                            'https://picsum.photos/id/58/1365/1365',
                            'https://picsum.photos/id/26/1365/1365'
                        ]);
                    } else {
                        resolve(foundImages);
                    }
                }
            }
            tryNext();
        });
    }

    const stage = document.getElementById('prenupStage');
    if (!stage) return;

    let currentIndex = 0;
    let slidesData = [];
    let slideElements = [];
    let autoInterval;
    const totalSpan = document.getElementById('totalNumOverlay');
    const currentSpan = document.getElementById('currentNumOverlay');
    const dotsContainer = document.getElementById('prenupDots');
    const prevBtn = document.getElementById('prenupPrevBtn');
    const nextBtn = document.getElementById('prenupNextBtn');

    function createSlides(images) {
        stage.innerHTML = '';
        const overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        stage.appendChild(overlay);
        
        images.forEach((src, idx) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            if (idx === 0) slide.classList.add('active');
            else if (idx === 1) slide.classList.add('next');
            else slide.classList.add('hidden');
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Prenup photo ${idx+1}`;
            img.loading = 'lazy';
            slide.appendChild(img);
            stage.appendChild(slide);
            slideElements.push(slide);
        });
    }

    function getClassForIndex(idx) {
        if (idx === currentIndex) return 'slide active';
        if (idx === (currentIndex - 1 + slidesData.length) % slidesData.length) return 'slide prev';
        if (idx === (currentIndex + 1) % slidesData.length) return 'slide next';
        return 'slide hidden';
    }

    function updateUI() {
        slideElements.forEach((el, i) => {
            el.className = getClassForIndex(i);
        });
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            if (i === currentIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
        if (currentSpan) currentSpan.textContent = String(currentIndex + 1).padStart(2, '0');
        if (totalSpan) totalSpan.textContent = String(slidesData.length).padStart(2, '0');
    }

    function goToSlide(index) {
        if (!slidesData.length) return;
        if (index === currentIndex) return;
        currentIndex = (index + slidesData.length) % slidesData.length;
        updateUI();
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        slidesData.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === currentIndex ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function initGallery(images) {
        slidesData = images;
        if (!slidesData.length) return;
        createSlides(slidesData);
        buildDots();
        updateUI();

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); }
        });

        let touchStartX = 0;
        stage.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        stage.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 50) {
                diff < 0 ? nextSlide() : prevSlide();
            }
        });

        function startAuto() { autoInterval = setInterval(nextSlide, 7000); }
        function stopAuto() { clearInterval(autoInterval); }
        startAuto();
        const container = document.querySelector('.gallery-wrap');
        if (container) {
            container.addEventListener('mouseenter', stopAuto);
            container.addEventListener('mouseleave', startAuto);
            container.addEventListener('touchstart', stopAuto, { passive: true });
            container.addEventListener('touchend', () => { stopAuto(); startAuto(); });
        }
    }

    loadGalleryImages().then(images => {
        initGallery(images);
    }).catch(() => {
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
    const submitBtn = document.getElementById('rsvpSubmitBtn');
    const msgDiv = document.getElementById('rsvpMessage');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const attendingInput = document.getElementById('attending');

            if (msgDiv) msgDiv.innerHTML = '';

            let error = '';
            if (!nameInput.value.trim()) {
                error = 'Please enter your name.';
            } else if (!emailInput.value.trim()) {
                error = 'Please enter your email address.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                error = 'Please enter a valid email address.';
            } else if (!attendingInput.value) {
                error = 'Please select whether you are attending.';
            }

            if (error) {
                msgDiv.innerHTML = `<div class="alert alert-danger">${error}</div>`;
                return;
            }

            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(rsvpForm);
            const data = new URLSearchParams(formData);

            try {
                const response = await fetch('/api/rsvp', {
                    method: 'POST',
                    body: data,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                const result = await response.json();

                if (result.success) {
                    msgDiv.innerHTML = '<div class="alert alert-success">Thank you! Your RSVP has been saved.</div>';
                    rsvpForm.reset();
                    const selectedDiv = document.querySelector('.dropdown-selected');
                    if (selectedDiv) selectedDiv.innerText = 'Select an option';
                    const hiddenAttend = document.getElementById('attending');
                    if (hiddenAttend) hiddenAttend.value = '';
                    document.querySelectorAll('.dropdown-option').forEach(o => o.classList.remove('selected'));
                } else {
                    msgDiv.innerHTML = `<div class="alert alert-danger">${result.error || 'Something went wrong. Please try again.'}</div>`;
                }
            } catch (err) {
                console.error('RSVP error:', err);
                msgDiv.innerHTML = '<div class="alert alert-danger">Network error. Please check your connection and try again.</div>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
})();

// ========== SAKURA PETALS ANIMATION (single global set) ==========
(function() {
    const petalContainer = document.querySelector('.sakura-petals');
    if (!petalContainer) return;
    
    const isMobile = window.innerWidth <= 768;
    const sizeFactor = isMobile ? 0.28 : 1.0;
    
    const petalImages = [
        'assets/images/sakura-petal.webp',
        'assets/images/sakura-petal1.webp',
        'assets/images/sakura-petal2.webp'
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

// ========== LOVE STORY LIGHTBOX (with WebP fallback) ==========
(function() {
    const lightbox = document.getElementById('loveLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    const loveCards = document.querySelectorAll('.love-card');
    let currentImageIndex = 0;
    let imagesArray = [];
    let captionsArray = [];
    
    loveCards.forEach((card, idx) => {
        const img = card.querySelector('.love-img img');
        const title = card.querySelector('.love-caption h4')?.innerText || '';
        const date = card.querySelector('.love-date')?.innerText || '';
        const fullCaption = `${title} — ${date}`;
        
        imagesArray.push(img.src);
        captionsArray.push(fullCaption);
        
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
        document.body.style.overflow = 'hidden';
    }
    
    function updateLightboxImage() {
        if (lightboxImg && imagesArray[currentImageIndex]) {
            const originalSrc = imagesArray[currentImageIndex];
            lightboxImg.src = originalSrc;
            // Fallback: if WebP fails, try .jpg
            lightboxImg.onerror = function() {
                if (originalSrc.endsWith('.webp')) {
                    this.src = originalSrc.replace('.webp', '.jpg');
                }
            };
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
    
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
})();