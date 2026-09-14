module.exports = async function newsletter(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Méthode non autorisée.' });
  }

  const { email, firstName = '', consent, source = '', pageTitle = '', subscribedAt = '' } = req.body || {};
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

  if (!validEmail) return res.status(400).json({ message: 'Adresse email invalide.' });
  if (consent !== true) return res.status(400).json({ message: 'Le consentement est nécessaire pour vous inscrire.' });

  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhook) {
    return res.status(503).json({ message: 'La newsletter est en cours de connexion. Réessayez très bientôt.' });
  }

  try {
    const upstream = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEWSLETTER_WEBHOOK_SECRET ? { 'x-newsletter-secret': process.env.NEWSLETTER_WEBHOOK_SECRET } : {})
      },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        firstName: String(firstName || '').trim(),
        consent: true,
        source,
        pageTitle,
        subscribedAt: subscribedAt || new Date().toISOString(),
        origin: 'hossnadharma-site'
      })
    });

    if (!upstream.ok) {
      return res.status(502).json({ message: 'Le service d’inscription ne répond pas pour le moment.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Impossible de finaliser l’inscription pour le moment.' });
  }
};