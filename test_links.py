import urllib.request
import json

slug = 'duong-quy-ky-an'
url = f'https://ophim1.com/v1/api/phim/{slug}'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        data = json.loads(content)
        
        item = data['data']['item']
        print(f"Movie: {item['name']}")
        
        episodes = item.get('episodes', [])
        
        for server in episodes:
            print(f"Server: {server['server_name']}")
            for ep in server['server_data'][-1:]: # Tail
                print(f"  Ep {ep['name']}:")
                m3u8 = ep.get('link_m3u8')
                embed = ep.get('link_embed')
                print(f"    M3U8: {m3u8}")
                print(f"    Embed: {embed}")
                
                if m3u8:
                    try:
                        m3u8_req = urllib.request.Request(m3u8, headers=headers, method='HEAD')
                        with urllib.request.urlopen(m3u8_req, timeout=5) as r:
                            print(f"    M3U8 Status: {r.status}")
                    except Exception as ve:
                        print(f"    M3U8 Status Error: {ve}")
                
                if embed:
                    try:
                        embed_req = urllib.request.Request(embed, headers=headers, method='HEAD')
                        with urllib.request.urlopen(embed_req, timeout=5) as r:
                            print(f"    Embed Status: {r.status}")
                    except Exception as ve:
                        print(f"    Embed Status Error: {ve}")

except Exception as e:
    print(f"Global Error: {e}")
