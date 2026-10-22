#!/usr/bin/env bash
# Подключение сайта matsakov-victor.com к уже работающему серверу (Ubuntu 24.04, рядом NoRandoms: nginx + certbot).
# Скрипт только добавляет: ключ деплоя GitHub Actions в authorized_keys пользователя deploy, папку сайта с заглушкой,
# конфиг второго сайта nginx, службу systemd mvcom-contact для обработчика формы (server/contact.js) с файлом переменных
# /etc/matsakov-victor.com/contact.env и правило sudo, чтобы деплой мог перезапускать эту службу без пароля.
# Не трогает: файрвол, другие сайты nginx, уже установленные пакеты (ставит только недостающие rsync / certbot) и чужой
# Node.js — Node 22 из NodeSource ставится, только если Node на сервере нет совсем. Повторный запуск безопасен,
# заполненный contact.env не перезаписывается.
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
CONTACT_SERVICE=mvcom-contact
CONTACT_UNIT="$SCRIPT_DIR/systemd/$CONTACT_SERVICE.service"
CONTACT_ENV_DIR=/etc/$DOMAIN
CONTACT_ENV="$CONTACT_ENV_DIR/contact.env"
# Тот же порт — в proxy_pass nginx-конфига и по умолчанию в server/lib.js; менять во всех трёх местах
CONTACT_PORT=3721

[[ $EUID -eq 0 ]] || { echo "Запускать через sudo" >&2; exit 1; }
[[ -n "$DEPLOY_PUBKEY" ]] || { echo "Первым аргументом нужен публичный ключ деплоя (строка из ~/.ssh/mvcom_deploy.pub)" >&2; exit 1; }
[[ "$DEPLOY_PUBKEY" == ssh-* ]] || { echo "Аргумент не похож на публичный ключ: должен начинаться с ssh-ed25519 или ssh-rsa" >&2; exit 1; }
[[ -f "$NGINX_CONF" ]] || { echo "Нет $NGINX_CONF — копируй папку deploy/ целиком" >&2; exit 1; }
[[ -f "$CONTACT_UNIT" ]] || { echo "Нет $CONTACT_UNIT — копируй папку deploy/ целиком" >&2; exit 1; }
command -v nginx >/dev/null || { echo "nginx не найден: значит NoRandoms отдаётся чем-то другим, второй сайт надо встраивать туда" >&2; exit 1; }
id -u "$DEPLOY_USER" >/dev/null 2>&1 || { echo "Нет пользователя $DEPLOY_USER" >&2; exit 1; }
grep -q 'sites-enabled' /etc/nginx/nginx.conf || { echo "nginx.conf не подключает sites-enabled/ — конфиг сайта нужно класть туда, куда смотрит include" >&2; exit 1; }

DEPLOY_GROUP=$(id -gn "$DEPLOY_USER")
HOME_DIR=$(getent passwd "$DEPLOY_USER" | cut -d: -f6)

# --- недостающие пакеты, без обновления уже установленных ----------------------------------------------------------
missing=()
for pkg in rsync certbot python3-certbot-nginx curl ca-certificates; do
    dpkg -s "$pkg" >/dev/null 2>&1 || missing+=("$pkg")
