FROM node:20-alpine AS base
ENV NODE_ENV=production
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY .yarnrc.yml ./
COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .
RUN yarn build

FROM base AS production
WORKDIR /app
ENV TZ=Europe/Paris

COPY .yarnrc.yml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["yarn", "start"]
