import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { loadExternalBrandingEnv } from './src/config/branding-env.js';

// Load environment variables from .env file
dotenv.config();
await loadExternalBrandingEnv();

// Create the Express app
const app = express();

const trustProxy = process.env.TRUST_PROXY;
if (trustProxy) {
  const parsed = /^\d+$/.test(trustProxy)
    ? parseInt(trustProxy, 10)
    : trustProxy === 'true'
      ? true
      : trustProxy === 'false'
        ? false
        : trustProxy;
  app.set('trust proxy', parsed);
}

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000; // The port to run the server on
const brandName = process.env.PUBLIC_BRAND_NAME || 'Web-Check';
const repoUrl = process.env.PUBLIC_BRAND_REPO_URL || 'https://github.com/emmolab/web-check';
const repoLabel = repoUrl.replace(/^https?:\/\//, '');
const logoPath =
  process.env.PUBLIC_BRAND_LOGO_PATH ||
  process.env.PUBLIC_BRAND_APP_ICON_PATH ||
  'https://cdn.as93.net/logo/web-check/w256';
const primaryColor = process.env.PUBLIC_BRAND_PRIMARY_COLOR || '#d6fb41';
const backgroundColor = process.env.PUBLIC_BRAND_BACKGROUND_COLOR || '#111211';
const backgroundLighterColor = process.env.PUBLIC_BRAND_BACKGROUND_LIGHTER_COLOR || '#3a3b3a';
const backgroundShadowColor = process.env.PUBLIC_BRAND_BG_SHADOW_COLOR || '#0f1620';
const API_DIR = '/api'; // Name of the dir containing the lambda functions
const dirPath = path.join(__dirname, API_DIR); // Path to the lambda functions dir
const guiPath = path.join(__dirname, 'dist', 'client');
const placeholderFilePath = path.join(__dirname, 'public', 'placeholder.html');
const errorFilePath = path.join(__dirname, 'public', 'error.html');
const handlers = {}; // Will store list of API endpoints
process.env.WC_SERVER = 'true'; // Tells middleware to return in non-lambda mode

const getCyberbroConsoleBaseUrl = (req) =>
  String(req?.query?.baseUrl || process.env.CYBERBRO_BASE_URL || 'http://cyberbro:5000/api')
    .replace(/\/$/, '')
    .replace(/\/api$/, '');

const rewriteCyberbroHtml = (html) =>
  html
    .replaceAll('href="/static/', 'href="/cyberbro/static/')
    .replaceAll('src="/static/', 'src="/cyberbro/static/')
    .replaceAll('content="api"', 'content="cyberbro/api"')
    .replaceAll('fetch(`/api/', 'fetch(`/cyberbro/api/')
    .replaceAll('fetch("/api/', 'fetch("/cyberbro/api/')
    .replaceAll("fetch('/api/", "fetch('/cyberbro/api/")
    .replaceAll("window.location.href='/results/", "window.location.href='/cyberbro/results/")
    .replaceAll('href="/results/', 'href="/cyberbro/results/')
    .replaceAll('href="/graph/', 'href="/cyberbro/graph/')
    .replaceAll("action=\"/export/", "action=\"/cyberbro/export/")
    .replaceAll("location.href='/'", "location.href='/cyberbro/'");

// Enable CORS
app.use(
  cors({
    origin: process.env.API_CORS_ORIGIN || '*',
  }),
);

// Define max requests within each time frame
const limits = [
  { timeFrame: 10 * 60, max: 100, messageTime: '10 minutes' },
  { timeFrame: 60 * 60, max: 250, messageTime: '1 hour' },
  { timeFrame: 12 * 60 * 60, max: 500, messageTime: '12 hours' },
];

// Construct a message to be returned if the user has been rate-limited
const makeLimiterResponseMsg = (retryAfter) => {
  const why =
    'This keeps the service running smoothly for everyone. ' +
    `You can get around these limits by running your own instance of ${brandName}.`;
  return `You've been rate-limited, please try again in ${retryAfter} seconds.\n${why}`;
};

// Create rate limiters for each time frame
const limiters = limits.map((limit) =>
  rateLimit({
    windowMs: limit.timeFrame * 1000,
    limit: limit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: makeLimiterResponseMsg(limit.messageTime) },
  }),
);

