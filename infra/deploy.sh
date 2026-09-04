#!/usr/bin/env bash
#
# Prod serverda bajariladigan deploy skripti (GitHub Actions SSH orqali chaqiradi).
#
#   DEPLOY_PATH — loyiha katalogi serverda (masalan /var/www/my-stats-front)
#   FRONT_IMAGE — ghcr.io/<owner>/my-stats-front:latest
#   GHCR_USER   — GitHub actor
#   GHCR_TOKEN  — GITHUB_TOKEN (packages: read)

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:?DEPLOY_PATH kerak}"

echo ">> GHCR'ga kirish"
echo "${GHCR_TOKEN:?}" | docker login ghcr.io -u "${GHCR_USER:?}" --password-stdin

echo ">> Image'ni tortish"
docker pull "${FRONT_IMAGE:?}"
export FRONT_IMAGE

echo ">> Konteynerni yangilash"
cd "$DEPLOY_PATH/infra"
docker compose -p my-stats-front -f docker-compose.prod.yaml up -d --remove-orphans

echo ">> Eski image'larni tozalash"
# `docker system prune` QILMAYMIZ — serverdagi boshqa loyihalarga tegib ketadi.
# Muvaffaqiyatsiz bo'lsa ham DEPLOY'ni to'xtatmaymiz: bu faqat disk
# tozalash, konteyner allaqachon YANGILANGAN. Ketma-ket ikkita deploy
# (backend+frontend) bir vaqtda tozalasa Docker daemon ikkinchisini
# "a prune operation is already running" bilan rad etadi — muvaffaqiyatli
# deployni SOXTA "failed" qilib ko'rsatardi (haqiqiy holatda tekshirilgan).
docker image prune -af --filter "until=72h" || echo "   (prune band edi — o'tkazib yuborildi)"

echo ">> Deploy tugadi"
docker compose -p my-stats-front -f docker-compose.prod.yaml ps
