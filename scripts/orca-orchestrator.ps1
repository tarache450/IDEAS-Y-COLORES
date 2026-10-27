$StateFile = ".antigravity/orca-state.json"
$WatchdogLog = ".antigravity/logs/watchdog.log"
$ChecklistLog = ".antigravity/logs/checklist.log"

while ($true) {
    Clear-Host
    Write-Host "======================================================================"
    Write-Host " 🎯 ORCA MASTER ORCHESTRATOR [T1-ORCH] - IDEAS & COLORES"
    Write-Host "======================================================================"
    if (Test-Path $StateFile) {
        Get-Content $StateFile -Raw
    }
    Write-Host "----------------------------------------------------------------------"
    Write-Host " 🛡️ ÚLTIMO REPORTE DE MONITOREO EN VIVO [T2-WATCHDOG]:"
    if (Test-Path $WatchdogLog) {
        Get-Content $WatchdogLog -Tail 3
    } else {
        Write-Host "Esperando telemetría de T2..."
    }
    Write-Host "----------------------------------------------------------------------"
    Write-Host " 📋 ÚLTIMO REPORTE DE CHECKLIST Y MOVIMIENTO [T3-AUDITOR]:"
    if (Test-Path $ChecklistLog) {
        Get-Content $ChecklistLog -Tail 10
    } else {
        Write-Host "Esperando auditoría de T3..."
    }
    Write-Host "======================================================================"
    Write-Host " Presiona Ctrl+C para salir del panel del Orquestador."
    Start-Sleep -Seconds 10
}
