import urllib.request
import json

# Try to find a movie with a different server (not opstream90)
search_url = 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=2'
headers = {'User-Agent': 'Mozilla/5.0'}

try:
    req = urllib.request.Request(search_url, headers=headers)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        items = data['data']['items']
        
        for item in items[:5]: # Check first 5 items on page 2
            item_url = f"https://ophim1.com/v1/api/phim/{item['slug']}"
            req2 = urllib.request.Request(item_url, headers=headers)
            with urllib.request.urlopen(req2) as resp2:
                detail = json.loads(resp2.read().decode('utf-8'))
                movie = detail['data']['item']
                episodes = movie.get('episodes', [])
                if episodes:
                    first_ep = episodes[0]['server_data'][0]
                    m3u8 = first_ep.get('link_m3u8', '')
                    print(f"Movie: {movie['name']} | Server: {episodes[0]['server_name']}")
                    print(f"  M3U8: {m3u8}")
                    
                    if m3u8:
                        try:
                            m3_req = urllib.request.Request(m3u8, headers=headers, method='HEAD')
                            with urllib.request.urlopen(m3_req, timeout=3) as r:
                                print(f"  Status: {r.status}")
                        except Exception as e:
                            print(f"  Status Error: {e}")
                    print("-" * 20)

except Exception as e:
    print(f"Global Error: {e}")
