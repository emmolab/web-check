#!/usr/bin/env bash
set -euo pipefail

cd /app

echo "[web-check] Preparing runtime build..."
yarn build --production

echo "[web-check] Starting app..."
exec yarn start
