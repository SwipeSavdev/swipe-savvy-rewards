#!/usr/bin/env python3
"""
Simple HTTP server with SPA routing support
Routes all requests to index.html for client-side routing
"""
import os
import sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler

class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)
        
        # If the path doesn't exist or is a directory, serve index.html
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = '/index.html'
        
        return super().do_GET()
    
    def end_headers(self):
        # Add cache control headers to prevent caching of index.html
        if self.path == '/index.html' or self.path == '/':
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    # Change to dist directory
    dist_dir = Path(__file__).parent / 'dist'
    os.chdir(dist_dir)
    
    port = 5173
    bind_addr = '0.0.0.0'  # Allow access from any interface (LAN access)
    server = HTTPServer((bind_addr, port), SPAHandler)
    print(f'🚀 Serving {dist_dir} on http://0.0.0.0:{port}')
    print(f'   Local: http://127.0.0.1:{port}')
    print(f'   LAN: http://192.168.1.142:{port}')
    print('Press Ctrl+C to stop')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n✅ Server stopped')
        sys.exit(0)
