#!/usr/bin/env bash
# Подключение сайта matsakov-victor.com к уже работающему серверу (Ubuntu 24.04, рядом NoRandoms: nginx + certbot).
# Скрипт только добавляет: ключ деплоя GitHub Actions в authorized_keys пользователя deploy, папку сайта с заглушкой,
# конфиг второго сайта nginx. Не трогает: файрвол, другие сайты nginx, уже установленные пакеты (ставит только недостающие
# rsync / certbot). Повторный запуск безопасен.
#
#   scp -r deploy deploy@<IP>:~/
#   ssh deploy@<IP>
#   sudo bash ~/deploy/server-setup.sh "<содержимое ~/.ssh/mvcom_deploy.pub с Mac>"
#
# HTTPS — отдельным шагом после того, как DNS укажет на сервер (команда в конце вывода).
set -euo pipefail

DOMAIN=matsakov-victor.com
SITE_DIR=/var/www/$DOMAIN
DEPLOY_USER=deploy
DEPLOY_PUBKEY="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_CONF="$SCRIPT_DIR/nginx/$DOMAIN.conf"

[[ $EUID -eq 0 ]] || { echo "Запускать через sudo" >&2; exit 1; }
[[ -n "$DEPLOY_PUBKEY" ]] || { echo "Первым аргументом нужен публичный ключ деплоя (строка из ~/.ssh/mvcom_deploy.pub)" >&2; exit 1; }
[[ "$DEPLOY_PUBKEY" == ssh-* ]] || { echo "Аргумент не похож на публичный ключ: должен начинаться с ssh-ed25519 или ssh-rsa" >&2; exit 1; }
[[ -f "$NGINX_CONF" ]] || { echo "Нет $NGINX_CONF — копируй папку deploy/ целиком" >&2; exit 1; }
command -v nginx >/dev/null || { echo "nginx не найден: значит NoRandoms отдаётся чем-то другим, второй сайт надо встраивать туда" >&2; exit 1; }
id -u "$DEPLOY_USER" >/dev/null 2>&1 || { echo "Нет пользователя $DEPLOY_USER" >&2; exit 1; }
grep -q 'sites-enabled' /etc/nginx/nginx.conf || { echo "nginx.conf не подключает sites-enabled/ — конфиг сайта нужно класть туда, куда смотрит include" >&2; exit 1; }

DEPLOY_GROUP=$(id -gn "$DEPLOY_USER")
HOME_DIR=$(getent passwd "$DEPLOY_USER" | cut -d: -f6)

# --- недостающие пакеты, без обновления уже установленных ----------------------------------------------------------
missing=()
for pkg in rsync certbot python3-certbot-nginx; do
    dpkg -s "$pkg" >/dev/null 2>&1 || missing+=("$pkg")
done
if (( ${#missing[@]} )); then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -q
    apt-get install -y -q --no-upgrade "${missing[@]}"
fi

# --- ключ GitHub Actions: ещё одна строка в authorized_keys, ключи NoRandoms остаются -------------------------------
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$HOME_DIR/.ssh"
touch "$HOME_DIR/.ssh/authorized_keys"
grep -qxF "$DEPLOY_PUBKEY" "$HOME_DIR/.ssh/authorized_keys" \
    || echo "$DEPLOY_PUBKEY" >> "$HOME_DIR/.ssh/authorized_keys"
chmod 600 "$HOME_DIR/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_GROUP" "$HOME_DIR/.ssh/authorized_keys"

# --- папка сайта: releases/<sha> + симлинк current, владелец deploy ------------------------------------------------
install -d -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$SITE_DIR" "$SITE_DIR/releases"
if [[ ! -e "$SITE_DIR/current" ]]; then
    install -d -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$SITE_DIR/releases/placeholder"
    printf '<!doctype html><html lang="ru"><meta charset="utf-8"><title>%s</title><p>Сервер настроен, ждём первый деплой.</p></html>\n' "$DOMAIN" \
        > "$SITE_DIR/releases/placeholder/index.html"
    chown "$DEPLOY_USER:$DEPLOY_GROUP" "$SITE_DIR/releases/placeholder/index.html"
    ln -sfn "releases/placeholder" "$SITE_DIR/current"
    chown -h "$DEPLOY_USER:$DEPLOY_GROUP" "$SITE_DIR/current"
fi

# --- nginx: только свой файл сайта ----------------------------------------------------------------------------------
install -m 644 "$NGINX_CONF" "/etc/nginx/sites-available/$DOMAIN"
ln -sfn "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t
systemctl reload nginx

cat <<MSG

Готово: nginx отдаёт заглушку $DOMAIN из $SITE_DIR/current, у пользователя $DEPLOY_USER добавлен ключ деплоя.
Проверка:  curl -sI -H 'Host: $DOMAIN' http://127.0.0.1/ | head -1   → HTTP/1.1 200 OK

Дальше:
1. Отпечаток сервера для переменной DEPLOY_KNOWN_HOSTS в GitHub:  ssh-keyscan -t ed25519 <IP>
2. Push в main (или workflow «Deploy» вручную) — сайт появится по IP, DNS ещё не нужен.
3. В панели Beget направить A-записи $DOMAIN и www.$DOMAIN на IP этого сервера; дождаться 'dig +short $DOMAIN'.
4. Сертификат (автопродление уже настроено certbot для NoRandoms, новый домен просто добавится):
   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect -m <email> --agree-tos -n
MSG
