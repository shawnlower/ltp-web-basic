#!/usr/bin/python3

import os
import re
import socketserver
import urllib

from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler

PORT = 8000

class ModifiedHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.extra_headers = {
                'Access-Control-Allow-Origin': '*'
        }

        super().__init__(*args, **kwargs)

    def do_GET(self):
        """Serve a GET request."""

        cwd = os.readlink('/proc/{}/cwd'.format(os.getpid()))
        matches = re.match('(.*) (\(deleted\))', cwd)
        if matches:
            cwd_dirname = matches.groups()[0]
            print('cwd deleted; trying to chdir to', cwd_dirname)
            os.chdir(cwd_dirname)

        f = self.send_head()
        if f:
            try:
                self.copyfile(f, self.wfile)
            finally:
                f.close()

    def get_index(self, path='.'):
        for name in "index.html", "index.htm":
            index = os.path.join(path, name)
            if os.path.exists(index):
                return index


    def send_head(self):
        """Common code for GET and HEAD commands.
        This sends the response code and MIME headers.
        Return value is either a file object (which has to be copied
        to the outputfile by the caller unless the command was HEAD,
        and must be closed by the caller under all circumstances), or
        None, in which case the caller has nothing further to do.
        """
        f = None

        path = self.translate_path(self.path)

        print('request for {} ({})'.format(self.path, path))
        if os.path.isdir(path):
            """
            Handle directory
            """
            parts = urllib.parse.urlsplit(self.path)
            if not parts.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                new_parts = (parts[0], parts[1], parts[2] + '/',
                        parts[3], parts[4])
                new_url = urllib.parse.urlunsplit(new_parts)
                self.send_header("Location", new_url)
                self.end_headers()
                return None
            index = self.get_index(path)
            if index:
                path = self.path = index
            else:
                return self.list_directory(path)
        else:
            """
            Handle file path
            """
            if not path or not os.path.exists(path):
                # fall-back to index if not found
                if self.get_index(path):
                    path = self.path = self.get_index(path)
                else:
                    # try trimming the last component off
                    _path = '/'.join(path.split('/')[:-1])
                    path = self.get_index(_path)
                if path:
                    print('Using default index "{}" for {}'.format(
                        path, self.path))
                else:
                    # Non-existent path, and no index.html in root
                    self.send_error(HTTPStatus.NOT_FOUND,
                        "{} does not exist, and no index document available"\
                        " in /".format(self.path))
                    return None
        try:
            f = open(path, 'rb')
        except OSError as e:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR,
                    "Unable to retrieve file")
            print(str(e))
            return None
        ctype = self.guess_type(path)
        try:
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-type", ctype)
            for header in self.extra_headers:
                self.send_header(header, self.extra_headers[header])
            fs = os.fstat(f.fileno())
            self.send_header("Content-Length", str(fs[6]))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()
            return f
        except:
            f.close()
            raise



Handler = ModifiedHTTPRequestHandler

socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()

