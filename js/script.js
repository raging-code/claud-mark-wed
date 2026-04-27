// ========== ALWAYS START AT TOP ON LOAD / REFRESH ==========
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// ========== AUDIO PLAYER ==========
const audio = document.getElementById('themeAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const seekSlider = document.getElementById('seekSlider');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

if (audio) {
    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
        seekSlider.max = 1;
        seekSlider.value = 0;
    });
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            seekSlider.value = audio.currentTime / audio.duration;
            currentTimeSpan.textContent = formatTime(audio.currentTime);
        }
    });
    playPauseBtn?.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(e => console.log("Audio play error:", e));
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    muteBtn?.addEventListener('click', () => {
        audio.muted = !audio.muted;
        muteBtn.innerHTML = audio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });
    seekSlider?.addEventListener('input', (e) => {
        audio.currentTime = e.target.value * audio.duration;
    });
    audio.addEventListener('ended', () => {
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
}

// ========== GLOBAL LIGHTBOX ==========
const lightbox = document.getElementById('globalLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function openLightbox(imagesArray, startIndex, captionsArray = []) {
    currentLightboxImages = imagesArray;
    currentLightboxIndex = startIndex;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateLightbox() {
    if (currentLightboxImages[currentLightboxIndex]) {
        lightboxImg.src = currentLightboxImages[currentLightboxIndex];
        lightboxCaption.textContent = '';
    }
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function nextImage() {
    if (currentLightboxImages.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
    updateLightbox();
}

function prevImage() {
    if (currentLightboxImages.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
    updateLightbox();
}

document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
document.querySelector('.lightbox-next')?.addEventListener('click', nextImage);
document.querySelector('.lightbox-prev')?.addEventListener('click', prevImage);
lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
});

// ========== GALLERY BUILDER with SCROLLING 5 THUMBS ==========
async function createSequentialGallery(galleryId, basePath, prefix, startIndex = 1, maxAttempts = 20) {
    const stage = document.getElementById(galleryId + 'Stage');
    const thumbsRow = document.getElementById(galleryId + 'ThumbsRow');
    const prevBtn = document.getElementById(galleryId + 'PrevBtn');
    const nextBtn = document.getElementById(galleryId + 'NextBtn');
    if (!stage || !thumbsRow) return;

    async function loadImages() {
        const images = [];
        let i = startIndex;
        let consecutiveFailures = 0;
        const MAX_CONSECUTIVE_FAILURES = 3;
        while (i < startIndex + maxAttempts && consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
            const webpSrc = `${basePath}${prefix}${i}.webp`;
            const jpgSrc = `${basePath}${prefix}${i}.jpg`;
            try {
                await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => reject();
                    img.src = webpSrc;
                });
                images.push({ src: webpSrc, alt: `${prefix} ${i}` });
                consecutiveFailures = 0;
            } catch (e) {
                try {
                    await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve();
                        img.onerror = () => reject();
                        img.src = jpgSrc;
                    });
                    images.push({ src: jpgSrc, alt: `${prefix} ${i}` });
                    consecutiveFailures = 0;
                } catch (e2) {
                    consecutiveFailures++;
                }
            }
            i++;
        }
        if (images.length === 0) {
            images.push({ src: 'https://picsum.photos/id/42/1200/960', alt: 'Fallback' });
        }
        return images;
    }

    const imagesData = await loadImages();
    stage.querySelectorAll('.slide').forEach(el => el.remove());
    thumbsRow.innerHTML = '';

    const fullImageSrcs = imagesData.map(img => img.src);
    const slides = [];

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
        imgEl.style.cursor = 'pointer';
        imgEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(fullImageSrcs, index);
        });
        slideDiv.appendChild(blurBg);
        slideDiv.appendChild(imgEl);
        stage.insertBefore(slideDiv, prevBtn);
        slides.push(slideDiv);
    });

    let currentIndex = 0;
    let isAnimating = false;
    let autoTimer = null;
    const AUTO_ADVANCE_DELAY = 5500;
    const THUMB_WINDOW_SIZE = 5;

    function getThumbStartIndex(imageIndex) {
        const total = imagesData.length;
        let start = Math.max(0, imageIndex - Math.floor(THUMB_WINDOW_SIZE / 2));
        if (start + THUMB_WINDOW_SIZE > total) {
            start = Math.max(0, total - THUMB_WINDOW_SIZE);
        }
        return start;
    }

    function renderThumbs() {
        thumbsRow.innerHTML = '';
        const start = getThumbStartIndex(currentIndex);
        const end = Math.min(start + THUMB_WINDOW_SIZE, imagesData.length);
        for (let i = start; i < end; i++) {
            const imgData = imagesData[i];
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'thumb';
            thumbDiv.dataset.index = i;
            const thumbImg = document.createElement('img');
            thumbImg.src = imgData.src;
            thumbImg.alt = 'thumb ' + (i + 1);
            thumbDiv.appendChild(thumbImg);
            thumbsRow.appendChild(thumbDiv);
        }
        updateActiveState();
    }

    function updateActiveState() {
        slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        const currentThumbs = document.querySelectorAll(`#${galleryId}ThumbsRow .thumb`);
        currentThumbs.forEach(thumb => {
            const idx = parseInt(thumb.dataset.index, 10);
            if (idx === currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
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

        renderThumbs();
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

    thumbsRow.addEventListener('click', (e) => {
        const thumb = e.target.closest('.thumb');
        if (thumb) {
            const idx = parseInt(thumb.dataset.index, 10);
            if (!isNaN(idx)) jumpTo(idx);
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goToPrevious(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goToNext(); }
    });

    let touchStartX = 0, touchActive = false;
    stage.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchActive = true;
        stopAutoAdvance();
    }, { passive: true });
    document.addEventListener('touchend', e => {
        if (!touchActive) return;
        touchActive = false;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 40) {
            deltaX < 0 ? goToNext() : goToPrevious();
        }
        clearTimeout(stage._resumeTimeout);
        stage._resumeTimeout = setTimeout(startAutoAdvance, 4000);
    });
    document.addEventListener('touchcancel', () => { touchActive = false; });

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
    stage.addEventListener('mouseleave', () => { if (!isDragging) startAutoAdvance(); });

    renderThumbs();
    updateActiveState();
    startAutoAdvance();
}

createSequentialGallery('proposal', 'assets/images/proposal/', 'pro', 1, 20);
createSequentialGallery('prenup', 'assets/images/prenup/', 'pren', 1, 20);

// ========== LOVE STORY CLICKABLE LIGHTBOX ==========
const loveStoryImages = [];
const loveStoryItems = document.querySelectorAll('.new-love-story .item');
loveStoryItems.forEach((item, idx) => {
    const img = item.querySelector('.photo img');
    if (img) {
        loveStoryImages.push(img.src);
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(loveStoryImages, idx);
        });
    }
});

