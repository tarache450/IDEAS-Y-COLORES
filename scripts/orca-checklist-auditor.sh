#!/usr/bin/env bash
LOG_FILE=".antigravity/logs/checklist.log"
STATE_FILE=".antigravity/orca-state.json"

echo "============================================================"
echo " [ORCA-CHECKLIST-AUDITOR] T3 ACTIVA - AUDITOR DE MOVIMIENTO"
echo "============================================================"

run_audit() {
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  FAILS=0
  echo -e "\n--- AUDITORÍA DE CHECKLIST Y MOVIMIENTO [$TIMESTAMP] ---" | tee -a "$LOG_FILE"

  # CHECK 1: Movimiento en Git y archivos modificados
  MODIFIED_COUNT=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "no-git")
  echo "[MOVIMIENTO GIT] Rama: $CURRENT_BRANCH | Archivos con movimiento: $MODIFIED_COUNT" | tee -a "$LOG_FILE"

  # CHECK 2: Fuga de archivos .env o secretos
  if git status --porcelain 2>/dev/null | grep -E "\.env$" >/dev/null; then
    echo "  [❌ FAIL] Archivo .env detectado en staging/working tree." | tee -a "$LOG_FILE"
    FAILS=$((FAILS + 1))
  else
    echo "  [✅ PASS] Higiene de secretos (.env protegido)." | tee -a "$LOG_FILE"
  fi

  # CHECK 3: Exposición de correo corporativo en texto plano
  PLAIN_EMAIL=$(grep -rnw --exclude-dir={node_modules,.git,dist,.antigravity,scripts} "gerencia@ideasycoloresgt.com" . 2>/dev/null | wc -l | tr -d ' ')
  if [ "$PLAIN_EMAIL" -gt 0 ]; then
    echo "  [⚠️ WARN] Correo gerencia@ideasycoloresgt.com hallado en texto plano ($PLAIN_EMAIL ocurrencias)." | tee -a "$LOG_FILE"
    FAILS=$((FAILS + 1))
  else
    echo "  [✅ PASS] Correo corporativo ofuscado contra bots." | tee -a "$LOG_FILE"
  fi

  # CHECK 4: Enlaces externos seguros (noopener noreferrer)
  UNSAFE_LINKS=$(grep -rn --exclude-dir={node_modules,.git,dist,.antigravity,scripts} 'target="_blank"' . 2>/dev/null | grep -v 'noopener' | wc -l | tr -d ' ')
  if [ "$UNSAFE_LINKS" -gt 0 ]; then
    echo "  [⚠️ WARN] $UNSAFE_LINKS enlaces target='_blank' sin rel='noopener noreferrer'." | tee -a "$LOG_FILE"
    FAILS=$((FAILS + 1))
  else
    echo "  [✅ PASS] Todos los enlaces externos tienen aislamiento noopener." | tee -a "$LOG_FILE"
  fi

  # CHECK 5: Presencia de escudo .htaccess o cabeceras de seguridad
  if [ -f ".htaccess" ] || [ -f "public/.htaccess" ]; then
    echo "  [✅ PASS] Archivo .htaccess de seguridad presente en el proyecto." | tee -a "$LOG_FILE"
  else
    echo "  [❌ FAIL] Falta archivo .htaccess en raíz o carpeta public/." | tee -a "$LOG_FILE"
    FAILS=$((FAILS + 1))
  fi

  # CHECK 6: Embudos de WhatsApp activos
  WA_LINKS=$(grep -rn --exclude-dir={node_modules,.git,dist,.antigravity,scripts} "wa.me" . 2>/dev/null | wc -l | tr -d ' ')
  if [ "$WA_LINKS" -gt 0 ]; then
    echo "  [✅ PASS] Flujo de conversión WhatsApp detectado ($WA_LINKS puntos de contacto)." | tee -a "$LOG_FILE"
  else
    echo "  [❌ FAIL] No se detectaron triggers de WhatsApp (wa.me) en el código." | tee -a "$LOG_FILE"
    FAILS=$((FAILS + 1))
  fi

  if [ "$FAILS" -eq 0 ]; then
    CL_STATUS="PASSED"
    echo ">>> RESULTADO GLOBAL CHECKLIST: ✅ PASSED (0 fallos)" | tee -a "$LOG_FILE"
  else
    CL_STATUS="ACTION_REQUIRED ($FAILS issues)"
    echo ">>> RESULTADO GLOBAL CHECKLIST: ⚠️ $CL_STATUS" | tee -a "$LOG_FILE"
  fi

  if command -v jq >/dev/null 2>&1; then
    jq --arg cs "$CL_STATUS" --arg ts "$TIMESTAMP" '.checklist_status = $cs | .last_updated = $ts' "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
  fi
}

# Ejecuta auditoría continua cada 30 segundos para detectar movimiento de archivos
while true; do
  run_audit
  sleep 30
done
