import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { AccessToken, AgentDispatchClient, RoomServiceClient } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ── LiveKit token endpoint ────────────────────────────────────────────────
app.get('/api/livekit-token', async (_req, res) => {
  const apiKey    = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
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
  await dispatchClient.createDispatch(room, '');

  const token = new AccessToken(apiKey, apiSecret, { identity, ttl: '1h' });
  token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  res.json({ token: await token.toJwt(), url: livekitUrl, room });
});

// ── Serve the built Vite frontend ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});