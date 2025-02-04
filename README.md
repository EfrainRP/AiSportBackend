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

DATABASE_URL=`${DB_DIALECT}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`