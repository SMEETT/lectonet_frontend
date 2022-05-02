pm2 kill
cd /var/lib/pm2node/lectonet_strapi
pm2 start ecosystem.config.js
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
cd /var/lib/pm2node/lectonet_frontend/bewerbungsformular_2
npm install --production=false
npm run build
cd /var/lib/pm2node/lectonet_frontend
# git clean -f
# git clean -d -f
# git checkout main
pm2 start ecosystem.config.js
pm2 save