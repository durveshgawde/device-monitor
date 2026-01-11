FROM node:18-alpine AS builder

WORKDIR /app/frontend

COPY package*.json ./
RUN npm ci

COPY tsconfig.json next.config.js tailwind.config.ts postcss.config.js ./
COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY types ./types
COPY utils ./utils

RUN npm run build

FROM node:18-alpine

WORKDIR /app/frontend

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public

EXPOSE 3000

CMD ["npm", "start"]
