FROM node:20.11.0-slim AS deps
LABEL maintainer="yoongjunquan@gmail.com"
WORKDIR /app
ADD . /app
RUN chmod -R 700 /app
# Install project dependencies
RUN npm install


FROM node:20.11.0-slim AS builder
LABEL maintainer="yoongjunquan@gmail.com"
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build


FROM node:20.11.0-slim AS runner
LABEL maintainer="yoongjunquan@gmail.com"
WORKDIR /app

RUN npm install pm2 -g
COPY --from=builder /app/build ./build
COPY package.json ./
RUN npm install --production

ARG ENVIRONMENT
ENV ENVIRONMENT=$ENVIRONMENT

# PORTS
EXPOSE 3000

# Expose Volume
VOLUME ["/app", "/app/node_modules/", "/app/storage/logs"]

CMD ["pm2", "start", "./build/server.js", "--no-daemon"]
