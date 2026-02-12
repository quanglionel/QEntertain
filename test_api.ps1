$BaseUrl = "http://localhost:8080/api"

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url
    )
    Write-Host " Testing $Name..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        Write-Host " OK" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "   Error: $_"
        return $null
    }
}

Write-Host "START API CHECK`n"

# 1. Test Phim Home
$phimHome = Test-Endpoint -Name "Phim Home" -Url "$BaseUrl/phim/home"

if ($phimHome) {
    if ($phimHome.data.items.Count -gt 0) {
        $firstPhim = $phimHome.data.items[0]
        $pName = $firstPhim.name
        $pSlug = $firstPhim.slug
        Write-Host "   Found phim: $pName ($pSlug)" -ForegroundColor Cyan
        
        # 2. Test Phim Detail
        $phimDetail = Test-Endpoint -Name "Phim Detail ($pSlug)" -Url "$BaseUrl/phim/phim/$pSlug"
        if ($phimDetail -and $phimDetail.movie) {
            Write-Host "   Movie Content: Found" -ForegroundColor Cyan
            if ($phimDetail.episodes.Count -gt 0) {
                $epCount = $phimDetail.episodes[0].server_data.Count
                Write-Host "   Episodes: Found ($epCount eps)" -ForegroundColor Cyan
            }
            else {
                Write-Host "   Episodes: Not found or empty" -ForegroundColor Yellow
            }
        }
    }
    else {
        Write-Host "   No items found in Home" -ForegroundColor Yellow
    }
}

Write-Host "`n--------------------------------`n"

# 3. Test Truyen Home
$truyenHome = Test-Endpoint -Name "Truyen Home" -Url "$BaseUrl/truyen/home"

if ($truyenHome) {
    if ($truyenHome.data.items.Count -gt 0) {
        $firstTruyen = $truyenHome.data.items[0]
        $tName = $firstTruyen.name
        $tSlug = $firstTruyen.slug
        Write-Host "   Found truyen: $tName ($tSlug)" -ForegroundColor Cyan

        # 4. Test Truyen Detail
        # Note: OTruyen slug prefix is /truyen-tranh/
        $truyenDetail = Test-Endpoint -Name "Truyen Detail ($tSlug)" -Url "$BaseUrl/truyen/truyen-tranh/$tSlug"
        
        if ($truyenDetail -and $truyenDetail.data.item) {
            Write-Host "   Comic Content: Found" -ForegroundColor Cyan
            
            if ($truyenDetail.data.item.chapters.Count -gt 0) {
                $chapters = $truyenDetail.data.item.chapters
                # Normally chapters is array of servers. Check first server.
                if ($chapters[0].server_data.Count -gt 0) {
                    $chapData = $chapters[0].server_data[0]
                    $sCount = $chapters.Count
                    $cName = $chapData.chapter_name
                    
                    Write-Host "   Chapters: Found ($sCount servers)" -ForegroundColor Cyan
                    Write-Host "   Testing Chapter: $cName" -ForegroundColor Cyan
                    
                    $chapApiUrl = $chapData.chapter_api_data
                    if ($chapApiUrl -like "*sv1.otruyencdn.com*") {
                        # Construct Proxy URL
                        $proxyUrl = $chapApiUrl -replace "https://sv1.otruyencdn.com", "$BaseUrl/truyen-chapter"
                        
                        $chapContent = Test-Endpoint -Name "Chapter Content via Proxy" -Url $proxyUrl
                        
                        if ($chapContent -and $chapContent.status -eq 'success') {
                            $imgCount = $chapContent.data.item.chapter_image.Count
                            $cdnDomain = $chapContent.data.domain_cdn
                            Write-Host "   Images Loaded: $imgCount files" -ForegroundColor Green
                            Write-Host "   CDN Domain: $cdnDomain" -ForegroundColor Gray
                        }
                        else {
                            Write-Host "   Chapter Content: Failed or Invalid Response" -ForegroundColor Red
                        }
                    }
                    else {
                        Write-Host "   Skipping Proxy Test (URL not matching expected CDN: $chapApiUrl)" -ForegroundColor Yellow
                    }
                }
                else {
                    Write-Host "   Chapters found but server_data is empty" -ForegroundColor Yellow
                }
            }
            else {
                Write-Host "   Chapters: List is empty" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "   Comic Content: Not valid" -ForegroundColor Red
        }
    }
    else {
        Write-Host "   No items found in Truyen Home" -ForegroundColor Yellow
    }
}

Write-Host "`n DONE API CHECK"
