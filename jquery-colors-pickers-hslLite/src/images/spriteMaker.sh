#!/bin/sh

rm sprite.css sprite.png

montage *.png -mode Concatenate  -tile x1 -gravity North -background none sprite.raw.png

pngcrush sprite.raw.png sprite.png

cp sprite.png ../../jquery.colors.pickers.hslLite.sprite.png

echo "[\".hslLiteColorPicker .sprite\"," >> sprite.css
echo "[\"background-image\",\"url('data:image/png;charset=\\\"utf-8\\\";base64," >> sprite.css
base64 -w0 sprite.png >> sprite.css
echo "')\"]]" >> sprite.css

sed -i '
/base64,$/ {
N
s/base64,\n/base64,/
}' sprite.css

rm sprite.raw.png