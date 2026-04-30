// ---------- COUNTDOWN TIMER ----------
(function() {
    const WEDDING = new Date(2026, 5, 24, 10, 30, 0);
    const pad = n => String(n).padStart(2, '0');
    function updateCountdown() {
        const diff = WEDDING - new Date();
        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('mins').textContent = '00';
            document.getElementById('secs').textContent = '00';
            return;
        }
        document.getElementById('days').textContent  = pad(Math.floor(diff / 86400000));
        document.getElementById('hours').textContent = pad(Math.floor((diff % 86400000) / 3600000));
        document.getElementById('mins').textContent  = pad(Math.floor((diff % 3600000) / 60000));
        document.getElementById('secs').textContent  = pad(Math.floor((diff % 60000) / 1000));
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
})();

// ---------- AUDIO PLAYER ----------
const audio = document.getElementById('themeAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const seekSlider = document.getElementById('seekSlider');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');

let isScrubbing = false;
let durationReady = false;

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateDurationDisplay() {
    if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
        seekSlider.max = audio.duration;
        seekSlider.disabled = false;
        durationSpan.textContent = formatTime(audio.duration);
        durationReady = true;
    } else {
        seekSlider.max = 100;
        seekSlider.disabled = true;
        durationSpan.textContent = "0:00";
        durationReady = false;
    }
}

