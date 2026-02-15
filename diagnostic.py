import urllib.request
import json

def test_slug(slug):
    url = f'https://ophim1.com/v1/api/phim/{slug}'
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            item = data['data']['item']
            print(f"\nMovie: {item['name']}")
            for server in item.get('episodes', []):
                for ep in server['server_data'][:1]:
                    m3u8 = ep.get('link_m3u8')
                    embed = ep.get('link_embed')
                    print(f"  M3U8: {m3u8}")
                    if m3u8:
                        try:
                            m_req = urllib.request.Request(m3u8, headers=headers, method='HEAD')
                            with urllib.request.urlopen(m_req, timeout=3) as r:
                                print(f"  M3U8 Status: {r.status}")
                        except Exception as e:
                            print(f"  M3U8 Status Error: {e}")
                    
                    print(f"  Embed: {embed}")
                    if embed:
                        try:
                            e_req = urllib.request.Request(embed, headers=headers, method='HEAD')
                            with urllib.request.urlopen(e_req, timeout=3) as r:
                                print(f"  Embed Status: {r.status}")
                        except Exception as e:
                            print(f"  Embed Status Error: {e}")
    except Exception as e:
        print(f"Error testing {slug}: {e}")

# Test some known slugs or random ones
test_slug('nguoi-phan-xu') # Older movie
test_slug('duong-quy-ky-an') # New movie
