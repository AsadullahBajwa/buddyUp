FROM node:22-slim

# Mirror the repo layout: the API reads its version from the root package.json.
WORKDIR /app
COPY package.json ./

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./

ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_STORE=firestore
ENV OLLAMA_ENABLED=false

EXPOSE 8080

CMD ["node", "index.js"]
