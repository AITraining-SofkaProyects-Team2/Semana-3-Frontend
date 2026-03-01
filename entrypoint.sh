#!/bin/sh
set -e

# Default fallback if API_URL not provided
: "${API_URL:=https://api.example.com}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = { API_URL: "${API_URL}" };
EOF

exec nginx -g 'daemon off;'
