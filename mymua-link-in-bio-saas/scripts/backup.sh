#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/data"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

cp "$DATA_DIR/database.sqlite" "$BACKUP_DIR/database-$DATE.sqlite"
cp "$DATA_DIR/sessions.db" "$BACKUP_DIR/sessions-$DATE.db" 2>/dev/null || true

find "$BACKUP_DIR" -name "*.sqlite" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.db" -mtime +7 -delete

echo "Backup complete: $BACKUP_DIR/database-$DATE.sqlite"
ls -lh "$BACKUP_DIR/database-$DATE.sqlite"
