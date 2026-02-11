---
description: Các lệnh thường dùng cho QPhim project
---

# QPhim Workflow

## Chạy local
// turbo-all

1. Build và chạy Docker container
```powershell
docker-compose -f F:\pyro\QPhim\docker-compose.yml up -d --build
```

2. Mở trình duyệt
```powershell
Start-Process "http://localhost:8080"
```

3. Xem logs
```powershell
docker logs qphim -f --tail 50
```

## Dừng container
```powershell
docker-compose -f F:\pyro\QPhim\docker-compose.yml down
```

## Rebuild sau khi sửa code
```powershell
docker-compose -f F:\pyro\QPhim\docker-compose.yml up -d --build
```

## Deploy lên GitHub
```powershell
cd F:\pyro\QPhim
git add .
git commit -m "update"
git push
```
