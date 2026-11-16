#!/usr/bin/env bash
# Waits for an EAS build to finish, then attaches its APK to a GitHub Release.
# Usage: publish-apk.sh <eas-build-id>   (run from frontend/, with EXPO_TOKEN and GH_TOKEN set)
set -euo pipefail

BUILD_ID="$1"
POLL_SECONDS=30

while true; do
  eas build:view "$BUILD_ID" --json > "$RUNNER_TEMP/build.json"
  STATUS=$(node -p "require(process.env.RUNNER_TEMP + '/build.json').status")
  echo "$(date -u +%H:%M:%S) build $BUILD_ID: $STATUS"
  case "$STATUS" in
    FINISHED) break ;;
    ERRORED | CANCELED) echo "::error::EAS build $BUILD_ID ended with status $STATUS"; exit 1 ;;
  esac
  sleep "$POLL_SECONDS"
done

URL=$(node -p "require(process.env.RUNNER_TEMP + '/build.json').artifacts.buildUrl")
VERSION=$(node -p "require('./app.json').expo.version")
OWNER=$(node -p "require('./app.json').expo.owner")
SLUG=$(node -p "require('./app.json').expo.slug")
PAGE="https://expo.dev/accounts/$OWNER/projects/$SLUG/builds/$BUILD_ID"
TAG="apk-v$VERSION-${BUILD_ID:0:8}"
FILE="$RUNNER_TEMP/kovra-$VERSION.apk"

curl -fsSL "$URL" -o "$FILE"
gh release create "$TAG" "$FILE" \
  --title "Kovra $VERSION (${BUILD_ID:0:8})" \
  --notes "Android APK. Open on an Android phone to install. Expo build page: $PAGE"

echo "APK: $URL"
echo "Release: https://github.com/$GITHUB_REPOSITORY/releases/tag/$TAG"
{
  echo "## APK ready"
  echo "- Download: $URL"
  echo "- Release: https://github.com/$GITHUB_REPOSITORY/releases/tag/$TAG"
} >> "$GITHUB_STEP_SUMMARY"
