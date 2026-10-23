#!/usr/bin/env bash
# Publish the journal: bump the cache-busting version, commit everything, push to GitHub Pages.
# Usage: ./publish.sh "What changed"
set -e
cd "$(dirname "$0")"
V=$(date +%Y%m%d%H%M)
sed -i -E "s#(href=\"style\.css)(\?v=[0-9]+)?\"#\1?v=$V\"#; s#(src=\"(journal|app|company)\.js)(\?v=[0-9]+)?\"#\1?v=$V\"#g" index.html company.html
git add -A
git commit -m "${1:-Journal update}"
git push
echo "Published (v=$V). Live in a minute or two: https://acbueff.github.io/dnd-journal-the-bois/"
