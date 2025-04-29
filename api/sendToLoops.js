// api/sendToLoops.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const {
      transactionalId,
      email,
      name,
      podcast,
      episodes,
      budget,
      referral,
      message
    } = req.body;
    
    const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
    if (!LOOPS_API_KEY) throw new Error('LOOPS_API_KEY not set');

    const DESTINATION = 'pat@persimmons.studio';

    const loopsRes = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({ 
        transactionalId, 
        email: DESTINATION,
        dataVariables: {
          name,
          email,
          podcast,
          episodes,
          budget,
          referral,
          message
        }
      }),
    });

    if (!loopsRes.ok)
      return res
        .status(loopsRes.status)
        .json(await loopsRes.json().catch(() => ({ error: 'Loops error' })));

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}