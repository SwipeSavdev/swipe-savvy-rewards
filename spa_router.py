#!/usr/bin/env python3
"""
SPA Router for SwipeSavvy Admin Portal
Serves index.html for all routes to enable client-side routing
"""

import os
import sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import mimetypes

class SPAHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Custom request handler that serves index.html for SPA routing"""
    
    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)
        
        # If it's a file that exists, serve it normally
        if os.path.isfile(path):
            return super().do_GET()
        
        # For directories and non-existent routes, serve index.html
        # This enables client-side routing
        index_path = os.path.join(self.directory, 'index.html')
        if os.path.isfile(index_path):
            self.path = '/index.html'
            return super().do_GET()
        
        # Fallback
        return super().do_GET()

def run_spa_server(host='127.0.0.1', port=5173, directory='dist'):
    """Run the SPA server"""
    os.chdir(directory)
    
    # Register common MIME types
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')
    mimetypes.add_type('image/svg+xml', '.svg')
    
    server_address = (host, port)
    handler_class = SPAHTTPRequestHandler
    
    httpd = HTTPServer(server_address, handler_class)
    print(f"🚀 SPA Server running at http://{host}:{port}")
    print(f"📁 Serving from: {os.getcwd()}")
    print("🔄 Client-side routing enabled (all routes serve index.html)")
    print("Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✅ Server stopped")
        sys.exit(0)

if __name__ == '__main__':
    # Determine directory
    dist_dir = Path(__file__).parent / 'swipesavvy-admin-portal' / 'dist'
    
    if not dist_dir.exists():
        print(f"❌ dist directory not found: {dist_dir}")
        sys.exit(1)
    
    run_spa_server(directory=str(dist_dir))
