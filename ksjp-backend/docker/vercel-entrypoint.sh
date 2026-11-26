#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

export APP_ENV="${APP_ENV:-production}"
export APP_DEBUG="${APP_DEBUG:-false}"
export LOG_CHANNEL="${LOG_CHANNEL:-stderr}"
export SESSION_DRIVER="${SESSION_DRIVER:-cookie}"
export CACHE_STORE="${CACHE_STORE:-array}"
export VIEW_COMPILED_PATH="/tmp/laravel-views"

mkdir -p /tmp/laravel-views /var/www/html/storage/framework/sessions /var/www/html/storage/framework/views /var/www/html/storage/framework/cache/data /var/www/html/storage/logs
chown -R www-data:www-data /tmp/laravel-views /var/www/html/storage /var/www/html/bootstrap/cache

if [ -z "${APP_KEY:-}" ]; then
  export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
fi

EXTERNAL_DB_URL="${DB_URL:-${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-${DATABASE_URL:-${POSTGRES_URL:-}}}}}"

if [ -n "$EXTERNAL_DB_URL" ] || { [ -n "${DB_HOST:-${POSTGRES_HOST:-}}" ] && [ "${DB_HOST:-${POSTGRES_HOST:-}}" != "127.0.0.1" ] && [ "${DB_HOST:-${POSTGRES_HOST:-}}" != "localhost" ]; }; then
  export DB_CONNECTION="${DB_CONNECTION:-pgsql}"
  export DB_SSLMODE="${DB_SSLMODE:-require}"

  if [ -n "$EXTERNAL_DB_URL" ]; then
    export DB_URL="$EXTERNAL_DB_URL"
  else
    export DB_HOST="${DB_HOST:-${POSTGRES_HOST:-}}"
    export DB_PORT="${DB_PORT:-5432}"
    export DB_DATABASE="${DB_DATABASE:-${POSTGRES_DATABASE:-postgres}}"
    export DB_USERNAME="${DB_USERNAME:-${POSTGRES_USER:-postgres}}"
    export DB_PASSWORD="${DB_PASSWORD:-${POSTGRES_PASSWORD:-}}"
  fi

  if [ "${KSJP_AUTO_MIGRATE:-true}" = "true" ]; then
    MIGRATED=false
    for attempt in 1 2 3; do
      echo "[ksjp-entrypoint] Running migrate --force (attempt ${attempt})..." >&2
      if php artisan migrate --force; then
        MIGRATED=true
        break
      fi
      sleep 2
    done

    if [ "$MIGRATED" = "true" ]; then
      HAS_KELAS=$(php -r '
        require "vendor/autoload.php";
        $app = require "bootstrap/app.php";
        $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        try { echo \App\Models\Kelas::count(); } catch (\Throwable $e) { echo "0"; }
      ')
      if [ "$HAS_KELAS" = "0" ]; then
        echo "[ksjp-entrypoint] Seeding initial KSJP dataset..." >&2
        php artisan db:seed --force || true
      fi
    else
      echo "[ksjp-entrypoint] WARNING: migrate failed after 3 attempts" >&2
    fi
  fi
else
  export DB_CONNECTION="sqlite"
  export DB_DATABASE="/tmp/ksjp.sqlite"
  if [ ! -f /tmp/ksjp.sqlite ]; then
    cp /var/www/html/database/ksjp-seed.sqlite /tmp/ksjp.sqlite
  fi
  chown www-data:www-data /tmp/ksjp.sqlite
  chmod 664 /tmp/ksjp.sqlite
fi

LISTEN_PORT="${PORT:-80}"
if [ "$LISTEN_PORT" != "80" ]; then
  sed -ri "s/Listen 80/Listen ${LISTEN_PORT}/g" /etc/apache2/ports.conf
  sed -ri "s/<VirtualHost \*:80>/<VirtualHost \*:${LISTEN_PORT}>/g" /etc/apache2/sites-available/000-default.conf
fi

exec apache2-foreground