// If rate-limiting enabled, then apply the limiters to the /api endpoint
if (process.env.API_ENABLE_RATE_LIMIT === 'true') {
  app.use(API_DIR, limiters);
}

app.get(/^\/cyberbro\/static\/(.+)$/, async (req, res) => {
  try {
    const assetPath = req.params[0];
    const upstream = await fetch(`${getCyberbroConsoleBaseUrl(req)}/static/${assetPath}`);
    const body = await upstream.arrayBuffer();
    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.send(Buffer.from(body));
  } catch (error) {
    res.status(502).send(String(error?.message || error));
  }
});

app.get(/^\/cyberbro\/api\/(.+)$/, async (req, res) => {
  try {
    const upstreamPath = req.params[0];
    const upstream = await fetch(`${getCyberbroConsoleBaseUrl(req)}/api/${upstreamPath}`);
    const body = await upstream.arrayBuffer();
    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.send(Buffer.from(body));
  } catch (error) {
    res.status(502).send(String(error?.message || error));
  }
});

const proxyCyberbroHtml = async (req, res, pathName) => {
  try {
    const upstream = await fetch(`${getCyberbroConsoleBaseUrl(req)}${pathName}`);
    const html = await upstream.text();
    res.status(upstream.status).setHeader('content-type', 'text/html; charset=utf-8');
    res.send(rewriteCyberbroHtml(html));
  } catch (error) {
    res.status(502).send(String(error?.message || error));
  }
};

app.get('/cyberbro/results/:analysisId', async (req, res) => {
  await proxyCyberbroHtml(req, res, `/results/${req.params.analysisId}`);
});

app.get('/cyberbro/graph/:analysisId', async (req, res) => {
  await proxyCyberbroHtml(req, res, `/graph/${req.params.analysisId}`);
});

app.get('/cyberbro/export/:analysisId', async (req, res) => {
  try {
    const upstreamUrl = new URL(
      `${getCyberbroConsoleBaseUrl(req)}/export/${req.params.analysisId}`,
    );
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === 'baseUrl') continue;
      if (Array.isArray(value)) value.forEach((entry) => upstreamUrl.searchParams.append(key, String(entry)));
      else if (value !== undefined) upstreamUrl.searchParams.set(key, String(value));
    }
    const upstream = await fetch(upstreamUrl);
    const body = await upstream.arrayBuffer();
    res.status(upstream.status);
    for (const header of ['content-type', 'content-disposition']) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    res.send(Buffer.from(body));
  } catch (error) {
    res.status(502).send(String(error?.message || error));
  }
});