done
if (( ${#missing[@]} )); then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -q
    apt-get install -y -q --no-upgrade "${missing[@]}"
fi

# --- Node.js для обработчика формы: чужой Node не обновляем --------------------------------------------------------
if command -v node >/dev/null 2>&1; then
    NODE_BIN=$(command -v node)
    NODE_MAJOR=$("$NODE_BIN" -p 'process.versions.node.split(".")[0]')
    if (( NODE_MAJOR < 20 )); then
        echo "Найден Node.js $("$NODE_BIN" -v) ($NODE_BIN), обработчику формы нужен 20+. Сам не обновляю: от этого Node может зависеть NoRandoms." >&2
        echo "Решить вручную: обновить его или поставить отдельный Node 22 (например, в /opt) и вписать его путь в ExecStart юнита $CONTACT_SERVICE." >&2
        exit 1
    fi
else
    export DEBIAN_FRONTEND=noninteractive
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -q nodejs
    NODE_BIN=$(command -v node)
fi
command -v npm >/dev/null 2>&1 || { echo "Нет npm — он нужен деплою для 'npm ci' в $SITE_DIR/server" >&2; exit 1; }
echo "Node.js $("$NODE_BIN" -v) — $NODE_BIN"

# --- ключ GitHub Actions: ещё одна строка в authorized_keys, ключи NoRandoms остаются -------------------------------
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$HOME_DIR/.ssh"
touch "$HOME_DIR/.ssh/authorized_keys"
grep -qxF "$DEPLOY_PUBKEY" "$HOME_DIR/.ssh/authorized_keys" \
    || echo "$DEPLOY_PUBKEY" >> "$HOME_DIR/.ssh/authorized_keys"
chmod 600 "$HOME_DIR/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_GROUP" "$HOME_DIR/.ssh/authorized_keys"

# --- папки сайта: releases/<sha> + симлинк current, server/ для обработчика формы; владелец deploy --------------------
install -d -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$SITE_DIR" "$SITE_DIR/releases" "$SITE_DIR/server"
if [[ ! -e "$SITE_DIR/current" ]]; then
    install -d -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" "$SITE_DIR/releases/placeholder"
    printf '<!doctype html><html lang="ru"><meta charset="utf-8"><title>%s</title><p>Сервер настроен, ждём первый деплой.</p></html>\n' "$DOMAIN" \
        > "$SITE_DIR/releases/placeholder/index.html"
    chown "$DEPLOY_USER:$DEPLOY_GROUP" "$SITE_DIR/releases/placeholder/index.html"
    ln -sfn "releases/placeholder" "$SITE_DIR/current"
    chown -h "$DEPLOY_USER:$DEPLOY_GROUP" "$SITE_DIR/current"
fi

# --- обработчик формы: переменные (секреты, только root) и служба systemd ------------------------------------------
# Тот же набор переменных, что в server/.env.example репозитория; код службы кладёт первый деплой
install -d -m 755 "$CONTACT_ENV_DIR"
if [[ ! -f "$CONTACT_ENV" ]]; then
    cat > "$CONTACT_ENV" <<ENV
# Переменные обработчика формы $DOMAIN (server/contact.js), читает systemd ($CONTACT_SERVICE.service).
# Описание и значения по умолчанию — server/.env.example в репозитории. После правки: sudo systemctl restart $CONTACT_SERVICE
# Telegram: токен от @BotFather; chat_id — https://api.telegram.org/bot<ТОКЕН>/getUpdates после /start боту
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
# Почта (дубль заявки): SMTP ящика на домене (Beget: smtp.beget.com, 465, логин — полный адрес). Пусто — только Telegram
SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
MAIL_TO=
# Порт службы — тот же, что в proxy_pass nginx-конфига сайта
PORT=$CONTACT_PORT
ENV
    chmod 600 "$CONTACT_ENV"
fi
# Порт службы должен совпадать с proxy_pass nginx-конфига. Файл от прежней редакции скрипта мог быть без строки PORT
# (тогда код берёт 3721 по умолчанию) — дописываем явно; чужое значение не трогаем, только предупреждаем
if ! grep -q '^PORT=' "$CONTACT_ENV"; then
    printf '\n# Порт службы — тот же, что в proxy_pass nginx-конфига сайта\nPORT=%s\n' "$CONTACT_PORT" >> "$CONTACT_ENV"
elif [[ "$(grep '^PORT=' "$CONTACT_ENV" | tail -1 | cut -d= -f2 | tr -d '[:space:]')" != "$CONTACT_PORT" ]]; then
    echo "Внимание: в $CONTACT_ENV задан $(grep '^PORT=' "$CONTACT_ENV" | tail -1), а nginx проксирует на $CONTACT_PORT — форма получит 502." >&2
    echo "Выправить:  sudo sed -i 's/^PORT=.*/PORT=$CONTACT_PORT/' $CONTACT_ENV && sudo systemctl restart $CONTACT_SERVICE" >&2
fi
# Юнит из репозитория, путь к node — найденный выше (на сервере он может быть не /usr/bin/node)
sed "s|^ExecStart=.*|ExecStart=$NODE_BIN $SITE_DIR/server/contact.js|" "$CONTACT_UNIT" > "/etc/systemd/system/$CONTACT_SERVICE.service"
chmod 644 "/etc/systemd/system/$CONTACT_SERVICE.service"
systemctl daemon-reload
# Только включаем: запускать нечего, пока деплой не положил код; первый `systemctl restart` из deploy.yml её стартует
systemctl enable "$CONTACT_SERVICE.service"
if ! systemctl is-active --quiet "$CONTACT_SERVICE.service" && ss -ltn 2>/dev/null | grep -q ":$CONTACT_PORT "; then
    echo "Внимание: порт $CONTACT_PORT уже занят другим процессом — задать другой в $CONTACT_ENV (PORT=) и в proxy_pass nginx-конфига" >&2
fi

# Единственное, что GitHub Actions делает через sudo: перезапуск этой службы после загрузки нового кода (неинтерактивно, без пароля)
cat > /etc/sudoers.d/mvcom-deploy <<SUDO
$DEPLOY_USER ALL=(root) NOPASSWD: /usr/bin/systemctl restart $CONTACT_SERVICE.service
SUDO
chmod 440 /etc/sudoers.d/mvcom-deploy
visudo -cf /etc/sudoers.d/mvcom-deploy

# --- nginx: только свой файл сайта ----------------------------------------------------------------------------------
install -m 644 "$NGINX_CONF" "/etc/nginx/sites-available/$DOMAIN"
# Сервером по умолчанию (голый IP, незнакомый Host) nginx делает первый блок по алфавиту файлов sites-enabled, если нигде
# нет default_server. На этом сервере его нет, и «matsakov-victor.com» встал бы раньше «norandoms-*» — подключаем под именем
# zz-<домен>, чтобы поведение по умолчанию не изменилось. Если default_server объявлен — обычное имя. (-R: файлы там симлинки)
if grep -Rqs 'default_server' /etc/nginx/nginx.conf /etc/nginx/conf.d/ /etc/nginx/sites-enabled/; then
    ENABLED_NAME=$DOMAIN
    rm -f "/etc/nginx/sites-enabled/zz-$DOMAIN"
else
    ENABLED_NAME=zz-$DOMAIN
    rm -f "/etc/nginx/sites-enabled/$DOMAIN"
fi
ln -sfn "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$ENABLED_NAME"
nginx -t
systemctl reload nginx

cat <<MSG

Готово: nginx отдаёт заглушку $DOMAIN из $SITE_DIR/current (sites-enabled/$ENABLED_NAME), у пользователя $DEPLOY_USER добавлен ключ деплоя,
служба $CONTACT_SERVICE включена и стартует первым деплоем.
Проверка:  curl -sI -H 'Host: $DOMAIN' http://127.0.0.1/ | head -1   → HTTP/1.1 200 OK

Дальше:
1. Отпечаток сервера для переменной DEPLOY_KNOWN_HOSTS в GitHub:  ssh-keyscan -t ed25519 <IP>
2. Вписать токен бота, chat_id и SMTP:  sudo nano $CONTACT_ENV
3. Push в main (или workflow «Deploy» вручную) — сайт и обработчик появятся по IP, DNS ещё не нужен.
   Проверка обработчика:  curl -s -H 'Host: $DOMAIN' http://127.0.0.1/api/contact/health   → {"ok":true,"telegram":true,"mail":true}
   Журнал:  journalctl -u $CONTACT_SERVICE -n 20   (после правки $CONTACT_ENV: sudo systemctl restart $CONTACT_SERVICE)
4. В панели Beget направить A-записи $DOMAIN и www.$DOMAIN на IP этого сервера; дождаться 'dig +short $DOMAIN'.
5. Сертификат (автопродление уже настроено certbot для NoRandoms, новый домен просто добавится):
   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect -m <email> --agree-tos -n
MSG
