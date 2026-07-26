#!/usr/bin/env python3
"""Servidor HTTP con headers no-cache para desarrollo"""
import http.server
import socketserver
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

PORT = 8765
print(f"Servidor en http://127.0.0.1:{PORT}")
with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
    httpd.serve_forever()