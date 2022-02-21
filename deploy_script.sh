pm2 stop lectonet_frontend
pm2 delete lectonet_frontend
cd /var/lib/pm2node/lectonet_frontend
npm install
cd /var/lib/pm2node/lectonet_frontend/preisrechner
npm install --production=false
npm run build
cd /var/lib/pm2node/lectonet_frontend/contactform
npm install --production=false
npm run build
cd /var/lib/pm2node/lectonet_frontend/bewerbungsformular
npm install --production=false
npm run build
cd /var/lib/pm2node/lectonet_frontend
# git clean -f
# git clean -d -f
# git checkout main
pm2 restart ecosystem.config.js
pm2 save