#!/bin/bash

# Use existing MAXMIND_LICENSE_KEY from environment, or load from .env
if [ -z "$MAXMIND_LICENSE_KEY" ]; then
  if [ -f .env ]; then
    export $(grep -v '^#' .env | grep MAXMIND_LICENSE_KEY | xargs)
  fi
fi

# Ensure MAXMIND_LICENSE_KEY is now set
if [ -z "$MAXMIND_LICENSE_KEY" ]; then
  echo "Error: MAXMIND_LICENSE_KEY is not set in environment or .env file"
  exit 1
fi

EDITION="GeoLite2-City" # or GeoLite2-Country, GeoLite2-ASN

# Download the tar.gz file
wget -O ${EDITION}.tar.gz "https://download.maxmind.com/app/geoip_download?edition_id=${EDITION}&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz"

# Extract the tar.gz file
tar -xvzf ${EDITION}.tar.gz

# Create .maxmind directory if it doesn't exist
mkdir -p .maxmind

# Get the name of the extracted folder
EXTRACTED_DIR=$(tar -tzf ${EDITION}.tar.gz | head -1 | cut -f1 -d"/")

# Move .mmdb file to .maxmind
mv "${EXTRACTED_DIR}/${EDITION}.mmdb" .maxmind/

# Clean up
rm -rf "${EXTRACTED_DIR}"
rm -f "${EDITION}.tar.gz"