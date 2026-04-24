markdown
# 💍 Claudine & Mark Wedding Website

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A fully responsive single‑page wedding invitation website built with vanilla HTML, CSS, and JavaScript.  
Features a dynamic image gallery, love story timeline, countdown timer, RSVP form with Supabase backend, and an admin panel for guest management – all wrapped in a soft Sakura theme.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Backend Setup (RSVP & Admin)](#-backend-setup-rsvp--admin)
- [Customization](#-customization)
- [Deployment](#-deployment)
- [Important Notes](#-important-notes)
- [License](#-license)

---

## ✨ Features

- 🎎 **Hero image** with animated floating Sakura petals
- ⏳ **Countdown timer** to the big day (June 25, 2026)
- 🎵 **Background music player** with play/pause, mute, and seek
- 📸 **Prenup gallery** – dynamic Swiper carousel auto‑loading images  
- 💕 **Love story cards** with lightbox image viewer
- 🎥 **Proposal video** in a decorative frame
- 📍 **Venue cards** with Google Maps links
- 👗 **Dress code & color palette guide**
- 📝 **FAQ accordion** for common wedding questions
- ✉️ **RSVP form** (submits to Supabase or a custom API)
- 🔐 **Admin panel** (login‑protected) to view and manage RSVPs
- 🌀 **Scroll‑triggered animations** throughout the page
- 📱 **Fully responsive** – mobile‑first design with special breakpoints

---

## 🛠 Tech Stack

| Layer        | Technology                                                                 |
|--------------|----------------------------------------------------------------------------|
| **Frontend** | HTML5, CSS3, Vanilla ES6+                                                  |
| **Libraries**| Bootstrap 5.3 (accordion, grid), Swiper 11 (gallery)                       |
| **Icons**    | Bootstrap Icons, Font Awesome 6                                            |
| **Fonts**    | Google Fonts (Inter, EB Garamond, Cormorant Garamond, Playfair Display…)   |
| **Backend**  | [Supabase](https://supabase.com) (PostgreSQL, Auth, Row Level Security)    |
| **Deployment** | Fully static – works with Netlify, Vercel, GitHub Pages, or any web server |

---

## 📁 Repository Structure
.
├── index.html # Main invitation page
├── css/
│ └── style.css # All custom styles (1400+ lines)
├── js/
│ └── script.js # Audio player, Swiper, RSVP logic, animations
├── admin.html # Admin panel (login + RSVP manager)
├── assets/
│ ├── images/ # All images (hero, banner, gallery, love story…)
│ ├── videos/
│ │ └── proposal.mp4 # Portrait video
│ └── audio/
│ └── theme-song.mp3 # Background music
├── setup.sql # Supabase database setup script (optional)
└── README.md # You are here

text

> **Note:** The `rsvp.js` snippet provided in the original project is actually **CSS** for the map buttons. It is recommended to add those styles directly to `css/style.css` (they are already included there). If you have a separate `rsvp.js` file, verify its content – it should not contain CSS.

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- (Optional) [Node.js](https://nodejs.org) to run a local server
- A [Supabase](https://supabase.com) account and project if you want a working RSVP backend

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-wedding-repo.git
   cd your-wedding-repo
Add your assets
Place all image, video, and audio files into the correct folders inside assets/.
See Customization for specific filenames.

Open in browser
You can open index.html directly, but the RSVP form won’t work without a backend.
For a proper local test, serve the folder using a simple HTTP server:

bash
npx serve .
# OR
python -m http.server 8000
Set up the backend – go to Backend Setup.

⚙️ Configuration
Most settings are edited directly inside the HTML and JavaScript files.

Wedding Date
In index.html (near the bottom), change the date string:

js
const WEDDING = new Date('2026-06-25T15:00:00');
Supabase Credentials
Open admin.html and replace the placeholder values:

js
const SUPABASE_URL = 'https://<your-project-id>.supabase.co';
const SUPABASE_ANON_KEY = 'eyJh...'; // your public anon key
Map Links
Update the onclick URLs for the “Open in Maps” buttons:

html
<button class="map-btn" onclick="window.open('https://maps.app.goo.gl/YOUR_LINK', '_blank')">
Countdown Phrase
You can modify the countdown banner text directly in index.html:

html
<span class="countdown-phrase">The beginning of forever starts in...</span>
🔧 Backend Setup (RSVP & Admin)
The RSVP form and admin panel rely on a Supabase PostgreSQL database. Follow these steps:

1. Create a Supabase Project
Sign up at supabase.com, create a new project, and note your Project URL and anon public key.

2. Set up the Database
In your Supabase SQL Editor, run the script from setup.sql (or paste the following):

sql
-- Create rsvp table if it doesn't exist
CREATE TABLE IF NOT EXISTS rsvp (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  attending BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the public form)
CREATE POLICY "anon_insert" ON rsvp FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view, update, delete
CREATE POLICY "auth_select" ON rsvp FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_delete" ON rsvp FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON rsvp FOR UPDATE USING (auth.role() = 'authenticated');

-- Create an index for ordering
CREATE INDEX IF NOT EXISTS idx_rsvp_created_at ON rsvp (created_at DESC);
3. Create an Admin User
Go to your Supabase project Authentication → Users and add a new user.

Use this email and password to log into the admin panel (admin.html).

4. Choose RSVP Submission Method
The current script.js sends the form data to /api/rsvp. You have two options:

Option A: Use Supabase Edge Function (Recommended)
Create a Supabase Edge Function that inserts into the rsvp table, then update the fetch URL in script.js to your function’s endpoint. This keeps the database logic secure.

Option B: Insert directly from the frontend
Modify index.html to include the Supabase client library (@supabase/supabase-js) and change the RSVP handler to call:

js
await supabase.from('rsvp').insert([{ name, email, phone, message, attending }]);
Make sure the “anon_insert” RLS policy is active. This method exposes your anon key for writes, but RLS will protect the table.

🎨 Customization
Images & Media
Element	Replace / Create
Hero image	assets/images/hero-couple.jpg and .webp
Wedding banner	assets/images/header-banner.webp
Portfolio gallery	Portrait images: prenupp.webp, prenupp1.webp … (up to 15)
Landscape: prenupl.webp, prenupl1.webp … (up to 15)
Love story	Six images: story-1.jpg … story-6.jpg (inside love-story/ folder)
Save the Date	06.webp, 25.webp, 26.webp
Dress code	dresscode.webp
Venue photos	ceremony.webp, reception.webp
Proposal video	assets/videos/proposal.mp4 (portrait orientation)
Theme song	assets/audio/theme-song.mp3
All images should be provided in WebP format for faster loading; the code includes fallbacks to .jpg where needed.

Typography & Colors
The color scheme is defined in css/style.css at the top:

css
:root {
    --sakura-pink: #ffb7c5;
    --soft-cream: #fff0f1;
    --dark-charcoal: #31231a;
    /* … other variables */
}
Modify these to match your wedding theme.
The main page (index.html) includes a large <style> block that enforces Inter for body text and EB Garamond for headings. You can adjust or remove these rules.

FAQ
Edit the FAQ items directly in index.html (look for the <div class="accordion">). Each question is a button inside an .accordion-header.

Attire Guide
Change the recommended dress and color swatches in the Attire Guide section of index.html (inside .attire-card-c).

🚢 Deployment
This is a 100% static site – no server required for the frontend.

Upload the entire project folder to any static host.

Set up redirects if necessary (e.g., for a custom domain).

If you chose the Edge Function method for RSVPs, deploy the function separately to Supabase.

Popular hosting options:

GitHub Pages – push to main branch and enable Pages in the repo settings.

Netlify / Vercel – drag‑and‑drop or connect a Git repository.

FTP – upload files to your web hosting space.

⚠️ Important Notes
Supabase Anon Key: Safe to be in client‑side code only because Row Level Security is enabled. Your admin credentials are managed by Supabase Auth.

RSVP Form: The default script.js expects a backend endpoint /api/rsvp. You must either implement that endpoint or switch to direct Supabase inserts (see Backend Setup).

Attending Column Type: After running the SQL script, the attending column is BOOLEAN. In admin.html, you may need to update the display logic from row.attending === 'yes' to row.attending ? '✅ Yes' : '❌ No'. The provided admin.html already handles 'yes'/'no'; after migration, adjust accordingly.

Performance: Compress all images and serve WebP format. The gallery script tries to load up to 30 images; ensure they are optimized.

Swiper Gallery: The script automatically looks for prenupp*.webp (portrait) and prenupl*.webp (landscape) up to index 15. If no images are found, it falls back to placeholder picsum images.

Custom Domain: Add your domain to the Supabase project if using Supabase Auth (for admin) to avoid CORS issues.

📄 License
This project is open‑source under the MIT License. Feel free to use, modify, and share it for your own wedding. Attribution is appreciated but not required.

Congratulations, Claudine & Mark! 🎉
Built with love (and a lot of CSS).

This response is AI-generated, for reference only.
can you just generate me a readme.md file?
We need to provide a readme.md file. The user wants it for GitHub format. The previous response was a chat message. I'll generate the readme.md content in a code block that they can copy. Since they asked "can you just generate me a readme.md file?" I'll just output the markdown content directly, ready to be saved as README.md. I'll include all the info from the previous comprehensive response but as a raw markdown.

markdown
# 💍 Claudine & Mark Wedding Website

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A fully responsive single‑page wedding invitation website built with vanilla HTML, CSS, and JavaScript.  
Features a dynamic image gallery, love story timeline, countdown timer, RSVP form with Supabase backend, and an admin panel for guest management – all wrapped in a soft Sakura theme.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Backend Setup (RSVP & Admin)](#-backend-setup-rsvp--admin)
- [Customization](#-customization)
- [Deployment](#-deployment)
- [Important Notes](#-important-notes)
- [License](#-license)

---

## ✨ Features

- 🎎 **Hero image** with animated floating Sakura petals
- ⏳ **Countdown timer** to the big day (June 25, 2026)
- 🎵 **Background music player** with play/pause, mute, and seek
- 📸 **Prenup gallery** – dynamic Swiper carousel auto‑loading images  
- 💕 **Love story cards** with lightbox image viewer
- 🎥 **Proposal video** in a decorative frame
- 📍 **Venue cards** with Google Maps links
- 👗 **Dress code & color palette guide**
- 📝 **FAQ accordion** for common wedding questions
- ✉️ **RSVP form** (submits to Supabase or a custom API)
- 🔐 **Admin panel** (login‑protected) to view and manage RSVPs
- 🌀 **Scroll‑triggered animations** throughout the page
- 📱 **Fully responsive** – mobile‑first design with special breakpoints

---

## 🛠 Tech Stack

| Layer        | Technology                                                                 |
|--------------|----------------------------------------------------------------------------|
| **Frontend** | HTML5, CSS3, Vanilla ES6+                                                  |
| **Libraries**| Bootstrap 5.3 (accordion, grid), Swiper 11 (gallery)                       |
| **Icons**    | Bootstrap Icons, Font Awesome 6                                            |
| **Fonts**    | Google Fonts (Inter, EB Garamond, Cormorant Garamond, Playfair Display…)   |
| **Backend**  | [Supabase](https://supabase.com) (PostgreSQL, Auth, Row Level Security)    |
| **Deployment** | Fully static – works with Netlify, Vercel, GitHub Pages, or any web server |

---

## 📁 Repository Structure
.
├── index.html # Main invitation page
├── css/
│ └── style.css # All custom styles (1400+ lines)
├── js/
│ └── script.js # Audio player, Swiper, RSVP logic, animations
├── admin.html # Admin panel (login + RSVP manager)
├── assets/
│ ├── images/ # All images (hero, banner, gallery, love story…)
│ ├── videos/
│ │ └── proposal.mp4 # Portrait video
│ └── audio/
│ └── theme-song.mp3 # Background music
├── setup.sql # Supabase database setup script (optional)
└── README.md # You are here

text

> **Note:** The `rsvp.js` snippet provided in the original project is actually **CSS** for the map buttons. It is recommended to add those styles directly to `css/style.css` (they are already included there). If you have a separate `rsvp.js` file, verify its content – it should not contain CSS.

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- (Optional) [Node.js](https://nodejs.org) to run a local server
- A [Supabase](https://supabase.com) account and project if you want a working RSVP backend

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-wedding-repo.git
   cd your-wedding-repo
Add your assets
Place all image, video, and audio files into the correct folders inside assets/.
See Customization for specific filenames.

Open in browser
You can open index.html directly, but the RSVP form won’t work without a backend.
For a proper local test, serve the folder using a simple HTTP server:

bash
npx serve .
# OR
python -m http.server 8000
Set up the backend – go to Backend Setup.

⚙️ Configuration
Most settings are edited directly inside the HTML and JavaScript files.

Wedding Date
In index.html (near the bottom), change the date string:

js
const WEDDING = new Date('2026-06-25T15:00:00');
Supabase Credentials
Open admin.html and replace the placeholder values:

js
const SUPABASE_URL = 'https://<your-project-id>.supabase.co';
const SUPABASE_ANON_KEY = 'eyJh...'; // your public anon key
Map Links
Update the onclick URLs for the “Open in Maps” buttons:

html
<button class="map-btn" onclick="window.open('https://maps.app.goo.gl/YOUR_LINK', '_blank')">
Countdown Phrase
You can modify the countdown banner text directly in index.html:

html
<span class="countdown-phrase">The beginning of forever starts in...</span>
🔧 Backend Setup (RSVP & Admin)
The RSVP form and admin panel rely on a Supabase PostgreSQL database. Follow these steps:

1. Create a Supabase Project
Sign up at supabase.com, create a new project, and note your Project URL and anon public key.

2. Set up the Database
In your Supabase SQL Editor, run the script from setup.sql (or paste the following):

sql
-- Create rsvp table if it doesn't exist
CREATE TABLE IF NOT EXISTS rsvp (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  attending BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the public form)
CREATE POLICY "anon_insert" ON rsvp FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view, update, delete
CREATE POLICY "auth_select" ON rsvp FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_delete" ON rsvp FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "auth_update" ON rsvp FOR UPDATE USING (auth.role() = 'authenticated');

-- Create an index for ordering
CREATE INDEX IF NOT EXISTS idx_rsvp_created_at ON rsvp (created_at DESC);
3. Create an Admin User
Go to your Supabase project Authentication → Users and add a new user.

Use this email and password to log into the admin panel (admin.html).

4. Choose RSVP Submission Method
The current script.js sends the form data to /api/rsvp. You have two options:

Option A: Use Supabase Edge Function (Recommended)
Create a Supabase Edge Function that inserts into the rsvp table, then update the fetch URL in script.js to your function’s endpoint. This keeps the database logic secure.

Option B: Insert directly from the frontend
Modify index.html to include the Supabase client library (@supabase/supabase-js) and change the RSVP handler to call:

js
await supabase.from('rsvp').insert([{ name, email, phone, message, attending }]);
Make sure the “anon_insert” RLS policy is active. This method exposes your anon key for writes, but RLS will protect the table.

🎨 Customization
Images & Media
Element	Replace / Create
Hero image	assets/images/hero-couple.jpg and .webp
Wedding banner	assets/images/header-banner.webp
Portfolio gallery	Portrait images: prenupp.webp, prenupp1.webp … (up to 15)
Landscape: prenupl.webp, prenupl1.webp … (up to 15)
Love story	Six images: story-1.jpg … story-6.jpg (inside love-story/ folder)
Save the Date	06.webp, 25.webp, 26.webp
Dress code	dresscode.webp
Venue photos	ceremony.webp, reception.webp
Proposal video	assets/videos/proposal.mp4 (portrait orientation)
Theme song	assets/audio/theme-song.mp3
All images should be provided in WebP format for faster loading; the code includes fallbacks to .jpg where needed.

Typography & Colors
The color scheme is defined in css/style.css at the top:

css
:root {
    --sakura-pink: #ffb7c5;
    --soft-cream: #fff0f1;
    --dark-charcoal: #31231a;
    /* … other variables */
}
Modify these to match your wedding theme.
The main page (index.html) includes a large <style> block that enforces Inter for body text and EB Garamond for headings. You can adjust or remove these rules.

FAQ
Edit the FAQ items directly in index.html (look for the <div class="accordion">). Each question is a button inside an .accordion-header.

Attire Guide
Change the recommended dress and color swatches in the Attire Guide section of index.html (inside .attire-card-c).

🚢 Deployment
This is a 100% static site – no server required for the frontend.

Upload the entire project folder to any static host.

Set up redirects if necessary (e.g., for a custom domain).

If you chose the Edge Function method for RSVPs, deploy the function separately to Supabase.

Popular hosting options:

GitHub Pages – push to main branch and enable Pages in the repo settings.

Netlify / Vercel – drag‑and‑drop or connect a Git repository.

FTP – upload files to your web hosting space.

⚠️ Important Notes
Supabase Anon Key: Safe to be in client‑side code only because Row Level Security is enabled. Your admin credentials are managed by Supabase Auth.

RSVP Form: The default script.js expects a backend endpoint /api/rsvp. You must either implement that endpoint or switch to direct Supabase inserts (see Backend Setup).

Attending Column Type: After running the SQL script, the attending column is BOOLEAN. In admin.html, you may need to update the display logic from row.attending === 'yes' to row.attending ? '✅ Yes' : '❌ No'. The provided admin.html already handles 'yes'/'no'; after migration, adjust accordingly.

Performance: Compress all images and serve WebP format. The gallery script tries to load up to 30 images; ensure they are optimized.

Swiper Gallery: The script automatically looks for prenupp*.webp (portrait) and prenupl*.webp (landscape) up to index 15. If no images are found, it falls back to placeholder picsum images.

Custom Domain: Add your domain to the Supabase project if using Supabase Auth (for admin) to avoid CORS issues.

📄 License
This project is open‑source under the MIT License. Feel free to use, modify, and share it for your own wedding. Attribution is appreciated but not required.
