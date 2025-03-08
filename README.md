# AiSportNodejs

npm install
npm run db-seed
npm rebuild     ->      en caso de que no se instalen bien

.ENV

DB_USERNAME=root 
DB_PASSWORD=
DB_DATABASE=sporthub2.0 
DB_HOST=localhost 
DB_DIALECT=mysql 
DB_PORT=3306 
PORT = 3000

DATABASE_URL=${DB_DIALECT}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE} #LOCAL
DATABASE_URL=mysql://root:yxuUGeyyfCalXwTLIwkmhiRavFjxnYQw@yamanote.proxy.rlwy.net:59131/railway # CLOUD

NODE_ENV = local #WEB MODE
FRONTPORT = http://localhost:5173
DOMAIN = https://aisport.com
SENDGRID_API_KEY = SG.SwUWgAyNR-SADcgB4A9S-g.h6fmc8oGWgc9VD3q2q6WTP1LgVgddwnIZc2m9LwFV5o

------------------------------------------------------
Se necesita reemplazar la raiz, ya sea de C:\\ a E:\\
uploadPath = uploadPath.replace(/^C:\\C:\\/, 'C:\\'); // Reemplaza "C:\C:\" por "C:\"
