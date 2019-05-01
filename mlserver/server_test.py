import requests
import json

url = 'http://localhost:8888'
data = open('customer.model', 'rb').read()
res = requests.post(url=url+'/customer',
                    data=data,
                    headers={'Content-Type': 'application/octet-stream'})
dtest = {'passenger_count': [100], 'trip_distance': [100], 'RatecodeID': [100], 'fare_amount': [100], 'extra': [100], 'mta_tax': [100], 'tip_amount': [100], 'tolls_amount': [100], 'improvement_surcharge': [100], 'total_amount': [100], 'Count': [100]}

res = requests.get(url=url+'/customer',
                    data=json.dumps(dtest),
                    headers={'Content-Type': 'application/json'})
print(res.text)
