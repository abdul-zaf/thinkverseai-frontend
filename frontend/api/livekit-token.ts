import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req: any, res: any) {
  const apiKey     = process.env.LIVEKIT_API_KEY;
  const apiSecret  = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return res.status(500).json({ error: 'LiveKit credentials not configured' });
  }

  const identity = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const room     = `pauls-pizza-${identity}`;

  const token = new AccessToken(apiKey, apiSecret, { identity, ttl: '1h' });
  token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  res.json({ token: await token.toJwt(), url: livekitUrl, room });
}