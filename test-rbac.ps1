$baseUrl = "http://localhost:4000/api"
$adminEmail = "admin@vulpi.cz"
$adminPassword = "1234"
$userEmail = "worker@vulpi.cz"
$userPassword = "1234"

# 1. Login as SuperAdmin
Write-Host "Logging in as SuperAdmin..."
try {
    $loginBody = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable adminSession
    $adminToken = $response.accessToken
    
    if ($adminToken) {
        Write-Host "SuperAdmin logged in successfully." -ForegroundColor Green
    } else {
        Write-Host "SuperAdmin login failed (No token)." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "SuperAdmin login failed: $_" -ForegroundColor Red
    exit
}

# 2. Test SuperAdmin Access to /users (Should be allowed)
Write-Host "Testing SuperAdmin access to /users..."
try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $users = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $headers -WebSession $adminSession
    Write-Host "Success! SuperAdmin can see $($users.Count) users." -ForegroundColor Green
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
}

# 3. Test SuperAdmin Access to /organizations (Should be allowed and see all)
Write-Host "Testing SuperAdmin access to /organizations..."
try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $orgs = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Get -Headers $headers -WebSession $adminSession
    Write-Host "Success! SuperAdmin can see $($orgs.Count) organizations." -ForegroundColor Green
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
}

# 4. Register/Login as Regular User
Write-Host "Registering/Logging in as Regular User..."
try {
    $registerBody = @{
        email = $userEmail
        password = $userPassword
        name = "Employee User"
    } | ConvertTo-Json
    
    # Try register
    try {
        Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -ErrorAction Stop
        Write-Host "User registered."
    } catch {
        # If conflict, ignore (user exists)
        Write-Host "User might already exist, proceeding to login."
    }

    # Login
    $loginBody = @{
        email = $userEmail
        password = $userPassword
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable userSession
    $userToken = $response.accessToken
    
    if ($userToken) {
         Write-Host "User logged in successfully." -ForegroundColor Green
    } else {
         Write-Host "User login failed." -ForegroundColor Red
         exit
    }

} catch {
    Write-Host "User setup failed: $_" -ForegroundColor Red
    exit
}

# 5. Test User Access to /users (Should be Forbidden)
Write-Host "Testing User access to /users (Should fail)..."
try {
    $headers = @{ Authorization = "Bearer $userToken" }
    Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $headers -WebSession $userSession
    Write-Host "FAILURE: User was able to access /users!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq "Forbidden") {
        Write-Host "Success! User was denied access to /users (403 Forbidden)." -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $_" -ForegroundColor Yellow
    }
}

# 6. Test User Access to /organizations (Should only see their own)
Write-Host "Testing User access to /organizations..."
try {
    $headers = @{ Authorization = "Bearer $userToken" }
    $orgs = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Get -Headers $headers -WebSession $userSession
    Write-Host "User sees $($orgs.Count) organizations."
    
    # Check if we can see ALL (SuperAdmin saw more?)
    # Ideally compare counts if we knew them, but for now just success is good.
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
}
