import urllib.request
import json

# Test with Referer
url = 'https://vip.opstream90.com/20260215/28131_83f4f9f7/index.m3u8' # Example from earlier
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://ophim1.com/'
}

print(f"Testing URL: {url}")
try:
    req = urllib.request.Request(url, headers=headers, method='HEAD')
    with urllib.request.urlopen(req, timeout=5) as r:
        print(f"Status with Referer: {r.status}")
except Exception as e:
    print(f"Status with Referer Error: {e}")

# Try another common referer
headers['Referer'] = 'https://ophim17.cc/'
try:
    req = urllib.request.Request(url, headers=headers, method='HEAD')
    with urllib.request.urlopen(req, timeout=5) as r:
        print(f"Status with Referer (ophim17): {r.status}")
except Exception as e:
    print(f"Status with Referer (ophim17) Error: {e}")
