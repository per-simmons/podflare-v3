// api/sendToLoops.js - Email notification handler
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const {
      transactionalId,
      email: destinationEmail,
      dataVariables = {}
    } = req.body;

    const {
      name,
      email,
      podcast,
      episodes,
      budget,
      referral,
      message
    } = dataVariables;

    // Extract first name from full name
    const firstName = name.split(' ')[0];

    const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
    if (!LOOPS_API_KEY) throw new Error('LOOPS_API_KEY not set');

    // First fetch: Send notification to PodFlare
    const loopsRes = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        transactionalId,
        email: destinationEmail,     // goes only to you
        dataVariables                // send everything else intact
      }),
    });

    if (!loopsRes.ok) {
      let err = {};
      try {
        err = await loopsRes.clone().json(); // Prevents double-read error
      } catch {
        err = { error: 'Loops error' };
      }
      return res.status(loopsRes.status).json(err);
    }

    // Second fetch: Send confirmation to the user
    const confirmationId = 'cma3xdpdk0z2t9w8ppmgbiimt';
    const confirmRes = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        transactionalId: confirmationId,
        email,     // send to the user
        dataVariables: { firstName }  // only pass firstName for this email
      }),
    });

    // Just log error if confirmation fails but don't block the response
    if (!confirmRes.ok) {
      console.error('Error sending confirmation email:', await confirmRes.clone().json().catch(() => 'Loops error'));
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}