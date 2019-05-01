from http.server import BaseHTTPRequestHandler, HTTPServer
import xgboost as xgb
import pandas as pd
import json

global bst_customer
global bst_fare

bst_customer = xgb.Booster()
bst_fare = xgb.Booster()

class MLServer(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        data = self.rfile.read(content_length)
        global bst_customer
        global bst_fare

        if self.path.startswith('/customer'):
            output = open("model_customer.bin", 'wb')
            output.write(data)
            output.close()
            bst_customer.load_model(fname="model_customer.bin")
        
        elif self.path.startswith('/fare'):
            output = open("model_fare.bin", 'wb')
            output.write(data)
            output.close()
            bst_fare.load_model(fname="model_fare.bin")
            print('updated')

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write("Model updated!".format(self.path).encode('utf-8'))
    
    def do_GET(self):
        content_length = int(self.headers['Content-Length'])
        data = json.loads(self.rfile.read(content_length))
        print(data)
        data = pd.DataFrame.from_dict(data)
        if self.path.startswith('/customer'):
            dtest = xgb.DMatrix(data)
            pred = bst_customer.predict(dtest)  
        elif self.path.startswith('/fare'):
            dtest = xgb.DMatrix(data)
            pred = bst_fare.predict(dtest)  

        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(str(pred).encode('utf-8'))


def run(server_class=HTTPServer, handler_class=MLServer, port=8888):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    try:
        print("Server running on PORT "+str(port))
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

run()