if (audio) {
    audio.addEventListener('loadedmetadata', updateDurationDisplay);
    audio.addEventListener('durationchange', updateDurationDisplay);
    audio.addEventListener('canplay', updateDurationDisplay);

    audio.addEventListener('timeupdate', () => {
        if (!isScrubbing && durationReady) {
            seekSlider.value = audio.currentTime;
        }
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    });

    playPauseBtn?.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().catch(() => {});
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    audio.muted = false;
    muteBtn?.addEventListener('click', () => {
        audio.muted = !audio.muted;
        muteBtn.innerHTML = audio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    seekSlider?.addEventListener('input', () => {
        if (durationReady) {
            isScrubbing = true;
            const preview = parseFloat(seekSlider.value);
            currentTimeSpan.textContent = formatTime(preview);
        }
    });

    seekSlider?.addEventListener('change', () => {
        if (durationReady) {
            const target = parseFloat(seekSlider.value);
            if (!isNaN(target) && isFinite(target)) {
                audio.currentTime = target;
            }
        }
        isScrubbing = false;
    });

    seekSlider?.addEventListener('touchstart', () => { isScrubbing = true; });
    seekSlider?.addEventListener('touchend', () => {});

    audio.addEventListener('ended', () => {
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    function tryUnmutedPlay() {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                if (muteBtn) muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }).catch(() => {
                const playOnInteraction = () => {
                    audio.play().then(() => {
                        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        if (muteBtn) muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }).catch(() => {});
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                    document.removeEventListener('keydown', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
                document.addEventListener('keydown', playOnInteraction, { once: true });
            });
        }
    }

    tryUnmutedPlay();
    audio.addEventListener('canplay', tryUnmutedPlay, { once: true });

    setTimeout(() => {
        if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
            updateDurationDisplay();
        }
    }, 2000);
}

function pauseAllYouTubeVideos() {
    const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    youtubeIframes.forEach(iframe => {
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
    });
}
// When background music is played (either by button or autoplay), pause any YouTube video
audio.addEventListener('play', () => {
    pauseAllYouTubeVideos();
});

// ---------- LIGHTBOX ----------
const lightbox = document.getElementById('globalLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function openLightbox(imagesArray, startIndex) {
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

// ---------- VIDEO FACADES ----------
// ---------- VIDEO FACADES (pause previous on new play) ----------
(function() {
    let activeYouTubeIframe = null;  // holds the iframe that is currently playing

    function pauseActiveYouTubeVideo() {
        if (activeYouTubeIframe && activeYouTubeIframe.contentWindow) {
            activeYouTubeIframe.contentWindow.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}',
                'https://www.youtube.com'  // secure, matches embed origin
            );
        }
    }

    document.querySelectorAll('.video-facade').forEach(facade => {
        const videoId = facade.dataset.videoId;
        if (!videoId) return;
        const playBtn = facade.querySelector('.video-play-btn');
        if (!playBtn) return;

        playBtn.addEventListener('click', () => {
            // Pause any currently playing YouTube video
            pauseActiveYouTubeVideo();

            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = facade.classList.contains('vertical-facade') ? '12px' : '0';
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`;
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

            // Clear the facade and insert the new iframe
            facade.innerHTML = '';
            facade.appendChild(iframe);

            // Update the reference to the new iframe
            activeYouTubeIframe = iframe;
        });
    });
})();

// ---------- GALLERIES (Proposal & Prenup) ----------
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
            const webpSrc = `${basePath}${prefix}${i}-800.webp`;
            const jpgSrc  = `${basePath}${prefix}${i}-800.jpg`;
            let img = new Image();
            let loaded = false;
            try {
                await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = webpSrc; });
                loaded = true;
            } catch (e) {
                try {
                    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = jpgSrc; });
                    loaded = true;
                } catch (e2) {}
            }
            if (loaded) {
                images.push({ src: img.src, alt: `${prefix} ${i}`, width: 800, height: 533, img: img });
                consecutiveFailures = 0;
            } else {
                consecutiveFailures++;
            }
            i++;
        }
        if (images.length === 0) {
            let fallback = new Image();
            fallback.src = 'https://picsum.photos/id/42/800/533';
            await new Promise(resolve => { fallback.onload = resolve; });
            images.push({ src: fallback.src, alt: 'Fallback', width: 800, height: 533, img: fallback });
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
        imgEl.loading = 'eager';
        imgEl.width = imgData.width;
        imgEl.height = imgData.height;
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
            thumbImg.loading = 'eager';
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

    function updateActiveState() {
        slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        if (thumbsTrack) {
            thumbElements.forEach((thumb, i) => thumb.classList.toggle('active', i === currentIndex));
            requestAnimationFrame(updateThumbPosition);
        }
    }

    function navigateTo(targetIndex) {
        const normalizedIndex = ((targetIndex % slides.length) + slides.length) % slides.length;
        if (isAnimating || normalizedIndex === currentIndex) return;
        isAnimating = true;
        slides[currentIndex].classList.remove('active');
        currentIndex = normalizedIndex;
        slides[currentIndex].classList.add('active');
        updateActiveState();
        setTimeout(() => { isAnimating = false; }, 600);
    }

    function goToPrevious() { navigateTo(currentIndex - 1); }
    function goToNext() { navigateTo(currentIndex + 1); }
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
                    navigateTo(idx);
                    startAutoAdvance();
                }
            }
        });
    }

    // Keyboard and touch/drag handlers
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); stopAutoAdvance(); goToPrevious(); startAutoAdvance(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); stopAutoAdvance(); goToNext(); startAutoAdvance(); }
    });

    let touchStartX = 0, touchActive = false;
    stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchActive = true; stopAutoAdvance(); }, { passive: true });
    stage.addEventListener('touchmove', e => { if (touchActive && Math.abs(e.touches[0].clientX - touchStartX) > 20) e.preventDefault(); }, { passive: false });
    stage.addEventListener('touchend', e => {
        if (!touchActive) return;
        touchActive = false;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 40) deltaX < 0 ? goToNext() : goToPrevious();
        clearTimeout(stage._resumeTimeout);
        stage._resumeTimeout = setTimeout(startAutoAdvance, 4000);
    });

    let mouseStartX = 0, isDragging = false;
    stage.addEventListener('mousedown', e => { if (e.target.closest('.nav-arrow')) return; mouseStartX = e.clientX; isDragging = true; stopAutoAdvance(); });
    window.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = e.clientX - mouseStartX;
        if (Math.abs(deltaX) > 50) deltaX < 0 ? goToNext() : goToPrevious();
        startAutoAdvance();
    });
    stage.addEventListener('mouseleave', () => { if (isDragging) { isDragging = false; startAutoAdvance(); } });
    stage.addEventListener('mouseenter', stopAutoAdvance);
    stage.addEventListener('mouseleave', () => { if (!isDragging) startAutoAdvance(); });

    updateActiveState();
    startAutoAdvance();
    window.addEventListener('resize', () => requestAnimationFrame(updateThumbPosition));
}

createSequentialGallery('proposal', 'assets/images/proposal/', 'pro', 1, 11);
createSequentialGallery('prenup', 'assets/images/prenup/', 'pren', 1, 20);

// ---------- LOVE STORY LIGHTBOX ----------
const loveStoryImages = [];
document.querySelectorAll('.new-love-story .item .photo img').forEach((img, idx) => {
    loveStoryImages.push(img.src);
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(loveStoryImages, idx);
    });
});

// ---------- RSVP FORM ----------
(function() {
    const rsvpForm = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('rsvpSubmitBtn');
    const msgDiv = document.getElementById('rsvpMessage');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const attendingHidden = document.getElementById('attending');
            if (msgDiv) msgDiv.innerHTML = '';
            let error = '';
            if (!nameInput.value.trim()) error = 'Please enter your name.';
            else if (!emailInput.value.trim()) error = 'Please enter your email address.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) error = 'Please enter a valid email address.';
            else if (!attendingHidden.value) error = 'Please select whether you are attending.';
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

// ---------- SAKURA PETALS ----------
(function() {
    const petalContainer = document.querySelector('.sakura-petals .petal-inner');
    if (!petalContainer) return;
    const isMobile = window.innerWidth <= 768;
    const sizeFactor = isMobile ? 0.8 : 1.2;
    const petalCount = isMobile ? 15 : 20;
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
        petalContainer.appendChild(petal);
    }
    document.addEventListener('visibilitychange', () => {
        const outer = document.querySelector('.sakura-petals');
        if (outer) outer.classList.toggle('paused', document.hidden);
    });
})();

// ---------- FAQ TOGGLE (delegated) ----------
document.getElementById('faq3-list')?.addEventListener('click', (e) => {
    const toggle = e.target.closest('.faq-toggle');
    if (!toggle) return;
    const row = toggle.closest('.faq-row');
    row.classList.toggle('active');
});

// ---------- CUSTOM DROPDOWN ----------
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
        if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
})();

// ---------- SHARE PHOTO BTN ----------
document.getElementById('sharePhotoPlaceholderBtn')?.addEventListener('click', () => {
    console.log('Share photo button clicked');
});

// ---------- SCROLL ANIMATIONS ----------
// Love story items
(function() {
    const items = document.querySelectorAll('.new-love-story .story-col .item');
    if (!items.length) return;
    items.forEach((item, index) => {
        item.classList.add('love-anim-item');
        item.classList.add((index % 2 === 0) ? 'love-from-left' : 'love-from-right');
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('love-visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.2 });
    items.forEach(item => observer.observe(item));
})();

// Venue section
(function() {
    const venueSection = document.querySelector('.venue-section');
    if (!venueSection) return;
    const heading = venueSection.querySelector('.venue-main-heading');
    if (heading) {
        heading.classList.add('venue-anim-heading');
        new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('venue-visible'); } });
        }, { threshold: 0.3 }).observe(heading);
    }
    const rows = venueSection.querySelectorAll('.venue-row');
    rows.forEach((row, index) => {
        row.classList.add('venue-anim-row');
        row.classList.add(index === 0 ? 'venue-from-left' : 'venue-from-right');
        new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('venue-visible'); } });
        }, { threshold: 0.2 }).observe(row);
    });
})();

// Share tagline animations
(function() {
    const shareBlock = document.querySelector('.share-tagline');
    if (!shareBlock) return;
    const elements = [
        { el: shareBlock.querySelector('.capture-text'), cls: 'share-from-left' },
        { el: shareBlock.querySelector('.dont-forget'), cls: 'share-from-left' },
        { el: shareBlock.querySelector('.hashtag-eb-share'), cls: 'share-fade' },
        { el: shareBlock.querySelector('.got-perfect'), cls: 'share-from-right' },
        { el: document.querySelector('.btn-share-placeholder'), cls: 'share-from-right' }
    ];
    elements.forEach(({el, cls}) => {
        if (!el) return;
        el.classList.add('share-anim', cls);
        new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('share-visible'); } });
        }, { threshold: 0.2 }).observe(el);
    });
})();

// FAQ staggered entrance
(function() {
    const faqBox = document.querySelector('.faq-boxed');
    if (!faqBox) return;
    const faqRows = faqBox.querySelectorAll('.faq-row');
    faqRows.forEach((row, index) => {
        row.classList.add('faq-anim-row');
        row.style.transitionDelay = `${0.1 * (index + 1)}s`;
    });
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.faq-anim-row').forEach(row => row.classList.add('faq-visible'));
            }
        });
    }, { threshold: 0.15 }).observe(faqBox);
})();

// Attire card entrance
(function() {
    const card = document.querySelector('.attire-card-c');
    if (!card) return;
    card.classList.add('will-animate');
    function start() { card.classList.remove('will-animate'); }
    new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { start(); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }).observe(card);
    if (card.getBoundingClientRect().top < window.innerHeight - 80) start();
})();

// Save the date slide animations
(function() {
    const photoRow = document.querySelector('.photo-row');
    if (!photoRow) return;
    photoRow.classList.add('will-animate');
    new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { photoRow.classList.remove('will-animate'); } });
    }, { threshold: 0.2 }).observe(photoRow);
})();