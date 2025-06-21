$body = @{
    userId = 5
    announcementId = 1
} | ConvertTo-Json

Write-Host "Testing like API with body: $body"

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/likes/announcement' -Method POST -ContentType 'application/json' -Body $body
    Write-Host "Success: $($response | ConvertTo-Json)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
