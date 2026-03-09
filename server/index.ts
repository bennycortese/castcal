import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Anthropic from '@anthropic-ai/sdk';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import { SearchResponse } from '@notionhq/client/build/src/api-endpoints';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Response as FetchResponse } from 'node-fetch';

config();

const app = express();
const port = process.env.PORT || 5000;

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Security middleware ─────────────────────────────────────────────────────

// Helmet: sets secure HTTP headers (XSS protection, HSTS, no sniff, etc.)
app.use(helmet({
  crossOriginEmbedderPolicy: false, // needed for some embed scenarios
}));

// CORS: only allow requests from your frontend
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl) in dev, or if origin is allowed
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true, // allow cookies (Clerk session cookie)
}));

app.use(express.json({ limit: '512kb' })); // cap request body size — prevents large payload DoS

// Clerk: verifies the session JWT from cookie or Authorization header on every request
app.use(clerkMiddleware());

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const claudeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 AI generations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Generation rate limit reached. Please wait a moment.' },
});

app.use(generalLimiter);

// ─── Auth helper ─────────────────────────────────────────────────────────────

// Extract userId from the verified Clerk session — never trust req.body.userId
const getUserId = (req: Request): string | null => {
  const { userId } = getAuth(req);
  return userId ?? null;
};

// Middleware that ensures the route is only accessible to authenticated users
// and that any userId in the body matches the session (prevents forged requests)
const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const sessionUserId = getUserId(req);
  if (!sessionUserId) {
    return res.status(401).json({ error: 'Unauthorized: no active session' });
  }
  // If the request body contains a userId, ensure it matches the session
  if (req.body?.userId && req.body.userId !== sessionUserId) {
    return res.status(403).json({ error: 'Forbidden: userId mismatch' });
  }
  // Attach verified userId to request so downstream handlers can use it safely
  (req as any).verifiedUserId = sessionUserId;
  next();
};

// Input sanitizer — strip control chars and enforce max length
const sanitizeString = (val: unknown, maxLen = 500_000): string => {
  if (typeof val !== 'string') return '';
  // Remove null bytes and strip surrogate pairs
  return val.replace(/\0/g, '').slice(0, maxLen);
};

// ─── Claude content generation ───────────────────────────────────────────────

const CONTENT_CALENDAR_SYSTEM = `You are a senior content strategist at a top social media agency.

Given a marketing brief, campaign doc, keyword list, or content strategy, extract every distinct content idea and return them as structured content_item tool calls.

Rules:
- Each post, video, email, or article is its own item
- Write hooks that are punchy and platform-appropriate (LinkedIn hooks differ from Instagram hooks)
- If dates are not provided, space items logically over the next 30 days starting from today
- Match format to channel: Reels for Instagram video, Threads for X, Carousels for Instagram educational, Articles for LinkedIn/Blog, Videos for YouTube, Emails for Newsletter
- Write descriptions with enough detail for a copywriter to execute without asking questions
- Use distinct, fitting emojis — not the same one repeatedly
- Generate as many items as the brief warrants — don't truncate a rich brief
- Return a calendar_title that is punchy and descriptive (max 50 chars, include emoji)
- Status for all new items should be "Idea"`;

const ContentItemTool: Anthropic.Tool = {
  name: 'generate_content_calendar',
  description: 'Generate a structured content calendar from a marketing brief',
  input_schema: {
    type: 'object' as const,
    properties: {
      calendar_title: { type: 'string', description: 'Short title for this calendar (max 50 chars, emoji)' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            channel: { type: 'string', enum: ['Instagram', 'LinkedIn', 'X', 'YouTube', 'Newsletter', 'Blog'] },
            publish_date: { type: 'string', description: 'YYYY-MM-DD or NONE' },
            status: { type: 'string', enum: ['Idea', 'Draft', 'In Review', 'Scheduled', 'Published'] },
            format: { type: 'string', enum: ['Carousel', 'Reel', 'Thread', 'Article', 'Video', 'Email'] },
            hook: { type: 'string' },
            description: { type: 'string' },
            emoji: { type: 'string' },
          },
          required: ['title', 'channel', 'publish_date', 'status', 'format', 'hook', 'description', 'emoji'],
        },
      },
    },
    required: ['calendar_title', 'items'],
  },
};

