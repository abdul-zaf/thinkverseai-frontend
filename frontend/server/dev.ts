import express from 'express';
import { AccessToken, AgentDispatchClient, RoomServiceClient } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3002;

app.get('/api/livekit-token', async (_req, res) => {
  const apiKey     = process.env.LIVEKIT_API_KEY;
  const apiSecret  = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return res.status(500).json({ error: 'LiveKit credentials not configured' });
  }

  const identity = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const room     = `thinkverse-${identity}`;

  // Create the room then dispatch exactly one agent to it
  const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
  await roomService.createRoom({ name: room });

  const dispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);
  const existing = await dispatchClient.listDispatches(room);
  if (existing.length === 0) {
    await dispatchClient.createDispatch(room, '');
  }

  const token = new AccessToken(apiKey, apiSecret, { identity, ttl: '1h' });
  token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  res.json({ token: await token.toJwt(), url: livekitUrl, room });
});

app.listen(PORT, () => {
  console.log(`Token server running on http://localhost:${PORT}`);
});
