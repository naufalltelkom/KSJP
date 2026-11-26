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
    NEEDS_SETUP=$(php -r '
      require "vendor/autoload.php";
      $app = require "bootstrap/app.php";
      $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
      try {
        $diskCount = count(glob(database_path("migrations/*.php")) ?: []);
        $ranCount = \Illuminate\Support\Facades\DB::table("migrations")->count();
        if ($ranCount < $diskCount) {
          echo "1";
          exit;
        }
        $u = \App\Models\User::count();
        $j = \App\Models\JadwalPelajaran::count();
        $k = \App\Models\KalenderAkademik::count();
        echo ($u < 31 || $j === 0 || $k === 0) ? "1" : "0";
      } catch (\Throwable $e) {
        echo "1";
      }
    ' || echo "1")

    if [ "$NEEDS_SETUP" = "1" ]; then
      (
        php -r '
          require "vendor/autoload.php";
          $app = require "bootstrap/app.php";
          $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
          $kernel->bootstrap();

          $locked = false;
          try {
            $res = \Illuminate\Support\Facades\DB::selectOne("SELECT pg_try_advisory_lock(772026) AS locked");
            $locked = (bool) ($res->locked ?? false);
          } catch (\Throwable $e) {
            $locked = true;
          }

          if (! $locked) {
            fwrite(STDERR, "[ksjp-entrypoint] Another container holds migration lock; skipping.\n");
            exit(0);
          }

          try {
            fwrite(STDERR, "[ksjp-entrypoint] Running migrate --force under advisory lock...\n");
            $kernel->call("migrate", ["--force" => true]);
            fwrite(STDERR, $kernel->output());

            $u = \App\Models\User::count();
            $j = \App\Models\JadwalPelajaran::count();
            $k = \App\Models\KalenderAkademik::count();
            if ($u < 31 || $j === 0 || $k === 0) {
              fwrite(STDERR, "[ksjp-entrypoint] Seeding initial KSJP dataset...\n");
              $kernel->call("db:seed", ["--force" => true]);
              fwrite(STDERR, $kernel->output());
            }
          } finally {
            try {
              \Illuminate\Support\Facades\DB::statement("SELECT pg_advisory_unlock(772026)");
            } catch (\Throwable $e) {}
          }
        '
      ) >&2 &
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
