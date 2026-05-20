import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { loadExternalBrandingEnv } from './src/config/branding-env.js';

// Integrations
import svelte from '@astrojs/svelte';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Adapter
import nodeAdapter from '@astrojs/node';

await loadExternalBrandingEnv();

// Pre-load .env so values are available in this config, before Vite
const fileEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// Read an env var, preferring shell over .env, with a final fallback
const unwrapEnvVar = (varName, fallbackValue) =>
  process.env[varName] ?? fileEnv[varName] ?? fallbackValue;

// Determine the output mode (static or server). Mixed prerender supported in static mode
const output = unwrapEnvVar('OUTPUT', 'static');

// The FQDN of where the site is hosted (used for sitemaps & canonical URLs)
const site = unwrapEnvVar('SITE_URL', 'https://web-check.xyz');

// The base URL of the site (if serving from a subdirectory)
const base = unwrapEnvVar('BASE_URL', '/');
const brandName = unwrapEnvVar('PUBLIC_BRAND_NAME', 'Web Check');
const repoUrl = unwrapEnvVar('PUBLIC_BRAND_REPO_URL', 'https://github.com/emmolab/web-check');
const supportLabel = unwrapEnvVar('PUBLIC_BRAND_SOURCE_LABEL', 'Source');

// Should run the app in boss-mode (requires extra configuration)
const isBossServer = unwrapEnvVar('BOSS_SERVER', false);

// Initialize Astro integrations
const integrations = [svelte(), react(), sitemap()];
const adapter = nodeAdapter({ mode: 'middleware' });

// Print build information to console
console.log(
  `
[1m[35m Preparing to start build of ${brandName}.... [0m
`,
  `[35m[2mCompiling for "node" using "${output}" mode, ` +
    `to deploy to "${site}" at "${base}"[0m
`,
  `[2m[36m🛟 For documentation and support, visit: ${repoUrl} 
`,
  `💖 ${brandName} build source: ${supportLabel} → ${repoUrl}.[0m
`,
);

// Export Astro configuration
export default defineConfig({ output, base, integrations, site, adapter });
