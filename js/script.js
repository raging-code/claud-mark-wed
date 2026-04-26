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

// ========== GALLERY BUILDER (reusable) ==========
function createGallery(galleryId, imagePrefixes) {
    const stage = document.getElementById(galleryId + 'Stage');
    const thumbsRow = document.getElementById(galleryId + 'ThumbsRow');
    const prevBtn = document.getElementById(galleryId + 'PrevBtn');
    const nextBtn = document.getElementById(galleryId + 'NextBtn');
    if (!stage || !thumbsRow) return;

    const landscapeIndices = [0, 1, 2, 3];
    const portraitIndices = [0, 1, 2, 3];

    async function loadImages() {
        const candidates = [];
        landscapeIndices.forEach(i => {
            const filename = i === 0 ? `${imagePrefixes.landscape}.webp` : `${imagePrefixes.landscape}${i}.webp`;
            candidates.push({ type: 'landscape', src: `assets/images/${filename}`, alt: `Landscape ${i+1}` });
        });
        portraitIndices.forEach(i => {
            const filename = i === 0 ? `${imagePrefixes.portrait}.webp` : `${imagePrefixes.portrait}${i}.webp`;
            candidates.push({ type: 'portrait', src: `assets/images/${filename}`, alt: `Portrait ${i+1}` });
        });

        const results = [];
        for (const c of candidates) {
            try {
                await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => reject();
                    img.src = c.src;
                });
                results.push(c);
            } catch (e) {
                // file doesn't exist, skip
            }
        }
        const combined = [];
        const landscapes = results.filter(r => r.type === 'landscape');
        const portraits = results.filter(r => r.type === 'portrait');
        const maxLen = Math.max(landscapes.length, portraits.length);
        for (let i = 0; i < maxLen; i++) {
            if (i < landscapes.length) combined.push({ src: landscapes[i].src, alt: landscapes[i].alt });
            if (i < portraits.length) combined.push({ src: portraits[i].src, alt: portraits[i].alt });
        }
        if (combined.length === 0) {
            combined.push({ src: 'https://picsum.photos/id/42/1200/960', alt: 'Fallback' });
        }
        return combined;
    }

    async function init() {
        const imagesData = await loadImages();
        stage.querySelectorAll('.slide').forEach(el => el.remove());
        thumbsRow.innerHTML = '';

        imagesData.forEach((imgData, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            slideDiv.dataset.index = index;
            const blurBg = document.createElement('div');
            blurBg.className = 'slide-blur';
            blurBg.style.backgroundImage = `url('${imgData.src}')`;
            const imgEl = document.createElement('img');
            imgEl.src = imgData.src;
            imgEl.alt = imgData.alt;
            imgEl.loading = 'lazy';
            slideDiv.appendChild(blurBg);
            slideDiv.appendChild(imgEl);
            stage.insertBefore(slideDiv, prevBtn);

            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'thumb';
            thumbDiv.dataset.index = index;
            const thumbImg = document.createElement('img');
            thumbImg.src = imgData.src;
            thumbImg.alt = 'thumb ' + (index + 1);
            thumbDiv.appendChild(thumbImg);
            thumbsRow.appendChild(thumbDiv);
        });

        const slides = stage.querySelectorAll('.slide');
        const thumbs = thumbsRow.querySelectorAll('.thumb');
        if (slides.length === 0) return;

        let currentIndex = 0;
        let isAnimating = false;
        let autoTimer = null;
        const AUTO_ADVANCE_DELAY = 5500;

        function updateActiveState() {
            slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
            thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
        }

        function navigateTo(targetIndex, direction = 1) {
            const normalizedIndex = ((targetIndex % slides.length) + slides.length) % slides.length;
            if (isAnimating || normalizedIndex === currentIndex) return;

            isAnimating = true;
            const previousIndex = currentIndex;
            currentIndex = normalizedIndex;

            slides[previousIndex].classList.remove('active');
            slides[previousIndex].classList.add('exit-left');
            slides[previousIndex].style.transform = `translateX(${direction > 0 ? -40 : 40}px)`;
            slides[previousIndex].style.opacity = '0';

            const incomingSlide = slides[currentIndex];
            incomingSlide.style.transform = `translateX(${direction > 0 ? 40 : -40}px)`;
            incomingSlide.style.opacity = '0';
            incomingSlide.classList.add('active');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    incomingSlide.style.transform = '';
                    incomingSlide.style.opacity = '';
                });
            });

            setTimeout(() => {
                slides[previousIndex].classList.remove('exit-left');
                slides[previousIndex].style.transform = '';
                slides[previousIndex].style.opacity = '';
                isAnimating = false;
            }, 800);

            updateActiveState();
        }

        function goToPrevious() { navigateTo(currentIndex - 1, -1); }
        function goToNext() { navigateTo(currentIndex + 1, 1); }
        function jumpTo(index) {
            const direction = index >= currentIndex ? 1 : -1;
            navigateTo(index, direction);
        }

        function startAutoAdvance() {
            stopAutoAdvance();
            autoTimer = setInterval(goToNext, AUTO_ADVANCE_DELAY);
        }
        function stopAutoAdvance() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        prevBtn.addEventListener('click', e => { e.preventDefault(); goToPrevious(); });
        nextBtn.addEventListener('click', e => { e.preventDefault(); goToNext(); });

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                jumpTo(parseInt(thumb.dataset.index, 10));
            });
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevious(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
        });

        // Touch swipe
        let touchStartX = 0, touchStartY = 0, touchStartTime = 0, touchActive = false;
        stage.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            touchActive = true;
            stopAutoAdvance();
        }, { passive: true });

        document.addEventListener('touchend', e => {
            if (!touchActive) return;
            touchActive = false;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            const elapsed = Date.now() - touchStartTime;
            const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
            const threshold = 30;
            const isQuick = elapsed < 300 && Math.abs(deltaX) > 20;

            if (isHorizontal && (Math.abs(deltaX) > threshold || isQuick)) {
                deltaX < 0 ? goToNext() : goToPrevious();
            }
            clearTimeout(stage._resumeTimeout);
            stage._resumeTimeout = setTimeout(startAutoAdvance, 4000);
        }, { passive: true });

        document.addEventListener('touchcancel', () => { touchActive = false; });

        // Mouse drag
        let mouseStartX = 0, isDragging = false;
        stage.addEventListener('mousedown', e => {
            if (e.target.closest('.nav-arrow')) return;
            mouseStartX = e.clientX;
            isDragging = true;
            stopAutoAdvance();
        });
        window.addEventListener('mouseup', e => {
            if (!isDragging) return;
            isDragging = false;
            const deltaX = e.clientX - mouseStartX;
            if (Math.abs(deltaX) > 50) {
                deltaX < 0 ? goToNext() : goToPrevious();
            }
            startAutoAdvance();
        });
        stage.addEventListener('mouseleave', () => {
            if (isDragging) { isDragging = false; startAutoAdvance(); }
        });
        stage.addEventListener('mouseenter', stopAutoAdvance);
        stage.addEventListener('mouseleave', () => {
            if (!isDragging) startAutoAdvance();
        });

        updateActiveState();
        startAutoAdvance();
    }

    init();
}

