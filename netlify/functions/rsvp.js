// netlify/functions/rsvp.js
const { createClient } = require('@supabase/supabase-js');

// Simple in-memory rate limiter (resets on function cold start)
// For production, consider using Netlify Blobs or a KV store.
const rateLimitMap = new Map();
const RATE_LIMIT = 5;          // max 5 requests
const WINDOW_MS = 60 * 1000;   // per minute

// Sanitize input to prevent XSS and limit length
function sanitize(str) {
    if (!str) return '';
    return String(str)
        .replace(/[<>'"]/g, '')      // strip HTML tags and quotes
        .trim()
        .substring(0, 500);          // truncate
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

exports.handler = async (event) => {
    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Parse form data
    const formData = new URLSearchParams(event.body);

    // 1. Honeypot check
    if (formData.get('website')) {
        console.log('Bot detected via honeypot');
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid submission' })
        };
    }

    // 2. Rate limiting by IP
    const ip = event.headers['client-ip'] || 
               event.headers['x-forwarded-for']?.split(',')[0] || 
               'unknown';
    
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, firstRequest: now };
    
    if (now - record.firstRequest < WINDOW_MS) {
        if (record.count >= RATE_LIMIT) {
            return {
                statusCode: 429,
                body: JSON.stringify({ error: 'Too many requests. Please wait a minute.' })
            };
        }
        record.count++;
    } else {
        record.count = 1;
        record.firstRequest = now;
    }
    rateLimitMap.set(ip, record);

    // Clean up old entries every ~100 requests
    if (Math.random() < 0.01) {
        const expiry = now - WINDOW_MS;
        for (const [key, val] of rateLimitMap.entries()) {
            if (val.firstRequest < expiry) rateLimitMap.delete(key);
        }
    }

    // 3. Extract and sanitize fields
    const name = sanitize(formData.get('name'));
    const email = sanitize(formData.get('email'));
    const phone = sanitize(formData.get('phone') || '');
    const message = sanitize(formData.get('message') || '');
    const attending = sanitize(formData.get('attending'));

    // 4. Validation
    if (!name || !email || !attending) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name, email, and attendance are required.' })
        };
    }

    if (!isValidEmail(email)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Please provide a valid email address.' })
        };
    }

    // Validate attending value
    if (attending !== 'yes' && attending !== 'no') {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid attendance selection.' })
        };
    }

    // 5. Supabase insert (using service_role key for security)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // secure server-side key

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error' })
        };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
        .from('rsvp')
        .insert([{ name, email, phone, message, attending }]);

    if (error) {
        console.error('Supabase insert error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to save RSVP. Please try again later.' })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
    };
};