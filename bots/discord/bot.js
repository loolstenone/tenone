require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

// ── Config ──────────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const COLLECT_API_URL = process.env.COLLECT_API_URL || 'http://localhost:3000/api/trendhunter/collect';
const API_KEY = process.env.TRENDHUNTER_API_KEY || '';

// Channels to watch (empty = all text channels)
const WATCH_CHANNELS = [];

// Topic mapping: channel name → topic code
const CHANNEL_TOPICS = {
  'ai': 'ai_tech',
  'tech': 'ai_tech',
  'business': 'business',
  'startup': 'business',
  'trend': 'trend',
  'general': 'general',
};

// Buffer for batch sending
let messageBuffer = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 60_000; // 1 minute

// ── Discord Client ──────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Mindle Discord Crawler online as ${c.user.tag}`);
  console.log(`   Watching: ${WATCH_CHANNELS.length > 0 ? WATCH_CHANNELS.join(', ') : 'all channels'}`);
  console.log(`   API: ${COLLECT_API_URL}`);
  console.log(`   Batch size: ${BATCH_SIZE}, flush interval: ${FLUSH_INTERVAL_MS / 1000}s`);
});

client.on(Events.MessageCreate, async (msg) => {
  // Skip bots and empty messages
  if (msg.author.bot) return;
  if (!msg.content && msg.attachments.size === 0) return;

  // Channel filter
  const channelName = msg.channel.name || '';
  if (WATCH_CHANNELS.length > 0 && !WATCH_CHANNELS.includes(channelName)) return;

  // Skip very short messages (likely reactions/emojis)
  if (msg.content.length < 5 && msg.attachments.size === 0) return;

  // Determine topic from channel name
  let topic = 'general';
  for (const [keyword, code] of Object.entries(CHANNEL_TOPICS)) {
    if (channelName.toLowerCase().includes(keyword)) {
      topic = code;
      break;
    }
  }

  // Build message content (include attachment URLs)
  let content = msg.content;
  if (msg.attachments.size > 0) {
    const attachmentUrls = msg.attachments.map((a) => a.url).join('\n');
    content += '\n[Attachments]\n' + attachmentUrls;
  }

  // Add to buffer
  messageBuffer.push({
    source: 'discord',
    room: `${msg.guild?.name || 'DM'}#${channelName}`,
    topic,
    sender: msg.author.displayName || msg.author.username,
    title: null,
    message: content,
    url: msg.url,
    content_type: 'text',
    metadata: {
      guild_id: msg.guild?.id,
      channel_id: msg.channel.id,
      message_id: msg.id,
      attachments: msg.attachments.size,
      reactions: 0,
    },
    timestamp: msg.createdAt.toISOString(),
  });

  // Flush if buffer is full
  if (messageBuffer.length >= BATCH_SIZE) {
    await flushBuffer();
  }
});

async function flushBuffer() {
  if (messageBuffer.length === 0) return;

  const items = [...messageBuffer];
  messageBuffer = [];

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

    const res = await fetch(COLLECT_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ items }),
    });

    const data = await res.json();
    console.log(`📦 Flushed ${items.length} messages → inserted: ${data.inserted}, errors: ${data.errors || 0}`);
  } catch (err) {
    console.error('❌ Flush error:', err.message);
    // Put items back in buffer for retry
    messageBuffer.unshift(...items);
  }
}

// Periodic flush
setInterval(flushBuffer, FLUSH_INTERVAL_MS);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await flushBuffer();
  client.destroy();
  process.exit(0);
});

// ── Start ───────────────────────────────────────────
if (!DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is required. Set it in .env');
  process.exit(1);
}

client.login(DISCORD_TOKEN);
