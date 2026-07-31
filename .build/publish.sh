#!/usr/bin/env bash

set -e -u
set -o pipefail

TIMESTAMP=$(date +%s)

curl -H "Content-Type: application/json" -X POST -d "{\"path\": \"/data/web/shipping\", \"url\": \"https://file-qn.golads.com/artifacts/shipping/shipping-test.zip?t=${TIMESTAMP}\"}" "http://webhook.olabala.com/hooks/publishspa?token=8ukBFB5uqXXRjCtJ"
