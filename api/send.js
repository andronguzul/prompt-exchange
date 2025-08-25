export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const { email, userType } = req.body || {};
    if (!email || !userType) {
      return res.status(400).json({ ok: false, error: 'Bad Request' });
    }

    // Send email to myself
    const adminResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Waitlist <no-reply@prioplotgames.com>',
        to: ['anpojda@gmail.com'],
        subject: 'New waitlist application',
        html: `<p>Newcomer email: ${email}; User type: ${userType}</p>`
      })
    });

    if (!adminResp.ok) {
      return res.status(500).json({ ok: false, error: 'Failed to register waitlist' });
    }

    // Send email to user
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Waitlist <no-reply@prioplotgames.com>',
        to: [email],
        subject: 'You were added to the waitlist!',
        html: '<p>Thank you for joining our waitlist! We\'ll notify you as soon as PromptExchange launches.</p>'
      })
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Server Error' });
  }
}