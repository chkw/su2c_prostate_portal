import tornado.ioloop
import tornado.web
import tornado.httpserver
import sys

if __name__ == "__main__":
    application = tornado.web.Application([
        (r"/(.*)", tornado.web.StaticFileHandler, {"path": "./"}),
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(sys.argv[1])
    tornado.ioloop.IOLoop.instance().start()
