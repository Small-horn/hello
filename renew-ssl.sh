#!/bin/bash
# SSL 证书自动续期脚本

# 续期证书
certbot renew --quiet

# 如果证书更新了，重新复制并重启 nginx
if [[ $? -eq 0 ]]; then
    cp /etc/letsencrypt/live/www.wsl66.top/fullchain.pem docker/nginx/ssl/cert.pem
    cp /etc/letsencrypt/live/www.wsl66.top/privkey.pem docker/nginx/ssl/key.pem
    docker-compose restart nginx
fi
