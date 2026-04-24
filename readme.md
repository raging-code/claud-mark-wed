💍 Claudine & Mark Wedding Website

A fully responsive single‑page wedding invitation website built with vanilla HTML, CSS, and JavaScript.
Features a dynamic image gallery, love story timeline, countdown timer, RSVP form with Supabase backend, and an admin panel for guest management – all wrapped in a soft Sakura theme.

📑 Table of Contents
✨ Features

🛠 Tech Stack

📁 Repository Structure

🚀 Getting Started

⚙️ Configuration

🔧 Backend Setup (RSVP & Admin)

🎨 Customization

🚢 Deployment

⚠️ Important Notes

📄 License

✨ Features
🎎 Hero image with animated floating Sakura petals
⏳ Countdown timer to the wedding day (June 25, 2026)
🎵 Background music player with play/pause, mute, and seek
📸 Prenup gallery – dynamic Swiper carousel auto‑loading images
💕 Love story cards with lightbox image viewer
🎥 Proposal video in a decorative frame
📍 Venue cards with Google Maps links
👗 Dress code & colour palette guide
📝 FAQ accordion for common wedding questions
✉️ RSVP form (submits to Supabase or a custom API)
🔐 Admin panel (login‑protected) to view and manage RSVPs
🌀 Scroll‑triggered animations throughout the page
📱 Fully responsive – mobile‑first design with special breakpoints

🛠 Tech Stack
Layer	Technology
Frontend	HTML5, CSS3, Vanilla JavaScript (ES6+)
Libraries	Bootstrap 5.3 (accordion, grid), Swiper 11 (gallery)
Icons	Bootstrap Icons, Font Awesome 6
Fonts	Google Fonts (Inter, EB Garamond, Cormorant Garamond, Playfair Display)
Backend	Supabase – PostgreSQL, Auth, Row Level Security
Hosting	Fully static – works with Netlify, Vercel, GitHub Pages, or any server
📁 Repository Structure
Folder layout of the project:

text
wedding-website/
├── index.html                Main invitation page
├── css/
│   └── style.css             All custom styles (1400+ lines)
├── js/
│   └── script.js             Audio player, Swiper, RSVP logic, animations
├── admin.html                Admin panel (login + RSVP manager)
├── assets/
│   ├── images/               All images (hero, banner, gallery, love story…)
│   ├── videos/
│   │   └── proposal.mp4      Portrait video
│   └── audio/
│       └── theme-song.mp3    Background music
├── setup.sql                 Supabase database setup script (optional)
└── README.md                 You are here
Note: The file rsvp.js originally provided contains only CSS for map buttons. Those styles are already in css/style.css. Double‑check any separate rsvp.js file – it should contain JavaScript, not CSS.

🚀 Getting Started
Prerequisites
✔ A modern web browser
✔ (Optional) Node.js to run a local server
✔ A Supabase account and project if you need the RSVP system

Local Development

Clone the repository
Run git clone https://github.com/your-username/your-wedding-repo.git and then cd your-wedding-repo.

Add your assets
Place all image, video, and audio files into the correct folders inside assets/.
Refer to the Customization section for exact file names.

Launch a local server
Opening index.html directly works, but the RSVP form requires a backend.
Use a simple HTTP server for full testing:
npx serve . or python -m http.server 8000.

Configure the backend
Proceed to Backend Setup to enable RSVP submissions and the admin panel.

⚙️ Configuration
Edit the following values directly in the source files.

Wedding Date
Find the script near the bottom of index.html and change the date:
const WEDDING = new Date('2026-06-25T15:00:00');

Supabase Credentials
In admin.html, replace the placeholder lines:
const SUPABASE_URL = 'https://<your-project-id>.supabase.co';
const SUPABASE_ANON_KEY = 'eyJh...'; (your public anon key)

Map Links
Update the onclick attributes of the “Open in Maps” buttons in index.html:
onclick="window.open('https://maps.app.goo.gl/YOUR_LINK', '_blank')"

Countdown Phrase
Inside the countdown banner (index.html) you can edit the line:
<span class="countdown-phrase">The beginning of forever starts in...</span>

🔧 Backend Setup (RSVP & Admin)
The RSVP system and admin panel use Supabase (PostgreSQL + Auth). Follow these steps to set it up.

