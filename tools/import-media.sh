#!/bin/zsh
# Converts the cake photos (HEIC) and videos (MOV) into web-friendly files in assets/media.
# Usage: ./tools/import-media.sh photo1.heic photo2.heic photo3.heic video1.mov video2.mov
# (or drop the originals into assets/media/raw/ and run with no arguments)
set -e
cd "$(dirname "$0")/.."
OUT=assets/media
mkdir -p "$OUT"
files=("$@")
[[ ${#files} -eq 0 ]] && files=(assets/media/raw/*(N))

img=1; vid=1
for f in "${files[@]}"; do
  case "${f:l}" in
    *.heic|*.jpg|*.jpeg|*.png)
      sips -s format jpeg -s formatOptions 82 -Z 1600 "$f" --out "$OUT/cake-$img.jpg" >/dev/null
      echo "photo -> $OUT/cake-$img.jpg"; img=$((img+1)) ;;
    *.mov|*.mp4)
      ffmpeg -loglevel error -y -i "$f" -vf "scale='min(1080,iw)':-2" -c:v libx264 -crf 26 -preset slow \
        -pix_fmt yuv420p -an -movflags +faststart "$OUT/cake-video-$vid.mp4"
      echo "video -> $OUT/cake-video-$vid.mp4"; vid=$((vid+1)) ;;
  esac
done
