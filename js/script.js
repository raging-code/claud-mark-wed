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

// ========== NEW PRENUP GALLERY (SWIPER) ==========
(function() {
    // Load images using your naming convention and interleave portrait/landscape
    function loadPrenupImages() {
        return new Promise((resolve) => {
            const portraits = [];
            const landscapes = [];
            const maxIndex = 15;

            function tryPortrait(index) {
                if (index > maxIndex) {
                    tryLandscape(0);
                    return;
                }
                const filename = index === 0 ? 'prenupp.webp' : `prenupp${index}.webp`;
                const path = `assets/images/${filename}`;
                const img = new Image();
                img.onload = () => {
                    portraits.push({ src: path, alt: `Portrait ${portraits.length + 1}` });
                    tryPortrait(index + 1);
                };
                img.onerror = () => {
                    tryPortrait(index + 1);
                };
                img.src = path;
            }

            function tryLandscape(index) {
                if (index > maxIndex) {
                    finish();
                    return;
                }
                const filename = index === 0 ? 'prenupl.webp' : `prenupl${index}.webp`;
                const path = `assets/images/${filename}`;
                const img = new Image();
                img.onload = () => {
                    landscapes.push({ src: path, alt: `Landscape ${landscapes.length + 1}` });
                    tryLandscape(index + 1);
                };
                img.onerror = () => {
                    tryLandscape(index + 1);
                };
                img.src = path;
            }

            function finish() {
                // Interleave: landscape, portrait, landscape, portrait...
                const combined = [];
                const maxLen = Math.max(landscapes.length, portraits.length);
                for (let i = 0; i < maxLen; i++) {
                    if (i < landscapes.length) combined.push(landscapes[i]);
                    if (i < portraits.length) combined.push(portraits[i]);
                }

                if (combined.length === 0) {
                    // Fallback if no images found
                    combined.push(
                        { src: 'https://picsum.photos/id/42/1200/960', alt: 'Landscape fallback' },
                        { src: 'https://picsum.photos/id/30/960/1440', alt: 'Portrait fallback' }
                    );
                }
                resolve(combined);
            }

            tryPortrait(0);
        });
    }

    async function initGallery() {
        const imagesData = await loadPrenupImages();
        const wrapper = document.getElementById('slidesWrapper');
        if (!wrapper) return;

        wrapper.innerHTML = '';
        imagesData.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            const frame = document.createElement('div');
            frame.className = 'img-box';
            const picture = document.createElement('img');
            picture.src = img.src;
            picture.alt = img.alt;
            picture.loading = 'lazy';
            frame.appendChild(picture);
            slide.appendChild(frame);
            wrapper.appendChild(slide);
        });

        const allImages = document.querySelectorAll('.img-box img');
        let loadedCount = 0;
        const totalImages = allImages.length;

        function startSwiper() {
            new Swiper('.gallerySwiper', {
                loop: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                spaceBetween: 24,
                grabCursor: true,
                speed: 550,
                autoplay: {
                    delay: 7000,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true,
                },
            });
        }

        if (totalImages === 0) {
            startSwiper();
        } else {
            allImages.forEach(img => {
                if (img.complete) {
                    loadedCount++;
                    if (loadedCount === totalImages) startSwiper();
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === totalImages) startSwiper();
                    });
                    img.addEventListener('error', () => {
                        loadedCount++;
                        if (loadedCount === totalImages) startSwiper();
                    });
                }
            });
            if (loadedCount === totalImages) startSwiper(); // all cached
        }
    }

    initGallery();
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

// ========== LOVE STORY LIGHTBOX ==========
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

// ========== CHARCOAL EMBER CARD SCROLL ANIMATION (NEW) ==========
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