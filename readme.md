Claudine & Mark Wedding Website
A complete, elegant wedding invitation website built with vanilla HTML, CSS, and JavaScript. Features include an image gallery, love story timeline, video section, countdown timer, RSVP form, and admin panel for guest management.

Table of Contents
Project Overview

Features

Tech Stack

File Structure

Getting Started

Configuration

Backend Setup

Supabase Database

RSVP Form Implementation

Customization

Wedding Date

Images & Media

Styles & Typography

Deployment

Important Notes

License

Project Overview
This is a single‑page wedding site for Claudine and Mark, designed with a soft Sakura (cherry blossom) aesthetic. It includes:

Hero image with animated falling petals

Countdown to the wedding date

Background music player

"Save the Date" photo composition

Prenup gallery (dynamic Swiper carousel)

Love story with lightbox image viewer

Proposal video

Venue cards with Google Maps links

Dress code & color palette

FAQ accordion

RSVP form

Hidden admin panel (login required) for viewing and managing RSVPs

The site is fully responsive and uses modern CSS animations for an engaging experience.

Features
Dynamic Gallery: Automatically loads prenupp*.webp (portrait) and prenupl*.webp (landscape) images, interleaving them in a Swiper carousel.

Love Story Lightbox: Click any love‑story card to view the image fullscreen with navigation.

Countdown Timer: Real‑time countdown to June 25, 2026 15:00.

Audio Player: Custom theme song with play/pause, mute, and seek controls.

RSVP System: Form posts to an API endpoint; admin panel allows viewing/deleting RSVPs via Supabase.

Sakura Petals: Animated falling petals created with JavaScript and CSS.

Scroll Animations: Cards and sections fade/slide in when they enter the viewport.

Mobile Optimized: Specific breakpoints for small screens, including tweaked map buttons and typography.

Tech Stack
Layer	Technology
Frontend	HTML5, CSS3, Vanilla JavaScript
Bootstrap 5.3 (CSS grid, accordion)
Swiper 11 (carousel)
Bootstrap Icons, Font Awesome 6
Google Fonts (Inter, EB Garamond, Cormorant Garamond, Playfair Display, etc.)
Backend	Database & Auth: Supabase
RSVP API: The form currently posts to /api/rsvp – you need to implement this endpoint. The recommended approach is to use Supabase Edge Functions or modify the frontend to insert directly into Supabase (see RSVP Form Implementation).
Deployment	Any static hosting service (Netlify, Vercel, GitHub Pages, or a simple HTTP server).
File Structure
text
wedding-website/
├── index.html              # Main invitation page
├── css/
│   └── style.css           # All custom styles (over 1000 lines)
├── js/
│   └── script.js           # Audio player, Swiper init, RSVP logic, animations
├── admin.html              # Admin panel (login + RSVP manager)
├── assets/
│   ├── images/
│   │   ├── hero-couple.jpg / .webp       # Hero image
│   │   ├── header-banner.webp            # Wedding banner
│   │   ├── ceremony.webp                 # Ceremony venue image
│   │   ├── reception.webp                # Reception venue image
│   │   ├── dresscode.webp                # Attire guide illustration
│   │   ├── prenupp*.webp                 # Portrait gallery images (prenupp, prenupp1, ...)
│   │   ├── prenupl*.webp                 # Landscape gallery images (prenupl, prenupl1, ...)
│   │   ├── sakura-petal*.webp            # Petal images (3 variants)
│   │   ├── 06.webp, 25.webp, 26.webp     # "Save the Date" photos
│   │   └── love-story/
│   │       ├── story-1.jpg / .webp  ... story-6.jpg/.webp   # Love story images
│   ├── videos/
│   │   └── proposal.mp4                  # Proposal video (portrait orientation)
│   └── audio/
│       └── theme-song.mp3                # Background music
├── README.md               # This file
└── sql/
    └── setup.sql            # Supabase SQL script (optional – paste into SQL editor)
Getting Started
Prerequisites
A web browser (Chrome, Firefox, Safari, Edge)

Basic knowledge of HTML/CSS/JS

(For RSVP backend) A Supabase account and project

Local Development
Clone or download this repository.

Place all assets (images, video, audio) into the correct assets/ folders as listed above.

Open index.html directly in a browser – no build step required.
Note: The audio player will work; the RSVP form will fail until you set up a backend (see below).

For a better development experience, serve the files with a local server:

bash
npx serve .
or with Python:

bash
python -m http.server 8000
Configuration
Most configuration is done by editing HTML and JavaScript directly.

Wedding Date
In index.html (near the bottom), find and change the date:

js
const WEDDING = new Date('2026-06-25T15:00:00');
Supabase Credentials
Open admin.html and replace the placeholder credentials with your own:

