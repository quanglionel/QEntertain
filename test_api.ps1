$BaseUrl = "http://localhost:8080/api"

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url
    )
    Write-Host "🔍 Testing $Name..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        Write-Host " ✅ OK" -ForegroundColor Green
        return $response
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $_"
        return $null
    }
}

Write-Host "🚀 START API CHECK`n"

# 1. Test Phim Home
$phimHome = Test-Endpoint -Name "Phim Home" -Url "$BaseUrl/phim/home"

if ($phimHome) {
    if ($phimHome.data.items.Count -gt 0) {
        $firstPhim = $phimHome.data.items[0]
        Write-Host "   Found phim: $($firstPhim.name) ($($firstPhim.slug))" -ForegroundColor Cyan
        
        # 2. Test Phim Detail
        $phimDetail = Test-Endpoint -Name "Phim Detail ($($firstPhim.slug))" -Url "$BaseUrl/phim/phim/$($firstPhim.slug)"
        if ($phimDetail -and $phimDetail.movie) {
            Write-Host "   Movie Content: Found" -ForegroundColor Cyan
            if ($phimDetail.episodes.Count -gt 0) {
                 Write-Host "   Episodes: Found ($($phimDetail.episodes[0].server_data.Count) eps)" -ForegroundColor Cyan
            } else {
                 Write-Host "   Episodes: Not found or empty" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "   No items found in Home" -ForegroundColor Yellow
    }
}

Write-Host "`n--------------------------------`n"

# 3. Test Truyen Home
$truyenHome = Test-Endpoint -Name "Truyen Home" -Url "$BaseUrl/truyen/home"

if ($truyenHome) {
     if ($truyenHome.data.items.Count -gt 0) {
        $firstTruyen = $truyenHome.data.items[0]
        Write-Host "   Found truyen: $($firstTruyen.name) ($($firstTruyen.slug))" -ForegroundColor Cyan

        # 4. Test Truyen Detail
        # Note: OTruyen slug prefix is /truyen-tranh/
        $truyenDetail = Test-Endpoint -Name "Truyen Detail ($($firstTruyen.slug))" -Url "$BaseUrl/truyen/truyen-tranh/$($firstTruyen.slug)"
        if ($truyenDetail -and $truyenDetail.data.item) {
             Write-Host "   Comic Content: Found" -ForegroundColor Cyan
             if ($truyenDetail.data.item.chapters.Count -gt 0) {
                 Write-Host "   Chapters: Found ($($truyenDetail.data.item.chapters[0].server_data.Count) chaps)" -ForegroundColor Cyan
             } else {
                 Write-Host "   Chapters: Not found" -ForegroundColor Yellow
             }
        }
    }
}

Write-Host "`n✅ DONE API CHECK"
