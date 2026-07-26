@echo off
title Oraculo Unificado - Servidor WiFi (Movil)
echo.
echo  ========================================
echo   Oraculo Unificado - Acceso por WiFi
echo  ========================================
echo.
echo  Para acceder desde tu movil:
echo  1. Conecta el movil a la misma red WiFi que este PC
echo  2. Abre el navegador del movil
echo  3. Entra en la URL que aparece abajo
echo.
echo  Obteniendo IP de este PC...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    for /f "tokens=1 delims= " %%b in ("%%a") do (
        echo  URL: http://%%b:8765
    )
)
echo.
echo  Presiona Ctrl+C para detener.
echo.
cd /d "%~dp0"
python -m http.server 8765 --bind 0.0.0.0
pause