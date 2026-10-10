import express from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import http from 'http';

const app = express();
const PORT = 3000;
const CPP_PORT = 9090;
const isProduction = process.env.NODE_ENV === 'production';

let cppProcess: ChildProcess | null = null;
let cppStartTime: number | null = null;
let cppStatus: 'running' | 'stopped' | 'failed' | 'starting' = 'starting';
let cppLogBuffer: string[] = [];

// Ensure C++ binary exists; compile if missing
function ensureCppBinary(): boolean {
  const binaryPath = path.resolve(process.cwd(), 'backend/bin/metamorphosis_server');
  if (!fs.existsSync(binaryPath)) {
    console.log('[Server] C++ binary not found. Compiling with make...');
    try {
      execSync('make -C backend', { stdio: 'inherit' });
      console.log('[Server] C++ compilation finished successfully.');
    } catch (err) {
      console.error('[Server] C++ compilation failed:', err);
      return false;
    }
  }
  return fs.existsSync(binaryPath);
}

// Start C++ HTTP daemon
function startCppServer() {
  const binaryPath = path.resolve(process.cwd(), 'backend/bin/metamorphosis_server');
  if (!ensureCppBinary()) {
    cppStatus = 'failed';
    return;
  }

  console.log(`[Server] Spawning C++ backend on port ${CPP_PORT}...`);
  cppStatus = 'starting';

  cppProcess = spawn(binaryPath, [String(CPP_PORT)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CPP_PORT: String(CPP_PORT),
      USERS_FILE_PATH: 'backend/data/users.dat',
    },
  });

  cppStartTime = Date.now();
  cppStatus = 'running';

  cppProcess.stdout?.on('data', (data) => {
    const text = data.toString();
    console.log(`[C++ Backend] ${text.trim()}`);
    cppLogBuffer.push(`[OUT] ${text.trim()}`);
    if (cppLogBuffer.length > 50) cppLogBuffer.shift();
  });

  cppProcess.stderr?.on('data', (data) => {
    const text = data.toString();
    console.error(`[C++ Backend ERR] ${text.trim()}`);
    cppLogBuffer.push(`[ERR] ${text.trim()}`);
    if (cppLogBuffer.length > 50) cppLogBuffer.shift();
  });

  cppProcess.on('exit', (code, signal) => {
    console.warn(`[Server] C++ backend exited with code ${code}, signal ${signal}`);
    cppStatus = 'stopped';
    cppProcess = null;
  });

  cppProcess.on('error', (err) => {
    console.error('[Server] Failed to run C++ process:', err);
    cppStatus = 'failed';
  });
}

// Ensure clean exit
function cleanup() {
  if (cppProcess) {
    console.log('[Server] Terminating C++ child process...');
    cppProcess.kill('SIGTERM');
    cppProcess = null;
  }
}
process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });
process.on('exit', cleanup);

// Forward HTTP requests to C++ backend
app.use('/api', (req, res) => {
  const targetUrl = new URL(req.originalUrl, `http://127.0.0.1:${CPP_PORT}`);

  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: CPP_PORT,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${CPP_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] Failed to proxy request to C++ backend (${req.method} ${req.originalUrl}):`, err.message);
    res.status(503).json({
      success: false,
      message: 'C++ backend service is currently initializing or unreachable. Please try again in a moment.',
      cppStatus,
      error: err.message,
    });
  });

  req.pipe(proxyReq);
});

async function startServer() {
  startCppServer();

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Metamorphosis] Gateway running on http://0.0.0.0:${PORT}`);
    console.log(`[Metamorphosis] Integrated with C++ Engine on port ${CPP_PORT}`);
  });
}

startServer();
