"""Run Prompt Engine STUDIO locally with Python 3; no extra packages required."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import webbrowser

class StudioHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

root = Path(__file__).resolve().parent
server = None
for port in range(8765, 8790):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), partial(StudioHandler, directory=str(root)))
        break
    except OSError:
        continue
if server is None:
    raise SystemExit('No available local port. Close another Studio window and try again.')
url = f'http://127.0.0.1:{server.server_port}/'
print('Prompt Engine STUDIO v2.0\n' + url + '\nKeep this window open. Press Ctrl+C to stop.')
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
