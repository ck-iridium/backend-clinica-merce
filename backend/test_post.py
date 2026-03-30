import urllib.request
import json

data = json.dumps({
    "name": "test",
    "service_id": "dummy_id",
    "total_sessions": 5,
    "price": 10
}).encode('utf-8')

req = urllib.request.Request("http://localhost:8000/voucher_templates/", data=data, headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as res:
        print("STATUS:", res.getcode())
        print("CONTENT:", res.read().decode())
except urllib.error.HTTPError as e:
    print(e)
    print(e.read().decode())
except Exception as e:
    print(e)
