@echo off
title Oraculo Unificado - Servidor Local
echo.
echo  ========================================
echo   Oraculo Unificado - Servidor Local
echo  ========================================
echo.
echo  Abriendo en: http://localhost:8765
echo.
echo  Presiona Ctrl+C para detener.
echo.
cd /d "%~dp0"
python -m http.server 8765
pause