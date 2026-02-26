
$body = @{
    email = "admin@vulpi.cz"
    password = "1234"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 5)"
} catch {
    Write-Error $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Error $_.Exception.Response.StatusCode
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Error $reader.ReadToEnd()
    }
}
