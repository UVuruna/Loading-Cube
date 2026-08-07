"""Tumbler's playground launcher — `python main.py` and the browser opens.

WHY A SERVER AND NOT JUST A FILE. The renderer ships as ES modules with no
build step, which is what lets a website drop `src/` in and go. Browsers
refuse `import` over `file://` (CORS), so the demo needs an origin — this
serves the project folder on localhost and opens the page. Nothing is
installed and nothing leaves the machine.

Usage:
    python main.py               # serve and open the playground
    python main.py --no-browser  # serve only (for a headless check)
    python main.py --port 8123
"""

import argparse
import http.server
import socketserver
import sys
import threading
import webbrowser
from functools import partial
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
# NOT 8777: that is the Remote User server's own port (Applications/Remote
# User, server/config.py:78). Sharing it meant the playground refused to
# start whenever the owner's remote-control server was up — and, worse, the
# error invited whoever saw it to kill 'the other instance', which is
# exactly what happened once, taking his running RemoteUser with it. A demo
# must never contend for a port something real is listening on.
DEFAULT_PORT = 8814
PAGE = "demo/index.html"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler, minus the request log.

    A playground that prints a line per asset buries the one message that
    matters (the URL) under fifty. Errors still surface — `log_error` is
    untouched.
    """

    def log_message(self, fmt, *args):  # noqa: A003 - stdlib signature
        pass


def serve(port: int, open_browser: bool) -> int:
    handler = partial(QuietHandler, directory=str(PROJECT_ROOT))
    socketserver.TCPServer.allow_reuse_address = True
    try:
        server = socketserver.TCPServer(("127.0.0.1", port), handler)
    except OSError as exc:
        print(f"Cannot listen on port {port}: {exc}", file=sys.stderr)
        print("Another instance may already be running — try --port.", file=sys.stderr)
        return 1

    url = f"http://127.0.0.1:{port}/{PAGE}"
    print(f"Tumbler playground: {url}")
    print("Ctrl+C to stop.")
    if open_browser:
        threading.Timer(0.4, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve the Tumbler playground.")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--no-browser", action="store_true",
                        help="serve without opening a browser window")
    args = parser.parse_args()
    return serve(args.port, not args.no_browser)


if __name__ == "__main__":
    sys.exit(main())
