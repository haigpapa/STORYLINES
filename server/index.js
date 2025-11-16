/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Initialize Gemini AI - API key is now secure on server side
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
}));

// CORS configuration - restrict in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CLIENT_URL || true) // Allow same-origin in production if CLIENT_URL not set
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Rate limiting - prevent API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 Gemini requests per minute
  message: 'Too many AI requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Gemini API proxy endpoint - streaming support
app.post('/api/gemini/generate', geminiLimiter, async (req, res) => {
  try {
    const { prompt, modelName = 'gemini-1.5-flash', stream = false } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    // Validate model name to prevent injection
    const allowedModels = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ];

    if (!allowedModels.includes(modelName)) {
      return res.status(400).json({ error: 'Invalid model name' });
    }

    // Generate content using Gemini API
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const text = result.text;
    res.json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);

    // Handle specific error types
    if (error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later.',
        retryAfter: 60,
      });
    }

    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key configuration' });
    }

    res.status(500).json({
      error: 'Failed to generate content',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Gemini API proxy endpoint with JSON schema
app.post('/api/gemini/generate-json', geminiLimiter, async (req, res) => {
  try {
    const { prompt, schema, modelName = 'gemini-1.5-flash' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!schema) {
      return res.status(400).json({ error: 'Schema is required for JSON generation' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    const allowedModels = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ];

    if (!allowedModels.includes(modelName)) {
      return res.status(400).json({ error: 'Invalid model name' });
    }

    // Generate JSON content using Gemini API
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      },
    });

    const text = result.text;

    // Parse JSON response
    try {
      const jsonData = JSON.parse(text);
      res.json({ data: jsonData });
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      res.status(500).json({
        error: 'Failed to parse AI response as JSON',
        rawText: text,
      });
    }
  } catch (error) {
    console.error('Gemini JSON API error:', error);

    if (error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later.',
        retryAfter: 60,
      });
    }

    if (error.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid API key configuration' });
    }

    res.status(500).json({
      error: 'Failed to generate JSON content',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Serve static files in production
if (IS_PRODUCTION) {
  const distPath = join(__dirname, '..', 'dist');

  // Serve static assets
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(join(distPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  if (!IS_PRODUCTION) {
    return res.status(404).json({ error: 'Not found - frontend should run on separate port in development' });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Secure API server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS enabled for: ${JSON.stringify(corsOptions.origin)}`);
  console.log(`🔑 API key configured: ${process.env.GEMINI_API_KEY ? '✅ Yes' : '❌ No'}`);
});

export default app;