// ========== RSVP FORM HANDLER (adapted for new select) ==========
(function() {
    const rsvpForm = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('rsvpSubmitBtn');
    const msgDiv = document.getElementById('rsvpMessage');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const attendingSelect = document.getElementById('attending');   // new select element

            if (msgDiv) msgDiv.innerHTML = '';

            let error = '';
            if (!nameInput.value.trim()) {
                error = 'Please enter your name.';
            } else if (!emailInput.value.trim()) {
                error = 'Please enter your email address.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                error = 'Please enter a valid email address.';
            } else if (!attendingSelect.value) {
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
    const petalCount = 40;
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        const randomIndex = Math.floor(Math.random() * petalImages.length);
        const randomImage = petalImages[randomIndex];
        petal.style.backgroundImage = `url('${randomImage}')`;
        petal.style.backgroundSize = 'contain';
        petal.style.backgroundRepeat = 'no-repeat';
        petal.style.position = 'absolute';
        petal.style.pointerEvents = 'none';
        let minSize = 20, maxSize = 50;
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
        const duration = 12 + Math.random() * 20;
        const delay = Math.random() * 18;
        const easing = ['linear', 'ease-in', 'ease-out', 'ease-in-out'][Math.floor(Math.random() * 4)];
        petal.style.animation = `fall ${duration}s ${easing} infinite`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.opacity = 0.3 + Math.random() * 0.5;
        petal.style.willChange = 'transform';
        petalContainer.appendChild(petal);
    }
    if (!document.querySelector('#petal-keyframes')) {
        const style = document.createElement('style');
        style.id = 'petal-keyframes';
        style.textContent = `@keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(720deg); } }`;
        document.head.appendChild(style);
    }
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
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    const target = document.querySelector('.attire-card-c');
    if (target) {
        observer.observe(target);
        if (target.getBoundingClientRect().top < window.innerHeight - 80) {
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
    }, { threshold: 0.2, rootMargin: "0px 0px -10px 0px" });
    shareObserver.observe(shareBlock);
    if (shareBlock.getBoundingClientRect().top < window.innerHeight - 80) {
        shareBlock.classList.add('animate-share');
        shareObserver.unobserve(shareBlock);
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

// ========== PLACEHOLDER FOR SHARE PHOTO BUTTON ==========
const sharePhotoBtn = document.getElementById('sharePhotoPlaceholderBtn');
if (sharePhotoBtn) {
    sharePhotoBtn.addEventListener('click', () => {
        console.log('Share photo button clicked - ready for link integration');
    });
}