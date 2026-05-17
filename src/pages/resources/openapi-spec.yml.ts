import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { branding } from '@/config/branding';

const templatePath = path.resolve('src/templates/openapi-spec.yml');

const buildHeader = (site: string) => {
  const siteLabel = site.replace(/^https?:\/\//, '');
  const sponsorLine = branding.showSponsor
    ? `    [![Maintainer - ${branding.companyName.replace(/ /g, '_')}](https://img.shields.io/badge/Maintainer-${encodeURIComponent(branding.companyName).replace(/%20/g, '_')}-555?style=flat&labelColor=1c1d28)](${branding.companyUrl})\n`
    : '';

  return `openapi: 3.0.0
info:
  title: ${branding.name} API
  description: >
    **API documentation for the [${branding.name}](${branding.repoUrl}) backend endpoints.**<br>
    _${branding.description}_
    <br><br>
    [![Website - ${siteLabel}](https://img.shields.io/badge/Website-${siteLabel.replace(/-/g, '--').replace(/\./g, '.')}-555?style=flat&logo=googlecloudstorage&logoColor=white&labelColor=1c1d28)](${site})
    [![GitHub - ${branding.name.replace(/ /g, '_')}](https://img.shields.io/badge/GitHub-${encodeURIComponent(branding.name).replace(/%20/g, '_')}-555?style=flat&logo=github&logoColor=white&labelColor=1c1d28)](${branding.repoUrl})
${sponsorLine}
  version: 1.0.0
  license:
    name: 'License: ${branding.copyrightLabel}'
    url: ${branding.repoUrl}/blob/master/LICENSE
  termsOfService: ${site}/about#terms-info
externalDocs:
  description: 'Source: GitHub'
  url: ${branding.repoUrl}
servers:
  - url: http://localhost:3001/api
    description: Local (Development)
  - url: http://localhost:3000/api
    description: Local (Production)
  - url: ${site}/api
    description: This Deployment
`;
};

export const GET: APIRoute = async () => {
  const site = process.env.SITE_URL || process.env.PUBLIC_SITE_URL || 'https://web-check.xyz';
  const template = await fs.readFile(templatePath, 'utf8');
  const [, rest = ''] = template.split(/^tags:\s*$/m);
  const body = buildHeader(site.replace(/\/$/, '')) + '\ntags:\n' + rest.replace(/^\r?\n/, '');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/yaml; charset=utf-8',
    },
  });
};
