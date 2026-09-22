#!/bin/zsh
# Rasterises the generated sheets so they can be looked at. Review only —
# nothing on the site reads these PNGs.
OUT=${1:?usage: preview.sh <out-dir> [id ...]}
mkdir -p "$OUT"
shift
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
ids=("$@")
if [[ ${#ids} -eq 0 ]]; then
  ids=(${(f)"$(cd "$ROOT/public/video-styles" && ls *.svg | sed 's/\.svg$//')"})
fi
for id in $ids; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --screenshot="$OUT/$id.png" --window-size=1600,1260 \
    "file://$ROOT/public/video-styles/$id.svg" 2>/dev/null
done
echo "${#ids} rendered → $OUT"
