#!/usr/bin/python

import SimpleHTTPServer
import SocketServer

PORT = 8080

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.xhtml': 'application/vnd.hbbtv.xhtml+xml; charset=utf-8',
});

httpd = SocketServer.TCPServer(("0.0.0.0", PORT), Handler)

print "Serving at port", PORT
httpd.serve_forever()
