import { app } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { isGeminiConfigured } from './services/ai/geminiService.js';

const startServer = async () => {
  console.log('====================================================');
  console.log('       FESTIVA AI — CELEBRATION PLANNER API        ');
  console.log('         "Your Celebration, Powered by AI."         ');
  console.log('====================================================');

  // Attempt database connection
  const dbOk = await connectDB();
  if (!dbOk) {
    console.warn('[WARNING] MongoDB connection failed. Please ensure MongoDB is running.');
  }

  const geminiOk = isGeminiConfigured();
  if (geminiOk) {
    console.log('[AI Engine] Google Gemini SDK initialized with model:', ENV.GEMINI_MODEL);
  } else {
    console.log('[AI Engine] GEMINI_API_KEY is not set. Festiva curated planner engine active.');
  }

  const PORT = Number(process.env.PORT || ENV.PORT || 5000);

  const server = app.listen(PORT, () => {
    console.log(`[Festiva AI Backend] Server running on http://localhost:${PORT}`);
    console.log(`[Festiva AI Backend] Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful EADDRINUSE and server-level error handling
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error('----------------------------------------------------');
      console.error(`[FATAL ERROR] Port ${PORT} is already in use (EADDRINUSE).`);
      console.error(`Another instance of Festiva AI or another service is listening on port ${PORT}.`);
      console.error(`Solutions:`);
      console.error(`  1. Stop the existing process running on port ${PORT}.`);
      console.error(`  2. Or set a custom PORT in backend/.env (e.g., PORT=5001)`);
      console.error(`     and update frontend/vite.config.ts proxy target accordingly.`);
      console.error('----------------------------------------------------');
      process.exit(1);
    } else {
      console.error('[Festiva AI Backend] Unexpected server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  const handleExit = () => {
    console.log('\nGracefully shutting down Festiva AI server...');
    server.close(() => {
      console.log('Server stopped.');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
};

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
