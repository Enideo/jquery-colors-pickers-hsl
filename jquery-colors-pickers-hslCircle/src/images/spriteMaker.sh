#!/bin/sh

rm sprite.css

montage s*.png -mode Concatenate  -tile 1x -gravity North -background none sprite.raw.png

pngcrush sprite.raw.png sprite.png

echo ".hslCircleColorPicker .sSprite{background-image:url('data:image/png;charset=\\\"utf-8\\\";base64," >> sprite.css
base64 -w0 sprite.png >> sprite.css
echo "');}" >> sprite.css
 
cp sprite.png ../../jquery.colors.pickers.hslCircle.sprite.s.png


montage h*.png -mode Concatenate  -tile x1 -gravity North -background none sprite.raw.png

pngcrush sprite.raw.png sprite.png

echo ".hslCircleColorPicker .hSprite{background-image:url('data:image/png;charset=\\\"utf-8\\\";base64," >> sprite.css
base64 -w0 sprite.png >> sprite.css
echo "');}" >> sprite.css

cp sprite.png ../../jquery.colors.pickers.hslCircle.sprite.h.png

rm sprite.png sprite.raw.png

echo ".hslCircleColorPicker>div.scale.l{background-image:url('data:image/png;charset=\\\"utf-8\\\";base64," >> sprite.css
base64 -w0 l.png >> sprite.css
echo "');}" >> sprite.css

pngcrush l.png ../../jquery.colors.pickers.hslCircle.l.png


sed -i '
/base64,$/ {
N
s/base64,\n/base64,/
}' sprite.css

cp sprite.css ../../jquery.colors.pickers.hslCircle.css
