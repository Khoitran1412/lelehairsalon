#!/bin/bash
set -euo pipefail

# Generate valid, neutral SVG placeholders for local development. They are
# intentionally text-free so they cannot be mistaken for customer work.
cd "$(dirname "$0")"

gen_svg() {
  local path="$1" width="$2" height="$3" base="$4" accent="$5"
  cat > "$path" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="$width" height="$height" viewBox="0 0 $width $height" fill="none">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="$width" y2="$height" gradientUnits="userSpaceOnUse">
      <stop stop-color="$base"/>
      <stop offset="1" stop-color="$accent"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate($((width * 3 / 4)) $((height / 4))) rotate(135) scale($((width / 2)) $((height / 2)))" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FBF8F1" stop-opacity=".35"/>
      <stop offset="1" stop-color="#FBF8F1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="$width" height="$height" fill="url(#base)"/>
  <rect width="$width" height="$height" fill="url(#glow)"/>
  <path d="M0 $((height * 3 / 4))C$((width / 4)) $((height / 2)) $((width * 2 / 3)) $height $width $((height / 4))" stroke="#FBF8F1" stroke-opacity=".18" stroke-width="2"/>
</svg>
EOF
}

gen_svg "hero-salon.svg" 1920 1080 "#1A1A1A" "#5A554F"
gen_svg "salon-interior-1.svg" 800 1067 "#B8A088" "#D4C9BE"
gen_svg "salon-interior-2.svg" 600 800 "#E5DDD3" "#F5EFE6"
gen_svg "salon-interior-3.svg" 800 1000 "#A99684" "#D4C9BE"
gen_svg "og-image.svg" 1200 630 "#1A1A1A" "#5A554F"

for name in cat-thiet-ke uon-tao-kieu nhuom-thoi-trang duoi-va-tao-phom phuc-hoi-chuyen-sau goi-va-tao-kieu; do
  gen_svg "services/$name.svg" 600 450 "#E5DDD3" "#F5EFE6"
done

for name in cat-1 nhuom-1 uon-1 cat-2 nhuom-2 uon-2 phuc-hoi-1 cat-3 nhuom-3 before-after-1 uon-3 nhuom-4; do
  gen_svg "portfolio/$name.svg" 600 600 "#B8A088" "#D4C9BE"
done

for number in 1 2 3 4; do
  gen_svg "journal/hair-care-$number.svg" 600 450 "#E5DDD3" "#F5EFE6"
done