// ========== INITIALIZE BOTH GALLERIES ==========
createGallery('proposal', { landscape: 'proposall', portrait: 'proposalp' });
createGallery('prenup', { landscape: 'prenupl', portrait: 'prenupp' });

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

// ========== SAKURA PETALS ANIMATION ==========
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

// ========== LOVE STORY LIGHTBOX (for prenup images only) ==========
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

// ========== ATTIRE CARD ENTRANCE ANIMATION ==========
(function() {
    function startAttireAnimation() {
        const attireCard = document.querySelector('.attire-card-c');
        if (!attireCard) return;
        if (attireCard.classList.contains('animate-entrance')) return;
        attireCard.classList.add('animate-entrance');
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAttireAnimation();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    const target = document.querySelector('.attire-card-c');
    if (target) {
        observer.observe(target);
        if (target.getBoundingClientRect().top < window.innerHeight - 100) {
            startAttireAnimation();
        }
    }
})();

// ========== SHARE MOMENT BLOCK ANIMATION ==========
(function() {
    const shareBlock = document.getElementById('shareMomentBlock');
    if (!shareBlock) return;
    
    const shareObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                shareBlock.classList.add('animate-share');
                shareObserver.unobserve(shareBlock);
            }
        });
    }, { threshold: 0.2, rootMargin: "0px 0px -20px 0px" });
    
    shareObserver.observe(shareBlock);
    if (shareBlock.getBoundingClientRect().top < window.innerHeight - 100) {
        shareBlock.classList.add('animate-share');
        shareObserver.unobserve(shareBlock);
    }
})();

// ========== CHARCOAL EMBER CARD SCROLL ANIMATION ==========
(function() {
    const emberCard = document.getElementById('charcoalEmberCard');
    if (!emberCard) return;

    const emberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                emberCard.classList.add('animate-ember');
                emberObserver.unobserve(emberCard);
            }
        });
    }, { threshold: 0.3, rootMargin: "0px 0px -20px 0px" });

    emberObserver.observe(emberCard);

    if (emberCard.getBoundingClientRect().top < window.innerHeight - 100) {
        emberCard.classList.add('animate-ember');
        emberObserver.unobserve(emberCard);
    }
})();

// ========== NEW LOVE STORY INTERSECTION OBSERVER ==========
(function() {
    const storyItems = document.querySelectorAll('.new-love-story .item');
    if (storyItems.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        storyItems.forEach(item => observer.observe(item));
    }
})();