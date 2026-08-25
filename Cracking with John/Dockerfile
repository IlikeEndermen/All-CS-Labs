FROM php:8.2-apache

# Install MariaDB server and PDO MySQL extension
RUN apt-get update \
    && apt-get install -y mariadb-server \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# Copy application source
COPY web/ /var/www/html/

# Copy database dump for initialization inside the container
RUN mkdir -p /docker-entrypoint-initdb.d
COPY db_dump.sql /docker-entrypoint-initdb.d/db_dump.sql

# Copy startup script that will launch MySQL and Apache
COPY docker-start.sh /usr/local/bin/docker-start.sh
RUN chmod +x /usr/local/bin/docker-start.sh

# Set working directory
WORKDIR /var/www/html

# Ensure Apache serves from the correct directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf

# Basic hardening: run as www-data and restrict perms
RUN chown -R www-data:www-data /var/www/html && \
    find /var/www/html -type d -exec chmod 755 {} \; && \
    find /var/www/html -type f -exec chmod 644 {} \;

EXPOSE 80

# Use a custom CMD that starts MySQL, initializes the DB if needed, then runs Apache
CMD ["docker-start.sh"]
