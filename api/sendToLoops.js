// api/sendToLoops.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { transactionalId, email, data } = req.body;

    const loopsRes = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer b7a8ef651c5cfa64cbd98540f95e6a1a',
      },
      body: JSON.stringify({ transactionalId, email, data }),
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