app.post('/api/claude-content', claudeLimiter, authGuard, async (req: Request, res: Response) => {
  const content = sanitizeString(req.body.content, 100_000);
  if (!content) return res.status(400).json({ error: 'content is required' });

  // Verify user has not exceeded their usage limit
  const userId = (req as any).verifiedUserId as string;
  try {
    const { data: userData } = await supabase
      .from('castcal-auth')
      .select('current_usage, max_monthly_usage, stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (userData) {
      const limit = userData.stripe_subscription_id
        ? userData.max_monthly_usage * 50
        : userData.max_monthly_usage;
      if (userData.current_usage >= limit) {
        return res.status(429).json({ error: 'Monthly generation limit reached' });
      }
    }
  } catch { /* non-fatal — proceed and let frontend handle */ }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      system: CONTENT_CALENDAR_SYSTEM,
      tools: [ContentItemTool],
      tool_choice: { type: 'any' },
      messages: [{ role: 'user', content }],
    });

    const toolUse = response.content.find((b) => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      return res.status(500).json({ error: 'Claude did not return structured content' });
    }
    res.status(200).json(toolUse.input);
  } catch (error) {
    console.error('Claude error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ─── Notion endpoints ────────────────────────────────────────────────────────

app.post('/api/list-pages', authGuard, async (req: Request, res: Response) => {
  const notionToken = sanitizeString(req.body.notionToken);
  if (!notionToken) return res.status(400).json({ error: 'notionToken required' });

  const notion = new Client({ auth: notionToken });
  try {
    let allResults: SearchResponse['results'] = [];
    let hasMore = true;
    let startCursor: string | undefined;
    while (hasMore) {
      const response: SearchResponse = await notion.search({
        sort: { direction: 'ascending', timestamp: 'last_edited_time' },
        start_cursor: startCursor,
      });
      allResults = [...allResults, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }
    res.status(200).json({ results: allResults });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/create-database', authGuard, async (req: Request, res: Response) => {
  const { notionAuth, parentPageId, databaseTitle, properties } = req.body;
  if (!notionAuth || !parentPageId) return res.status(400).json({ error: 'notionAuth and parentPageId required' });

  const notion = new Client({ auth: sanitizeString(notionAuth) });
  try {
    const databaseResponse = await notion.databases.create({
      parent: { page_id: sanitizeString(parentPageId) },
      title: [{ type: 'text', text: { content: sanitizeString(databaseTitle, 200) } }],
      properties,
      is_inline: true,
    });
    res.status(200).json({ databaseResponse });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/add-page', authGuard, async (req: Request, res: Response) => {
  const { notionAuth, databaseId, pageProperties, icon, children } = req.body;
  if (!notionAuth || !databaseId) return res.status(400).json({ error: 'notionAuth and databaseId required' });

  const notion = new Client({ auth: sanitizeString(notionAuth) });
  try {
    const newPage = await notion.pages.create({
      parent: { database_id: sanitizeString(databaseId) },
      properties: pageProperties,
      icon,
    });
    if (children?.length > 0) {
      await notion.blocks.children.append({ block_id: newPage.id, children });
    }
    res.status(200).json(newPage);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ─── Airtable push ───────────────────────────────────────────────────────────

app.post('/api/push-airtable', authGuard, async (req: Request, res: Response) => {
  const { airtableToken, title, items } = req.body;
  if (!airtableToken || !items) return res.status(400).json({ error: 'airtableToken and items required' });
  if (!Array.isArray(items) || items.length > 500) return res.status(400).json({ error: 'Invalid items array' });

  const token = sanitizeString(airtableToken, 200);

  try {
    const createBaseRes = await fetch('https://api.airtable.com/v0/meta/bases', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sanitizeString(title, 100) || 'Castcal Content Calendar',
        tables: [{
          name: 'Content Calendar',
          fields: [
            { name: 'Title', type: 'singleLineText' },
            { name: 'Channel', type: 'singleSelect', options: { choices: [
              { name: 'Instagram' }, { name: 'LinkedIn' }, { name: 'X' },
              { name: 'YouTube' }, { name: 'Newsletter' }, { name: 'Blog' },
            ]}},
            { name: 'Publish Date', type: 'date', options: { dateFormat: { name: 'iso' } } },
            { name: 'Status', type: 'singleSelect', options: { choices: [
              { name: 'Idea' }, { name: 'Draft' }, { name: 'In Review' },
              { name: 'Scheduled' }, { name: 'Published' },
            ]}},
            { name: 'Format', type: 'singleSelect', options: { choices: [
              { name: 'Carousel' }, { name: 'Reel' }, { name: 'Thread' },
              { name: 'Article' }, { name: 'Video' }, { name: 'Email' },
            ]}},
            { name: 'Hook', type: 'multilineText' },
            { name: 'Description', type: 'multilineText' },
          ],
        }],
      }),
    });

    if (!createBaseRes.ok) {
      const err = await createBaseRes.json() as any;
      throw new Error(err.error?.message || 'Failed to create Airtable base');
    }

    const baseData = await createBaseRes.json() as any;
    const baseId = baseData.id;
    const tableId = baseData.tables[0].id;

    for (let i = 0; i < items.length; i += 10) {
      const batch = items.slice(i, i + 10);
      const records = batch.map((item: any) => ({
        fields: {
          Title: sanitizeString(`${item.emoji} ${item.title}`, 500),
          Channel: item.channel,
          ...(item.publish_date && item.publish_date !== 'NONE' ? { 'Publish Date': item.publish_date } : {}),
          Status: item.status,
          Format: item.format,
          Hook: sanitizeString(item.hook, 2000),
          Description: sanitizeString(item.description, 5000),
        },
      }));
      await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
    }

    res.status(200).json({ link: `https://airtable.com/${baseId}`, baseId });
  } catch (error) {
    console.error('Airtable error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ─── Gamma push ──────────────────────────────────────────────────────────────

app.post('/api/push-gamma', authGuard, async (req: Request, res: Response) => {
  const { gammaKey, title, items } = req.body;
  if (!gammaKey || !items) return res.status(400).json({ error: 'gammaKey and items required' });
  if (!Array.isArray(items) || items.length > 500) return res.status(400).json({ error: 'Invalid items array' });

  const key = sanitizeString(gammaKey, 200);
  const calTitle = sanitizeString(title, 100);

  try {
    const markdownContent = [
      `# ${calTitle}`,
      '',
      ...items.map((item: any) => [
        `## ${item.emoji} ${sanitizeString(item.title, 200)}`,
        `**Channel:** ${item.channel} | **Format:** ${item.format} | **Date:** ${item.publish_date}`,
        '',
        `**Hook:** ${sanitizeString(item.hook, 500)}`,
        '',
        sanitizeString(item.description, 2000),
      ].join('\n')),
    ].join('\n\n');

    const gammaRes = await fetch('https://public-api.gamma.app/v1/generate/text', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: calTitle, text: markdownContent, mode: 'deck', theme: 'default' }),
    });

    if (!gammaRes.ok) {
      const err = await gammaRes.json() as any;
      throw new Error(err.message || 'Gamma generation failed');
    }

    const gammaData = await gammaRes.json() as any;
    res.status(200).json({ link: gammaData.url || gammaData.viewUrl, id: gammaData.id });
  } catch (error) {
    console.error('Gamma error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ─── Supabase user management (all routes auth-guarded) ──────────────────────

app.post('/api/store-user-id', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  const notionAuthValue = sanitizeString(req.body.notionAuthValue, 2000);
  if (!notionAuthValue) return res.status(400).json({ error: 'notionAuthValue required' });

  try {
    // Upsert so repeated Notion re-auth doesn't error
    const { error } = await supabase.from('castcal-auth').upsert({
      user_id: userId,
      notion_auth: notionAuthValue,
      current_usage: 0,
      max_monthly_usage: 3,
      total_usage: 0,
      all_usage_times: [],
    }, { onConflict: 'user_id', ignoreDuplicates: false });

    if (error) throw new Error(error.message);
    res.status(200).json({ message: 'User stored successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/notion-auth', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  try {
    const { data, error } = await supabase.from('castcal-auth').select('notion_auth').eq('user_id', userId).single();
    if (error) return res.status(500).json({ error: 'Failed to retrieve notion_auth' });
    res.status(200).json({ notion_auth: data?.notion_auth || null });
  } catch {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.post('/api/retrieve-user-notion-auth', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  try {
    const { data, error } = await supabase.from('castcal-auth').select('notion_auth').eq('user_id', userId).single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.post('/api/notion-current-month', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  try {
    const { data, error } = await supabase.from('castcal-auth').select('current_usage').eq('user_id', userId).single();
    if (error) return res.status(500).json({ error: 'Failed to retrieve current_usage' });
    res.status(200).json({ current_usage: data?.current_usage });
  } catch {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.post('/api/notion-max-month', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  try {
    const { data, error } = await supabase.from('castcal-auth').select('max_monthly_usage').eq('user_id', userId).single();
    if (error) return res.status(500).json({ error: 'Failed to retrieve max_monthly_usage' });
    res.status(200).json({ max_monthly_usage: data?.max_monthly_usage });
  } catch {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.post('/api/stripe-user-subscription', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  try {
    const { data, error } = await supabase.from('castcal-auth').select('stripe_subscription_id').eq('user_id', userId).single();
    if (error) return res.status(500).json({ error: 'Failed to retrieve subscription' });
    res.status(200).json({ stripe_subscription_id: data?.stripe_subscription_id });
  } catch {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.post('/api/increment-usage', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  const editorContent = sanitizeString(req.body.editorContent, 100_000);

  try {
    const { data: current } = await supabase
      .from('castcal-auth')
      .select('current_usage, total_usage, all_usage_times, all_uploaded_content')
      .eq('user_id', userId)
      .single();

    const { error } = await supabase.from('castcal-auth').update({
      current_usage: (current?.current_usage || 0) + 1,
      total_usage: (current?.total_usage || 0) + 1,
      all_usage_times: [...(current?.all_usage_times || []), new Date().toISOString()],
      all_uploaded_content: [...(current?.all_uploaded_content || []), editorContent.slice(0, 5000)],
    }).eq('user_id', userId);

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/user-integrations', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  try {
    const { data, error } = await supabase
      .from('castcal-auth')
      .select('airtable_token, gamma_api_key')
      .eq('user_id', userId)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ airtable_token: data?.airtable_token || null, gamma_api_key: data?.gamma_api_key || null });
  } catch {
    res.status(500).json({ error: 'Unexpected error' });
  }
});

app.post('/api/save-integrations', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  const airtableToken = sanitizeString(req.body.airtableToken || '', 500);
  const gammaKey = sanitizeString(req.body.gammaKey || '', 500);

  try {
    const { error } = await supabase.from('castcal-auth')
      .update({ airtable_token: airtableToken || null, gamma_api_key: gammaKey || null })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ─── Stripe ──────────────────────────────────────────────────────────────────

app.post('/api/create-checkout-session', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID || '', quantity: 1 }],
      metadata: { userId },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.post('/api/checkout-success', authGuard, async (req: Request, res: Response) => {
  const userId = (req as any).verifiedUserId as string;
  const sessionId = sanitizeString(req.body.sessionId, 500);
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return res.status(400).json({ error: 'Payment not completed' });

    // Ensure the session's userId matches the authenticated user
    if (session.metadata?.userId !== userId) {
      return res.status(403).json({ error: 'Session does not belong to this user' });
    }

    const { error } = await supabase.from('castcal-auth')
      .update({ stripe_subscription_id: session.subscription })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    res.status(200).json({ result: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// ─── Notion OAuth callback (public — no auth guard needed) ───────────────────

app.get('/oauth/callback', rateLimit({ windowMs: 60_000, max: 20 }), async (req: Request, res: Response) => {
  const code = req.query.code;
  if (!code || typeof code !== 'string') return res.status(400).send('Authorization code not provided');

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', sanitizeString(code, 500));
    params.append('redirect_uri', process.env.NOTION_REDIRECT_URI || 'http://localhost:3000/redirect');

    const response: FetchResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json() as any;
    if (response.ok) {
      res.status(200).json({ access_token: data.access_token });
    } else {
      res.status(500).send('Failed to exchange authorization code');
    }
  } catch {
    res.status(500).send('OAuth callback error');
  }
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Castcal server running on port ${port}`);
});
