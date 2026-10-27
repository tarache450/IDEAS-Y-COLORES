#!/usr/bin/env bash
TARGET_URL="https://ideasycoloresgt.site/"
LOG_FILE=".antigravity/logs/watchdog.log"
STATE_FILE=".antigravity/orca-state.json"
INTERVAL=60

echo "============================================================"
echo " [ORCA-SENTINEL-WATCHDOG] T2 ACTIVA - MONITOREANDO EN VIVO"
echo " Target: $TARGET_URL | Intervalo: ${INTERVAL}s"
echo "============================================================"

# Asegurar directorios de log
mkdir -p "$(dirname "$LOG_FILE")"

while true; do
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  # 1. Medir código HTTP y tiempo de respuesta
  METRICS=$(curl -o /tmp/iyc_body.html -s -L -w "%{http_code}|%{time_total}|%{ssl_verify_result}" "$TARGET_URL")
  HTTP_CODE=$(echo "$METRICS" | cut -d'|' -f1)
  TIME_TOTAL=$(echo "$METRICS" | cut -d'|' -f2)
  SSL_STATUS=$(echo "$METRICS" | cut -d'|' -f3)

  # 2. Verificar cabeceras de seguridad
  HEADERS=$(curl -s -I -L "$TARGET_URL")
  HAS_HSTS=$(echo "$HEADERS" | grep -i "Strict-Transport-Security" | wc -l | tr -d ' ')
  HAS_XFO=$(echo "$HEADERS" | grep -i "X-Frame-Options" | wc -l | tr -d ' ')
  HAS_NOSNIFF=$(echo "$HEADERS" | grep -i "X-Content-Type-Options" | wc -l | tr -d ' ')

  # 3. Verificar integridad de marca en el DOM (Anti-Defacement)
  BRAND_CHECK=$(grep -i -E "Ideas & Colores|Ideas y Colores" /tmp/iyc_body.html | wc -l | tr -d ' ')
  DOM_HASH=$(shasum -a 256 /tmp/iyc_body.html 2>/dev/null | awk '{print $1}' | cut -c1-12)
  if [ -z "$DOM_HASH" ]; then
    DOM_HASH=$(sha256sum /tmp/iyc_body.html 2>/dev/null | awk '{print $1}' | cut -c1-12)
  fi

  STATUS="HEALTHY"
  ALERTS=""

  if [ "$HTTP_CODE" != "200" ]; then
    STATUS="CRITICAL_DOWN"
    ALERTS="${ALERTS}[HTTP_ERR:$HTTP_CODE] "
  fi

  if [ "$SSL_STATUS" != "0" ]; then
    STATUS="SSL_WARNING"
    ALERTS="${ALERTS}[SSL_INVALID] "
  fi

  if [ "$BRAND_CHECK" -eq 0 ]; then
    STATUS="DEFACEMENT_OR_EMPTY_DOM"
    ALERTS="${ALERTS}[DOM_MUTATION_ALERT] "
  fi

  if [ "$HAS_HSTS" -eq 0 ] || [ "$HAS_XFO" -eq 0 ] || [ "$HAS_NOSNIFF" -eq 0 ]; then
    ALERTS="${ALERTS}[MISSING_SEC_HEADERS(HSTS:$HAS_HSTS,XFO:$HAS_XFO,NOSNIFF:$HAS_NOSNIFF)] "
  fi

  LOG_LINE="[$TIMESTAMP] STATUS=$STATUS | HTTP=$HTTP_CODE | LATENCY=${TIME_TOTAL}s | SSL=$SSL_STATUS | DOM_HASH=$DOM_HASH | ALERTS=${ALERTS:-NONE}"
  echo "$LOG_LINE" | tee -a "$LOG_FILE"

  # Actualizar estado para el Orquestador
  if [ -f "$STATE_FILE" ] && command -v jq >/dev/null 2>&1; then
    jq --arg st "$STATUS" --arg ts "$TIMESTAMP" '.live_status = $st | .last_updated = $ts' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
  fi

  sleep "$INTERVAL"
done
