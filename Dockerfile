FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json prisma.config.js ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache dumb-init openssl \
  && addgroup -S mirsaad \
  && adduser -S mirsaad -G mirsaad
COPY package*.json prisma.config.js ./
COPY prisma ./prisma
RUN npm ci --omit=dev --ignore-scripts \
  && npx prisma generate \
  && npm cache clean --force
COPY --from=build --chown=mirsaad:mirsaad /app/dist ./dist
COPY --chown=mirsaad:mirsaad server ./server
USER mirsaad
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
