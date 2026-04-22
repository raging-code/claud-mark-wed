// functions/api/rsvp.js – No external dependencies, uses native fetch

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

    // Only POST
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const formData = await request.formData();

    // Honeypot
    if (formData.get('website')) {
        return new Response(JSON.stringify({ error: 'Invalid submission' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Rate limiting (simple in-memory)
    const ip = request.headers.get('CF-Connecting-IP') ||
               request.headers.get('X-Forwarded-For')?.split(',')[0] ||
               'unknown';
    const now = Date.now();
    const RATE_LIMIT = 5;
    const WINDOW_MS = 60 * 1000;
    const rateMap = globalThis.__rateMap || new Map();
    globalThis.__rateMap = rateMap;
    const record = rateMap.get(ip) || { count: 0, firstRequest: now };
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
    rateMap.set(ip, record);

    // Get fields
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

    // Supabase REST API (no client library)
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase env vars');
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const insertData = {
        name,
        email,
        phone,
        message,
        attending: attending === 'yes'
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/rsvp`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(insertData)
    });

    if (!response.ok) {
        console.error('Supabase insert failed:', response.status, await response.text());
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