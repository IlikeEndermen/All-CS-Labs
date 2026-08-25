#!/bin/bash
set -e

# Start MariaDB server
service mysql start

# Wait for MariaDB to be ready
until mysqladmin ping -uroot --silent >/dev/null 2>&1; do
  echo "[startup] Waiting for MariaDB to be ready..."
  sleep 1
done

# Initialize database if it does not exist yet
if ! mysql -uroot -e 'USE john_challenge;' >/dev/null 2>&1; then
  echo "[startup] Initializing john_challenge database from dump..."
  mysql -uroot < /docker-entrypoint-initdb.d/db_dump.sql

  # Create restricted application user matching config.php defaults
  mysql -uroot -e "CREATE USER IF NOT EXISTS 'website_user'@'127.0.0.1' IDENTIFIED BY 'change_me';"
  mysql -uroot -e "GRANT ALL PRIVILEGES ON john_challenge.* TO 'website_user'@'127.0.0.1'; FLUSH PRIVILEGES;"
fi

# Export DB connection settings so config.php uses the in-container DB
export DB_HOST=127.0.0.1
export DB_NAME=john_challenge
export DB_USER=website_user
export DB_PASS=change_me

# Finally, start Apache (through the php image's default command)
exec apache2-foreground
