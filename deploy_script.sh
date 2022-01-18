pm2 stop lectonet_frontend
cd /var/lib/pm2node/lectonet_frontend
npm install
cd /var/lib/pm2node/lectonet_frontend/preisrechner
npm install
npm run build
# git clean -f
# git clean -d -f
# git checkout main
pm2 delete lectonet_frontend
pm2 restart ecosystem.config.js
pm2 save