# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

ARG VITE_APP_BASE_API_URL
ARG VITE_APP_FIRE_BASE_CONFIG

ENV VITE_APP_BASE_API_URL=$VITE_APP_BASE_API_URL
ENV VITE_APP_FIRE_BASE_CONFIG=$VITE_APP_FIRE_BASE_CONFIG

RUN yarn build

# Stage 2: Production environment
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]