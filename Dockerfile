# syntax=docker/dockerfile:1
#
# my-stats frontend — Next.js standalone image.
#
# NEXT_PUBLIC_* qiymatlari BUILD vaqtida kerak: ular klient bundle'iga inline
# bo'ladi, ya'ni konteynerni ishga tushirishda o'zgartirib bo'lmaydi.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* package-lock.json* ./
# Lock fayl bilan aynan mos o'rnatish (npm ci lock'siz ishlamaydi).
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=https://stats.chatx.uz/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
