# Load license key from environment or fallback to .env
if (-not $env:MAXMIND_LICENSE_KEY) {
    if (Test-Path ".env") {
        $envLines = Get-Content ".env" | Where-Object { $_ -notmatch '^#' }
        foreach ($line in $envLines) {
            if ($line -match '^MAXMIND_LICENSE_KEY=(.+)$') {
                $env:MAXMIND_LICENSE_KEY = $Matches[1]
            }
        }
    }
}

# Exit if license key is not set
if (-not $env:MAXMIND_LICENSE_KEY) {
    Write-Error "MAXMIND_LICENSE_KEY is not set in environment or .env file"
    exit 1
}

$edition = "GeoLite2-City"  # Or GeoLite2-Country, GeoLite2-ASN
$tarFile = "$edition.tar.gz"
$downloadUrl = "https://download.maxmind.com/app/geoip_download?edition_id=$edition&license_key=$($env:MAXMIND_LICENSE_KEY)&suffix=tar.gz"

# Download the file
Invoke-WebRequest -Uri $downloadUrl -OutFile $tarFile

# Extract tar.gz using tar
tar -xvzf $tarFile

# Get the extracted folder name
$extractedDir = (& tar -tzf $tarFile)[0].Split('/')[0]

# Create .maxmind folder if it doesn't exist
if (-not (Test-Path ".maxmind")) {
    New-Item -ItemType Directory -Path ".maxmind" | Out-Null
}

# Move the .mmdb file
Move-Item "$extractedDir\$edition.mmdb" ".maxmind\" -Force

# Clean up
Remove-Item -Recurse -Force $extractedDir
Remove-Item -Force $tarFile