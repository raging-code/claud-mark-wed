// netlify/functions/rsvp.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Parse form data
  const formData = new URLSearchParams(event.body);
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone') || '';
  const message = formData.get('message') || '';
  const attending = formData.get('attending');

  // Validate required fields
  if (!name || !email || !attending) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: name, email, attending' })
    };
  }

  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Insert into database
  const { error } = await supabase
    .from('rsvp')
    .insert([{ name, email, phone, message, attending }]);

  if (error) {
    console.error('Supabase insert error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save RSVP. Please try again.' })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};