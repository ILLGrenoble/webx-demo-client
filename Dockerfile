# stage1 as builder
FROM node:14-alpine as builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# stage2 package with nginx
FROM nginx:1.19.0-alpine

COPY nginx/default.conf /etc/nginx/conf.d/

RUN rm -rf /usr/share/nginx/html/*

# Copy from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]
