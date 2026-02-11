FROM nginx:alpine

# Cài đặt Node.js để debug/test
RUN apk add --no-cache nodejs npm curl
COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html
EXPOSE 80
