// functions/api/rsvp.js
import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map();
const RATE_LIMIT = 5;          // max 5 requests
const WINDOW_MS = 60 * 1000;   // per minute

function sanitize(str) {
    if (!str) return '';
    return String(str)
        .replace(/[<>'"]/g, '')
        .trim()
        .substring(0, 500);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequest(context) {
    const { request, env } = context;

    // Only accept POST
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Parse form data
    const formData = await request.formData();

    // Honeypot check
    if (formData.get('website')) {
        return new Response(JSON.stringify({ error: 'Invalid submission' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Rate limiting by IP (Cloudflare provides CF-Connecting-IP)
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For')?.split(',')[0] || 
               'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, firstRequest: now };
    if (now - record.firstRequest < WINDOW_MS) {
        if (record.count >= RATE_LIMIT) {
            return new Response(JSON.stringify({ error: 'Too many requests. Please wait a minute.' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        record.count++;
    } else {
        record.count = 1;
        record.firstRequest = now;
    }
    rateLimitMap.set(ip, record);

    // Clean up old entries occasionally
    if (Math.random() < 0.01) {
        const expiry = now - WINDOW_MS;
        for (const [key, val] of rateLimitMap.entries()) {
            if (val.firstRequest < expiry) rateLimitMap.delete(key);
        }
    }

    // Extract and sanitize fields
    const name = sanitize(formData.get('name'));
    const email = sanitize(formData.get('email'));
    const phone = sanitize(formData.get('phone') || '');
    const message = sanitize(formData.get('message') || '');
    const attending = sanitize(formData.get('attending'));

    // Validation
    if (!name || !email || !attending) {
        return new Response(JSON.stringify({ error: 'Name, email, and attendance are required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!isValidEmail(email)) {
        return new Response(JSON.stringify({ error: 'Please provide a valid email address.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (attending !== 'yes' && attending !== 'no') {
        return new Response(JSON.stringify({ error: 'Invalid attendance selection.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Supabase insert (use SERVICE_ROLE key for server-side)
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables');
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
        .from('rsvp')
        .insert([{ name, email, phone, message, attending: attending === 'yes' }]);

    if (error) {
        console.error('Supabase insert error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save RSVP. Please try again later.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}