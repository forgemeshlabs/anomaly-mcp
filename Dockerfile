FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY src/ src/
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV ANOMALY_API_BASE=https://anomaly.forgemesh.io

ENTRYPOINT ["node", "dist/index.js"]