// Read and register each API function as an Express routes
fs.readdirSync(dirPath, { withFileTypes: true })
  .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.js'))
  .forEach(async (dirent) => {
    const routeName = dirent.name.split('.')[0];
    const route = `${API_DIR}/${routeName}`;
    // const handler = require(path.join(dirPath, dirent.name));

    const handlerModule = await import(path.join(dirPath, dirent.name));
    const handler = handlerModule.default || handlerModule;
    handlers[route] = handler;

    app.get(route, async (req, res) => {
      try {
        await handler(req, res);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  });

const renderTemplate = async (res, filePath, statusCode, contentHtml) => {
  const replacements = {
    BRAND_NAME: brandName,
    REPO_URL: repoUrl,
    REPO_LABEL: repoLabel,
    LOGO_PATH: logoPath,
    PRIMARY_COLOR: primaryColor,
    BACKGROUND_COLOR: backgroundColor,
    BACKGROUND_LIGHTER_COLOR: backgroundLighterColor,
    BACKGROUND_SHADOW_COLOR: backgroundShadowColor,
    CONTENT: contentHtml,
  };
  const template = await fs.promises.readFile(filePath, 'utf-8');
  const html = Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
    template,
  );
  res.status(statusCode).send(html);
};

const renderPlaceholderPage = async (res, msgId, logs) => {
  const errorMessages = {
    notCompiled:
      'Looks like the GUI app has not yet been compiled.<br />' +
      'Run <code>yarn build</code> to continue, then restart the server.',
    notCompiledSsrHandler:
      'Server-side rendering failed to initiate, as SSR handler not found.<br />' +
      'This can be fixed by running <code>yarn build</code>, then restarting the server.<br />',
    disabledGui:
      `${brandName} API is up and running!<br />Access the endpoints at ` +
      `<a href="${API_DIR}"><code>${API_DIR}</code></a>`,
  };
  const logOutput = logs ? `<div class="logs"><code>${logs}</code></div>` : '';
  const errorMessage = (errorMessages[msgId] || 'An mystery error occurred.') + logOutput;
  await renderTemplate(res, placeholderFilePath, 500, errorMessage);
};

const renderNotFoundPage = async (res) => {
  await renderTemplate(res, errorFilePath, 404, 'There was an error finding this route.');
};

// Create a single API endpoint to execute all lambda functions
app.get(API_DIR, async (req, res) => {
  const results = {};
  const { url } = req.query;
  const maxExecutionTime = process.env.PUBLIC_API_TIMEOUT_LIMIT || 60000;

  const executeHandler = async (handler, req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const mockRes = {
          status: () => mockRes,
          json: (body) => resolve({ body }),
        };
        await handler({ ...req, query: { url } }, mockRes);
      } catch (err) {
        reject(err);
      }
    });
  };

  const timeout = (ms, jobName = null) => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Timed out after ${ms / 1000} seconds${jobName ? `, when executing ${jobName}` : ''}`,
          ),
        );
      }, ms);
    });
  };

  const handlerPromises = Object.entries(handlers).map(async ([route, handler]) => {
    const routeName = route.replace(`${API_DIR}/`, '');

    try {
      const result = await Promise.race([
        executeHandler(handler, req, res),
        timeout(maxExecutionTime, routeName),
      ]);
      results[routeName] = result.body;
    } catch (err) {
      results[routeName] = { error: err.message };
    }
  });

  await Promise.all(handlerPromises);
  res.json(results);
});

// Skip the marketing homepage, for self-hosted users
app.use((req, res, next) => {
  if (req.path === '/' && process.env.BOSS_SERVER !== 'true' && !process.env.DISABLE_GUI) {
    return res.redirect(302, '/check');
  }
  next();
});

// Serve up the GUI - if build dir exists, and GUI feature enabled
if (process.env.DISABLE_GUI && process.env.DISABLE_GUI !== 'false') {
  app.get('/', async (req, res) => {
    renderPlaceholderPage(res, 'disabledGui');
  });
} else if (!fs.existsSync(guiPath)) {
  app.get('/', async (req, res) => {
    renderPlaceholderPage(res, 'notCompiled');
  });
} else {
  // GUI enabled, and build files present, let's go!!
  app.use(express.static('dist/client/'));
  app.use(async (req, res, next) => {
    const ssrHandlerPath = path.join(__dirname, 'dist', 'server', 'entry.mjs');
    import(ssrHandlerPath)
      .then(({ handler: ssrHandler }) => {
        ssrHandler(req, res, next);
      })
      .catch(async (err) => {
        renderPlaceholderPage(res, 'notCompiledSsrHandler', err.message);
      });
  });
}

// Anything left unhandled (which isn't an API endpoint), return a 404
app.use((req, res, next) => {
  if (!req.path.startsWith(`${API_DIR}/`)) {
    return void renderNotFoundPage(res);
  } else {
    next();
  }
});

// Print nice welcome message to user
const printMessage = () => {
  console.log(
    `\x1b[36m\n` +
      '    __      __   _         ___ _           _   \n' +
      '    \\ \\    / /__| |__ ___ / __| |_  ___ __| |__\n' +
      "     \\ \\/\\/ / -_) '_ \\___| (__| ' \\/ -_) _| / /\n" +
      '      \\_/\\_/\\___|_.__/    \\___|_||_\\___\\__|_\\_\\\n' +
      `\x1b[0m\n`,
    `\x1b[1m\x1b[32m🚀 ${brandName} is up and running at http://localhost:${port} \x1b[0m\n\n`,
    `\x1b[2m\x1b[36m🛟 For documentation and support, visit: ${repoUrl} \n`,
    `💖 Found ${brandName} useful? Review or adapt the source from ${repoUrl}.\x1b[0m`,
  );
};

// Create server
app.listen(port, () => {
  printMessage();
});
