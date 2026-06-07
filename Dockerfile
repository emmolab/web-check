# Specify the Node.js version to use
ARG NODE_VERSION=22

# Specify the Debian version to use, the default is "bullseye"
ARG DEBIAN_VERSION=bullseye

# Use Node.js Docker image as the base image, with specific Node and Debian versions
FROM node:${NODE_VERSION}-${DEBIAN_VERSION} AS build

# Set the container's default shell to Bash and enable some options
SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

# Install Chromium and build tooling using distro packages only.
# This keeps multi-arch builds consistent and avoids amd64-only Chrome repo setup.
RUN apt-get -o Acquire::Retries=5 update -qq && \
    apt-get -o Acquire::Retries=5 -qqy --fix-missing --no-install-recommends install \
      chromium \
      traceroute \
      python-is-python3 \
      make \
      g++ && \
    rm -rf /var/lib/apt/lists/*

# Run the Chromium browser's version command and redirect its output to the /etc/chromium-version file
RUN /usr/bin/chromium --no-sandbox --version > /etc/chromium-version

# Set the working directory to /app
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Run yarn install to install dependencies and clear yarn cache
RUN apt-get update && \
    yarn install --frozen-lockfile --network-timeout 100000 && \
    rm -rf /app/node_modules/.cache

# Copy all files to working directory
COPY . .

# Run yarn build to build the application
RUN yarn build --production

# Final stage
FROM node:${NODE_VERSION}-${DEBIAN_VERSION}  AS final

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app .
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN apt-get -o Acquire::Retries=5 update && \
    apt-get -o Acquire::Retries=5 install -y --no-install-recommends chromium traceroute && \
    chmod 755 /usr/bin/chromium && \
    rm -rf /var/lib/apt/lists/* /app/node_modules/.cache

# Exposed container port, the default is 3000, which can be modified through the environment variable PORT
EXPOSE ${PORT:-3000}

# Point Chromium-using libs at the system binary, skip puppeteer's bundled download
ENV CHROME_PATH='/usr/bin/chromium' \
    PUPPETEER_EXECUTABLE_PATH='/usr/bin/chromium' \
    PUPPETEER_SKIP_DOWNLOAD='true'

LABEL org.opencontainers.image.title="Web-Check" \
      org.opencontainers.image.description="Self-hosted website intelligence and security inspection tool" \
      org.opencontainers.image.url="https://github.com/emmolab/web-check" \
      org.opencontainers.image.source="https://github.com/emmolab/web-check" \
      org.opencontainers.image.licenses="MIT"

# Build frontend assets from runtime env, then start the app
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
CMD ["/usr/local/bin/docker-entrypoint.sh"]