1. Create a Supabase project
Go to supabase.com, create a new project, and note down the Project URL and anon (public) key.

2. Set up the database table
In the Supabase SQL Editor, execute the following statements (or use the file setup.sql):

Create the rsvp table, enable Row Level Security, create policies for anonymous inserts and authenticated access, and add an index.

CREATE TABLE IF NOT EXISTS rsvp ( ... );

ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON rsvp FOR INSERT WITH CHECK (true);

CREATE POLICY "auth_select" ON rsvp FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_delete" ON rsvp FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "auth_update" ON rsvp FOR UPDATE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_rsvp_created_at ON rsvp (created_at DESC);

3. Create an admin user
In your Supabase dashboard, go to Authentication → Users and add a new user. Use these credentials to log into admin.html.

4. Decide how RSVP data will be submitted

The frontend currently sends data to /api/rsvp. You have two options:

Option A (Recommended): Supabase Edge Function
Write a small serverless function that inserts into the rsvp table, then update the fetch URL in js/script.js to point to that function.

Option B: Insert directly from the frontend
Include the Supabase client library (@supabase/supabase-js) in index.html and change the RSVP handler to call
await supabase.from('rsvp').insert([{ name, email, phone, message, attending }]);.
Ensure the anon_insert policy is active. This exposes your anon key for writes, but Row Level Security keeps the table protected.

🎨 Customization
Images & Media

Replace the following files inside assets/ with your own media:

Hero image → hero-couple.jpg and its .webp version

Wedding banner → header-banner.webp

Gallery images → Portrait: prenupp.webp, prenupp1.webp … (up to index 15)
Landscape: prenupl.webp, prenupl1.webp … (up to index 15)

Love story images → story-1.jpg through story-6.jpg (inside love-story/ folder)

Save‑the‑date photos → 06.webp, 25.webp, 26.webp

Dress code illustration → dresscode.webp

Venue photos → ceremony.webp, reception.webp

Proposal video → proposal.mp4 (portrait orientation)

Theme song → theme-song.mp3

All images should be in WebP format for faster loading; fallback to .jpg is handled automatically.

Typography & Colours
The colour scheme is defined in css/style.css at the top using CSS variables.
You can modify --sakura-pink, --soft-cream, --dark-charcoal and others to match your theme.
The page also includes an inline <style> block in index.html that enforces Inter for body text and EB Garamond for headings – you may adjust or remove those rules.

FAQ
Edit the FAQ items directly in index.html – look for the <div class="accordion"> section. Each question is a button with class accordion-button.

Attire Guide
The recommended dress and colour swatches live inside .attire-card-c in index.html. Update the text and palette hex codes there.

🚢 Deployment
This is a 100% static site, so no special hosting is required.

Upload the entire project folder to any static host.

Set up redirects if you use a custom domain.

If you opted for a Supabase Edge Function, deploy that separately to your Supabase project.

Popular hosting options:

GitHub Pages – push to main branch and enable Pages in repo settings.

Netlify / Vercel – drag‑and‑drop or connect a Git repository.

FTP – upload files to your web hosting space.

⚠️ Important Notes
Supabase Anon Key: Safe to expose in client‑side code only because Row Level Security is enabled. Admin credentials are managed via Supabase Auth.

RSVP Form: The default script.js expects a backend endpoint /api/rsvp. You must implement it or switch to direct Supabase inserts (see Backend Setup).

Attending Column: After running the SQL script, the attending column becomes BOOLEAN. If you migrate from an earlier version that used text ('yes'/'no'), update the admin panel logic in admin.html from row.attending === 'yes' to row.attending ? '✅ Yes' : '❌ No'.

Performance: Compress all images and serve WebP. The gallery script attempts to load up to 30 images – keep file sizes small.

Swiper Gallery: The script auto‑detects prenupp*.webp and prenupl*.webp (up to index 15). If none are found, it uses placeholder picsum images.

Custom Domain: If you use your own domain, add it to the Supabase project’s allowed URLs to avoid CORS errors during admin login.

📄 License
This project is open‑source under the MIT License. Feel free to use, modify, and share it for your own wedding. Attribution is appreciated but not required.

