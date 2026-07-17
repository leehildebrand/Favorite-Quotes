#!/usr/bin/env bash
# SFTP deployment to Namecheap (overwrite existing files, keep unrelated remote files)
# Usage: ./deploy.sh [--dry-run]
# You will be prompted for your SFTP password.

set -euo pipefail

FTP_HOST="198.54.115.138"
FTP_USER="leehbcmz"
# Use a path relative to the SFTP account root (Namecheap chroots SFTP users).
FTP_REMOTE="favoritequotes"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"
DRY_RUN_FLAG=""
PREPARE_REMOTE_CMD=""

if [[ $# -gt 1 ]]; then
  echo "Usage: ./deploy.sh [--dry-run]"
  exit 1
fi

if [[ $# -eq 1 ]]; then
  if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN_FLAG="--dry-run"
  else
    echo "Usage: ./deploy.sh [--dry-run]"
    exit 1
  fi
fi

if [[ -z "$DRY_RUN_FLAG" ]]; then
  PREPARE_REMOTE_CMD="mkdir -p \"${FTP_REMOTE}\";"
fi

echo ""
echo "Deploying to sftp://${FTP_HOST}${FTP_REMOTE}"
if [[ -n "$DRY_RUN_FLAG" ]]; then
  echo "Dry-run mode: no files will be uploaded."
else
  echo "Overwrite mode: matching remote files will be replaced; unrelated remote files are kept."
fi
echo ""
read -s -p "SFTP password: " FTP_PASS
echo ""

lftp -c "
set sftp:auto-confirm yes;
set net:timeout 30;
set net:max-retries 3;
open sftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}:21098;
${PREPARE_REMOTE_CMD}
mirror \
  --reverse \
  --transfer-all \
  --overwrite \
  --verbose \
  ${DRY_RUN_FLAG} \
  --exclude-glob .git/ \
  --exclude-glob .env \
  --exclude-glob .env.example \
  --exclude-glob node_modules/ \
  --exclude-glob Quotes.xlsx \
  --exclude-glob deploy.sh \
  --exclude-glob .DS_Store \
  --exclude-glob .nvmrc \
  --exclude-glob .node-version \
  --exclude-glob .neon \
  --exclude-glob skills-lock.json \
  --exclude-glob .agents/ \
  \"${LOCAL_DIR}/\" \
  \"${FTP_REMOTE}\";
bye
"

echo ""
echo "Deployment complete."
