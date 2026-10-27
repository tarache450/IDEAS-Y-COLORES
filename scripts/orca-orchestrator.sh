#!/usr/bin/env bash
STATE_FILE=".antigravity/orca-state.json"
WATCHDOG_LOG=".antigravity/logs/watchdog.log"
CHECKLIST_LOG=".antigravity/logs/checklist.log"

while true; do
  clear
  echo "======================================================================"
  echo " 🎯 ORCA MASTER ORCHESTRATOR [T1-ORCH] - IDEAS & COLORES"
  echo "======================================================================"
  if [ -f "$STATE_FILE" ]; then
    cat "$STATE_FILE"
  fi
  echo "----------------------------------------------------------------------"
  echo " 🛡️ ÚLTIMO REPORTE DE MONITOREO EN VIVO [T2-WATCHDOG]:"
  tail -n 3 "$WATCHDOG_LOG" 2>/dev/null || echo "Esperando telemetría de T2..."
  echo "----------------------------------------------------------------------"
  echo " 📋 ÚLTIMO REPORTE DE CHECKLIST Y MOVIMIENTO [T3-AUDITOR]:"
  tail -n 10 "$CHECKLIST_LOG" 2>/dev/null || echo "Esperando auditoría de T3..."
  echo "======================================================================"
  echo " Presiona Ctrl+C para salir del panel del Orquestador."
  sleep 10
done
