LOCKFILE=/var/lock/knex-migrate-lock
cd /usr/src/app/back
if [ ! -f $LOCKFILE ]; then
 npx knex migrate:latest && npx knex seed:run
 touch $LOCKFILE
fi
npm start

