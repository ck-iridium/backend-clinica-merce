import os
import requests

url = "http://localhost:8000/settings/"
headers = {
    "X-Tenant-ID": "00000000-0000-0000-0000-000000000001",
    "Content-Type": "application/json"
}

# Let's try to fetch current settings
r = requests.get(url, headers=headers)
print("GET settings status:", r.status_code)
print("GET settings body:", r.json())

# Let's try to patch settings with booking_margin_hours = 0.25
payload = {
    "booking_margin_hours": 0.25
}
r_patch = requests.patch(url, headers=headers, json=payload)
print("\nPATCH settings status:", r_patch.status_code)
print("PATCH settings body:", r_patch.json())
