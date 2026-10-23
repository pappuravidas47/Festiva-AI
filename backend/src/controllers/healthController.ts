import { Request, Response } from 'express';
import { isDBConnected } from '../config/db.js';
import { isGeminiConfigured } from '../services/ai/geminiService.js';

export const getHealth = async (req: Request, res: Response): Promise<void> => {
  const dbStatus = isDBConnected();
  const geminiStatus = isGeminiConfigured();

  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'healthy' : 'degraded',
    service: 'Festiva AI API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbStatus,
      status: dbStatus ? 'ready' : 'disconnected',
    },
    ai: {
      geminiEngineAvailable: geminiStatus,
      mode: geminiStatus ? 'live-genai' : 'curated-template-fallback',
    },
    version: '1.0.0',
  });
};
