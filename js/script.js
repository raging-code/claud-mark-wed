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

muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    isMuted = audio.muted;
    muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
});

seekSlider.addEventListener('input', (e) => {
    const seekTime = e.target.value * audio.duration;
    audio.currentTime = seekTime;
});

audio.addEventListener('ended', () => {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
});

// ========== SLIDESHOW GALLERY ==========
const captions = [
    "A moment frozen in time 💕",
    "Love written in every glance 🌸",
    "Together is our favourite place 💖",
    "Every picture tells our story 🌷",
    "Forever starts here 💝",
    "Two hearts, one journey 🌸",
    "Made for each other 💕",
    "Love beyond words 🌷",
    "Our happiest moments 💖",
    "Always & forever 🌸"
];

let images = [];
let currentIndex = 0;

function loadSlideshow() {
    let index = 1;
    let loaded = [];

    function tryLoad() {
        const imgPath = `assets/images/gallery-${index}.jpg`;
        const img = new Image();

        img.onload = function () {
            loaded.push(imgPath);
            index++;
            tryLoad();
        };

        img.onerror = function () {
            if (loaded.length === 0) {
                document.querySelector('.slideshow-wrapper').innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-camera-retro fa-3x" style="color: #ffb7c5;"></i>
                        <p class="mt-3">Add your wedding photos as gallery-1.jpg, gallery-2.jpg in assets/images/</p>
                    </div>
                `;
                return;
            }
            images = loaded;
            buildSlideshow();
        };

        img.src = imgPath;
    }

    tryLoad();
}

function buildSlideshow() {
    const slideshowImg = document.getElementById('slideshowImg');
    const slideCaption = document.getElementById('slideCaption');
    const currentSlide = document.getElementById('currentSlide');
    const totalSlides = document.getElementById('totalSlides');
    const dotsContainer = document.getElementById('slideDots');
    const thumbnailStrip = document.getElementById('thumbnailStrip');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    totalSlides.textContent = images.length;

    // Build dots
    images.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    // Build thumbnails
    images.forEach((src, i) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = 'thumb' + (i === 0 ? ' active' : '');
        thumb.alt = `Thumbnail ${i + 1}`;
        thumb.addEventListener('click', () => goToSlide(i));
        thumbnailStrip.appendChild(thumb);
    });

    // Set first image
    slideshowImg.src = images[0];
    slideCaption.textContent = captions[0 % captions.length];

    // Prev button
    prevBtn.addEventListener('click', () => {
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        goToSlide(newIndex);
    });

    // Next button
    nextBtn.addEventListener('click', () => {
        const newIndex = (currentIndex + 1) % images.length;
        goToSlide(newIndex);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            goToSlide(newIndex);
        }
        if (e.key === 'ArrowRight') {
            const newIndex = (currentIndex + 1) % images.length;
            goToSlide(newIndex);
        }
    });
}

function goToSlide(index) {
    const slideshowImg = document.getElementById('slideshowImg');
    const slideCaption = document.getElementById('slideCaption');
    const currentSlide = document.getElementById('currentSlide');
    const dots = document.querySelectorAll('.dot');
    const thumbs = document.querySelectorAll('.thumb');

    // Fade out
    slideshowImg.classList.add('fade-out');

    setTimeout(() => {
        currentIndex = index;
        slideshowImg.src = images[currentIndex];
        slideCaption.textContent = captions[currentIndex % captions.length];
        currentSlide.textContent = currentIndex + 1;

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));

        // Update thumbnails
        thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));

        // Fade in
        slideshowImg.classList.remove('fade-out');
    }, 250);
}

document.addEventListener('DOMContentLoaded', loadSlideshow);