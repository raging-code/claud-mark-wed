const audio = document.getElementById('themeAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const seekSlider = document.getElementById('seekSlider');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');

let isScrubbing = false;

const isFacebookBrowser = /FBAN|FBAV|Messenger/.test(navigator.userAgent);

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateSeekMax() {
    if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
        seekSlider.max = 1;
        durationSpan.textContent = formatTime(audio.duration);
    } else {
        seekSlider.max = 1;
        durationSpan.textContent = "0:00";
    }
}

if (audio) {
    audio.addEventListener('loadedmetadata', updateSeekMax);
    audio.addEventListener('durationchange', updateSeekMax);
    audio.addEventListener('canplay', updateSeekMax);
    
    audio.addEventListener('timeupdate', () => {
        if (!isScrubbing && audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
            const percent = audio.currentTime / audio.duration;
            if (!isNaN(percent) && isFinite(percent)) {
                seekSlider.value = percent;
            }
            currentTimeSpan.textContent = formatTime(audio.currentTime);
        } else if (!isScrubbing) {
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
    
    // FIXED SEEK: real‑time scrubbing on input
    seekSlider?.addEventListener('input', (e) => {
        if (!audio.duration || !isFinite(audio.duration) || isNaN(audio.duration)) return;
        isScrubbing = true;
        const fraction = parseFloat(e.target.value);
        const targetTime = fraction * audio.duration;
        if (!isNaN(targetTime) && isFinite(targetTime)) {
            audio.currentTime = targetTime;
            currentTimeSpan.textContent = formatTime(targetTime);
        }
    });
    
    seekSlider?.addEventListener('change', () => {
        isScrubbing = false;
    });
    
    seekSlider?.addEventListener('touchstart', () => {
        isScrubbing = true;
    });
    seekSlider?.addEventListener('touchend', () => {
        setTimeout(() => { isScrubbing = false; }, 300);
    });
    
    audio.addEventListener('ended', () => {
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    setTimeout(() => {
        if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
            updateSeekMax();
        }
    }, 2000);
    
    // IMMEDIATE AUTO‑PLAY
    function attemptPlay() {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(() => {
                function playOnInteraction() {
                    audio.play().then(() => {
                        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    }).catch(() => {});
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                }
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
            });
        }
    }
    
    if (document.readyState === 'complete') {
        attemptPlay();
    } else {
        window.addEventListener('DOMContentLoaded', attemptPlay);
    }
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
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
});

// ========== VIDEO FACADES (click to load iframe) ==========
(function() {
    document.querySelectorAll('.video-facade').forEach(facade => {
        const videoId = facade.dataset.videoId;
        if (!videoId) return;
        const playBtn = facade.querySelector('.video-play-btn');
        if (!playBtn) return;

        playBtn.addEventListener('click', () => {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = facade.parentElement.classList.contains('video-sakura-frame') ? '12px' : '0';
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`;
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            facade.innerHTML = '';
            facade.appendChild(iframe);
        });
    });
})();

// ========== GALLERY BUILDER (with eager loading) ==========
window._galleryImageCache = window._galleryImageCache || [];

async function createSequentialGallery(galleryId, basePath, prefix, startIndex = 1, maxAttempts = 20) {
    const stage = document.getElementById(galleryId + 'Stage');
    const prevBtn = document.getElementById(galleryId + 'PrevBtn');
    const nextBtn = document.getElementById(galleryId + 'NextBtn');
    const thumbsRow = document.getElementById(galleryId + 'ThumbsRow');
    const thumbsTrack = document.getElementById(galleryId + 'ThumbsTrack');
    if (!stage) return;

    async function loadImages() {
        const images = [];
        let i = startIndex;
        let consecutiveFailures = 0;
        const MAX_CONSECUTIVE_FAILURES = 3;
        while (i < startIndex + maxAttempts && consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
            const webpSrc = `${basePath}${prefix}${i}.webp`;
            const jpgSrc = `${basePath}${prefix}${i}.jpg`;
            let img = new Image();
            try {
                await new Promise((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject();
                    img.src = webpSrc;
                });
                images.push({ src: webpSrc, alt: `${prefix} ${i}`, img: img });
                window._galleryImageCache.push(img);
                consecutiveFailures = 0;
            } catch (e) {
                try {
                    await new Promise((resolve, reject) => {
                        img.onload = () => resolve();
                        img.onerror = () => reject();
                        img.src = jpgSrc;
                    });
                    images.push({ src: jpgSrc, alt: `${prefix} ${i}`, img: img });
                    window._galleryImageCache.push(img);
                    consecutiveFailures = 0;
                } catch (e2) {
                    consecutiveFailures++;
                }
            }
            i++;
        }
        if (images.length === 0) {
            let fallback = new Image();
            fallback.src = 'https://picsum.photos/id/42/1200/960';
            await new Promise((resolve) => { fallback.onload = resolve; });
            images.push({ src: 'https://picsum.photos/id/42/1200/960', alt: 'Fallback', img: fallback });
            window._galleryImageCache.push(fallback);
        }
        return images;
    }

    const imagesData = await loadImages();
    stage.querySelectorAll('.slide').forEach(el => el.remove());
    if (thumbsTrack) thumbsTrack.innerHTML = '';

    const fullImageSrcs = imagesData.map(data => data.src);
    const slides = [];
    const thumbElements = [];

    imagesData.forEach((imgData, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        slideDiv.dataset.index = index;
        const imgEl = document.createElement('img');
        imgEl.src = imgData.src;
        imgEl.alt = imgData.alt;
        // --- FORCE EAGER LOADING ---
        imgEl.loading = 'eager';
        imgEl.style.cursor = 'pointer';
        imgEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(fullImageSrcs, index);
        });
        slideDiv.appendChild(imgEl);
        stage.insertBefore(slideDiv, prevBtn);
        slides.push(slideDiv);

        if (thumbsTrack) {
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'thumb';
            thumbDiv.dataset.index = index;
            const thumbImg = document.createElement('img');
            thumbImg.src = imgData.src;
            thumbImg.alt = 'thumb ' + (index + 1);
            thumbImg.loading = 'eager';   // eager here as well
            thumbDiv.appendChild(thumbImg);
            thumbsTrack.appendChild(thumbDiv);
            thumbElements.push(thumbDiv);
        }
    });

    let currentIndex = 0;
    let isAnimating = false;
    let autoTimer = null;
    const AUTO_ADVANCE_DELAY = 5500;

    function updateThumbPosition() {
        if (!thumbsTrack || !thumbsRow || thumbElements.length === 0) return;
        const activeThumb = thumbElements[currentIndex];
        if (!activeThumb) return;

        const trackWidth = thumbsTrack.scrollWidth;
        const containerWidth = thumbsRow.clientWidth;
        if (containerWidth === 0) return;

        const thumbRect = activeThumb.getBoundingClientRect();
        const trackRect = thumbsTrack.getBoundingClientRect();
        const thumbLeft = thumbRect.left - trackRect.left;
        const thumbWidth = thumbRect.width;
        const targetTranslate = containerWidth / 2 - (thumbLeft + thumbWidth / 2);

        const maxTranslate = 0;
        const minTranslate = containerWidth - trackWidth;
        const clamped = Math.min(maxTranslate, Math.max(minTranslate, targetTranslate));
        thumbsTrack.style.transform = `translateX(${clamped}px)`;
    }

    const debouncedUpdateThumb = (() => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(updateThumbPosition, 100);
        };
    })();

    function updateActiveState() {
        slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        if (thumbsTrack) {
            thumbElements.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === currentIndex);
            });
            updateThumbPosition();
        }
    }

    function navigateTo(targetIndex, direction) {
        const normalizedIndex = ((targetIndex % slides.length) + slides.length) % slides.length;
        if (isAnimating || normalizedIndex === currentIndex) return;
        isAnimating = true;
        const previousIndex = currentIndex;
        currentIndex = normalizedIndex;

        let exitX, incomingX;
        if (direction === -1) {
            exitX = 40;
            incomingX = -40;
        } else {
            exitX = -40;
            incomingX = 40;
        }

        slides[previousIndex].classList.remove('active');
        slides[previousIndex].classList.add('exit-left');
        slides[previousIndex].style.transform = `translateX(${exitX}px)`;
        slides[previousIndex].style.opacity = '0';

        const incomingSlide = slides[currentIndex];
        incomingSlide.style.transform = `translateX(${incomingX}px)`;
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
    function startAutoAdvance() { stopAutoAdvance(); autoTimer = setInterval(goToNext, AUTO_ADVANCE_DELAY); }
    function stopAutoAdvance() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    prevBtn.addEventListener('click', e => { e.preventDefault(); stopAutoAdvance(); goToPrevious(); startAutoAdvance(); });
    nextBtn.addEventListener('click', e => { e.preventDefault(); stopAutoAdvance(); goToNext(); startAutoAdvance(); });

    if (thumbsTrack) {
        thumbsTrack.addEventListener('click', (e) => {
            const thumb = e.target.closest('.thumb');
            if (thumb) {
                const idx = parseInt(thumb.dataset.index, 10);
                if (!isNaN(idx) && idx !== currentIndex) {
                    stopAutoAdvance();
                    const dir = idx > currentIndex ? 1 : -1;
                    navigateTo(idx, dir);
                    startAutoAdvance();
                }
            }
        });
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); stopAutoAdvance(); goToPrevious(); startAutoAdvance(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); stopAutoAdvance(); goToNext(); startAutoAdvance(); }
    });

    let touchStartX = 0;
    let touchEndX = 0;
    let touchActive = false;

    stage.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchActive = true;
        stopAutoAdvance();
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
        if (!touchActive) return;
        const deltaX = e.touches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 20) {
            e.preventDefault();
        }
    }, { passive: false });

    stage.addEventListener('touchend', (e) => {
        if (!touchActive) return;
        touchActive = false;
        touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;
        if (Math.abs(deltaX) > 40) {
            if (deltaX < 0) goToNext();
            else goToPrevious();
        }
        clearTimeout(stage._resumeTimeout);
        stage._resumeTimeout = setTimeout(startAutoAdvance, 4000);
    });

    stage.addEventListener('touchcancel', () => {
        touchActive = false;
        clearTimeout(stage._resumeTimeout);
        stage._resumeTimeout = setTimeout(startAutoAdvance, 4000);
    });

    let mouseStartX = 0;
    let isDragging = false;

    stage.addEventListener('mousedown', (e) => {
        if (e.target.closest('.nav-arrow')) return;
        mouseStartX = e.clientX;
        isDragging = true;
        stopAutoAdvance();
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = e.clientX - mouseStartX;
        if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) goToNext();
            else goToPrevious();
        }
        startAutoAdvance();
    });

    stage.addEventListener('mouseleave', () => {
        if (isDragging) { isDragging = false; startAutoAdvance(); }
    });
    stage.addEventListener('mouseenter', stopAutoAdvance);
    stage.addEventListener('mouseleave', () => { if (!isDragging) startAutoAdvance(); });

    updateActiveState();
    startAutoAdvance();
    window.addEventListener('resize', debouncedUpdateThumb);
}

createSequentialGallery('proposal', 'assets/images/proposal/', 'pro', 1, 20);
createSequentialGallery('prenup', 'assets/images/prenup/', 'pren', 1, 20);

// ========== LOVE STORY LIGHTBOX ==========
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

// ========== RSVP FORM ==========
(function() {
    const rsvpForm = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('rsvpSubmitBtn');
    const msgDiv = document.getElementById('rsvpMessage');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const attendingSelect = document.getElementById('attending');
            if (msgDiv) msgDiv.innerHTML = '';
            let error = '';
            if (!nameInput.value.trim()) error = 'Please enter your name.';
            else if (!emailInput.value.trim()) error = 'Please enter your email address.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) error = 'Please enter a valid email address.';
            else if (!attendingSelect.value) error = 'Please select whether you are attending.';
            if (error) { msgDiv.innerHTML = `<div class="alert alert-danger">${error}</div>`; return; }
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            const formData = new FormData(rsvpForm);
            const data = new URLSearchParams(formData);
            try {
                const response = await fetch('/api/rsvp', { method: 'POST', body: data, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
                const result = await response.json();
                if (result.success) {
                    msgDiv.innerHTML = '<div class="alert alert-success">Thank you! Your RSVP has been saved.</div>';
                    rsvpForm.reset();
                } else {
                    msgDiv.innerHTML = `<div class="alert alert-danger">${result.error || 'Something went wrong.'}</div>`;
                }
            } catch (err) {
                console.error('RSVP error:', err);
                msgDiv.innerHTML = '<div class="alert alert-danger">Network error. Please try again.</div>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
})();

// ========== SAKURA PETALS (optimised without will‑change) ==========
(function() {
    const petalContainer = document.querySelector('.sakura-petals');
    if (!petalContainer) return;
    const isMobile = window.innerWidth <= 768;
    const sizeFactor = isMobile ? 1 : 1.7;
    const petalCount = isMobile ? 8 : 15;   // reduced from 30 to 15 for performance
    const petalImages = ['assets/images/sakura-petal.webp','assets/images/sakura-petal1.webp','assets/images/sakura-petal2.webp'];
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        const ri = Math.floor(Math.random() * petalImages.length);
        petal.style.backgroundImage = `url('${petalImages[ri]}')`;
        petal.style.backgroundSize = 'contain';
        petal.style.backgroundRepeat = 'no-repeat';
        petal.style.position = 'absolute';
        petal.style.pointerEvents = 'none';
        let min = 20, max = 50;
        if (ri === 0 || ri === 1) { min *= 1.5; max *= 1.5; }
        let size = (min + Math.random() * (max - min)) * sizeFactor;
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.top = -Math.random() * 40 + '%';
        const dur = 18 + Math.random() * 25;
        const del = Math.random() * 20;
        const e = ['linear','ease-in','ease-out','ease-in-out'][Math.floor(Math.random()*4)];
        petal.style.animation = `fall ${dur}s ${e} infinite`;
        petal.style.animationDelay = `${del}s`;
        petal.style.opacity = 0.3 + Math.random() * 0.5;
        // REMOVED will‑change: transform
        petalContainer.appendChild(petal);
    }
    if (!document.querySelector('#petal-keyframes')) {
        const style = document.createElement('style');
        style.id = 'petal-keyframes';
        style.textContent = `@keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(720deg); } }`;
        document.head.appendChild(style);
    }
    document.addEventListener('visibilitychange', () => {
        petalContainer.classList.toggle('paused', document.hidden);
    });
})();

// ========== ATTIRE CARD ENTRANCE ==========
(function() {
    function startAttireAnimation() {
        const card = document.querySelector('.attire-card-c');
        if (!card || card.classList.contains('animate-entrance')) return;
        card.classList.add('animate-entrance');
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { startAttireAnimation(); observer.unobserve(entry.target); }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    const target = document.querySelector('.attire-card-c');
    if (target) {
        observer.observe(target);
        if (target.getBoundingClientRect().top < window.innerHeight - 80) startAttireAnimation();
    }
})();

// ========== SAVE THE DATE SLIDE ANIMATIONS ==========
(function() {
    const left = document.querySelector('.std-photo-left');
    const mid = document.querySelector('.std-photo-mid');
    const right = document.querySelector('.std-photo-right');
    if (!left || !mid || !right) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                left.classList.add('slide-in');
                mid.classList.add('slide-in');
                right.classList.add('slide-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    observer.observe(document.querySelector('.photo-row'));
})();

// Custom dropdown logic (always drops down)
(function () {
    const dropdown = document.getElementById('attendingDropdown');
    if (!dropdown) return;
    const selectedDiv = dropdown.querySelector('.dropdown-selected');
    const options = dropdown.querySelectorAll('.dropdown-options li');
    const hiddenInput = document.getElementById('attending');
    selectedDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    options.forEach(li => {
        li.addEventListener('click', () => {
            const val = li.getAttribute('data-value');
            selectedDiv.textContent = li.textContent;
            selectedDiv.setAttribute('data-value', val);
            hiddenInput.value = val;
            dropdown.classList.remove('open');
            hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
})();

// ========== SHARE PHOTO PLACEHOLDER ==========
const sharePhotoBtn = document.getElementById('sharePhotoPlaceholderBtn');
if (sharePhotoBtn) {
    sharePhotoBtn.addEventListener('click', () => {
        console.log('Share photo button clicked - ready for link integration');
    });
}