js
const SUPABASE_URL = 'https://<your-project>.supabase.co';
const SUPABASE_ANON_KEY = 'eyJh...';
Security note: The anon key is safe to be in client‑side code when Row Level Security is properly configured. Never expose the service_role key.

Map Links
In index.html, the “Open in Maps” buttons currently point to Google Maps links for the ceremony and reception. Replace the onclick URLs with your actual venue addresses:

html
<button class="map-btn" onclick="window.open('https://maps.app.goo.gl/...', '_blank')">
Backend Setup
Supabase Database
Go to your Supabase project and open the SQL Editor.

Paste the contents of the provided sql/setup.sql (or the SQL snippet at the end of this README) and run it.

This will:

Create an rsvp table (if it doesn’t exist)

Convert the attending column to a proper BOOLEAN (from text)

Enable Row Level Security (RLS)

Create policies to allow anonymous inserts and authenticated reads/deletes/updates

Important: If you already have data in the attending column, the conversion will try to map 'yes' → TRUE, others → FALSE.

RSVP Form Implementation
The frontend RSVP form (script.js) currently submits data to POST /api/rsvp. You have two options:

Option A: Use a Supabase Edge Function (Recommended)
Create a Supabase Edge Function that inserts into the rsvp table.

Update the fetch URL in script.js to your function’s endpoint.

The edge function can use the service_role key to bypass RLS and insert directly.

Pros: Keeps your database logic server‑side, no need to expose anon key writes.

Option B: Insert directly from the frontend
Modify the RSVP form handler in script.js to use the Supabase client library (like in admin.html). Steps:

Include the Supabase SDK in index.html (add a <script> tag for @supabase/supabase-js).

In the form submit event, call:

js
await supabase.from('rsvp').insert([{ name, email, phone, message, attending }]);
Remove the existing fetch('/api/rsvp', ...) code.

Make sure the RLS policy “Allow anonymous inserts” is in place.

Pros: No extra backend needed, simpler deployment.
Cons: The anon key is used for writes; RLS must be correctly configured to prevent abuse.

Customization
Images & Media
Hero image: Replace assets/images/hero-couple.jpg and the WebP version.

Gallery images: Place your portrait photos as prenupp.webp, prenupp1.webp, ... and landscape photos as prenupl.webp, prenupl1.webp, ... (index up to 15). The script will automatically load and interleave them.

Love story: Replace story-1.jpg … story-6.jpg (and their WebP versions). Update the captions inside index.html (under “Love Story Section”) if needed.

Proposal video: Replace assets/videos/proposal.mp4 with your own portrait‑orientation video.

Audio: Replace assets/audio/theme-song.mp3 with your chosen track.

Styles & Typography
The site uses a pink‑and‑charcoal color scheme defined in CSS variables at the top of style.css:

css
:root {
    --sakura-pink: #ffb7c5;
    --sakura-dark: #ffb7c5;
    --soft-cream: #fff0f1;
    --japan-red: #bc3f2e;
    --gold-leaf: #d4af37;
    --dark-charcoal: #31231a;
}
Modify these to change the theme.

Typography is heavily overridden in a <style> block in index.html. Body text is forced to Inter, headings to EB Garamond. You can adjust these rules if you wish to use different fonts.

FAQ
Edit the FAQ items directly in index.html under the <div class="accordion">. Each question and answer is plain HTML.

Deployment
Since the project is purely static, you can host it on any static file server:

Netlify / Vercel: Drag and drop the project folder, or connect a Git repository.

GitHub Pages: Push the repository to a main branch and enable Pages in the settings.

FTP: Upload the files to any web host.

Remember to also deploy your backend (if using Edge Functions) separately. For Option B (direct Supabase insert), the backend is already taken care of.

Important Notes
Supabase Keys: The anon key in admin.html is safe to be public only if RLS policies are properly set. Always double‑check that authenticated users (the admin) can read/delete RSVPs, and that anonymous users can only insert. The admin panel uses Supabase auth (email/password) – create a user in the Supabase Authentication dashboard.

RSVP API: If you choose to use an external API, ensure it validates the data and handles CORS correctly.

Admin Panel: The admin login credentials are managed through Supabase Auth – you must create at least one user manually in the Supabase dashboard.

Attending Column Type: After running the SQL conversion, the attending column becomes BOOLEAN. The admin panel currently checks row.attending === 'yes' to display the status. You must update that check in admin.html to handle true/false. Example:

js
<td>${row.attending ? '✅ Yes' : '❌ No'}</td>
Performance: All images should be compressed and provided in WebP format for faster loading.

License
This project is intended for personal use. Feel free to modify and adapt for your own wedding. If you use it publicly, please credit the original creators.
