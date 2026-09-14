module.exports = async function newsletter(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Méthode non autorisée.' });
  }

  const { email, firstName = '', consent, source = '', pageTitle = '', subscribedAt = '' } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedFirstName = String(firstName || '').trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  if (!validEmail) return res.status(400).json({ message: 'Adresse email invalide.' });
  if (consent !== true) return res.status(400).json({ message: 'Le consentement est nécessaire pour vous inscrire.' });

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);

  if (!apiKey || !Number.isInteger(listId) || listId <= 0) {
    return res.status(503).json({ message: 'La newsletter est en cours de connexion. Réessayez très bientôt.' });
  }

  try {
    const upstream = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        email: normalizedEmail,
        ...(normalizedFirstName ? { attributes: { FIRSTNAME: normalizedFirstName } } : {}),
        listIds: [listId],
        updateEnabled: true
      })
    });

    if (!upstream.ok) {
      const details = await upstream.json().catch(() => ({}));
      console.error('Brevo newsletter error', upstream.status, details);
      return res.status(502).json({ message: 'Le service d’inscription ne répond pas pour le moment.' });
    }

    console.log('Newsletter signup', {
      email: normalizedEmail,
      source,
      pageTitle,
      subscribedAt: subscribedAt || new Date().toISOString()
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Newsletter signup failure', error);
    return res.status(500).json({ message: 'Impossible de finaliser l’inscription pour le moment.' });
  }
};