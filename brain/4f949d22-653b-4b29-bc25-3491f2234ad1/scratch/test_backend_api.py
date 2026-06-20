import urllib.request
import json

url = "http://localhost:8000/users/specialists"
headers = {
    "X-Tenant-ID": "00000000-0000-0000-0000-000000000001"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.status)
        data = json.loads(response.read().decode('utf-8'))
        print("Response data:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print("Failed to call API:", e)
