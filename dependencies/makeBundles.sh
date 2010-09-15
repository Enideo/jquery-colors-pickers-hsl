#!/bin/sh

rm ../jquery-colors-pickers-hslLite/jquery.colors.pickers.hslLite.bundle.js

echo "/**
 * jQuery Colors Picker: HSL Lite
 * @license Copyright 2010 Enideo. Released under dual MIT and GPL licenses.
*/

(function($){
" >> ../jquery-colors-pickers-hslLite/jquery.colors.pickers.hslLite.bundle.js

cat jquery.colors.pickers.hsl.dependencies.js >> ../jquery-colors-pickers-hslLite/jquery.colors.pickers.hslLite.bundle.js

echo "

})(jQuery);
" >> ../jquery-colors-pickers-hslLite/jquery.colors.pickers.hslLite.bundle.js

cat ../jquery-colors-pickers-hslLite/src/jquery.colors.pickers.hslLite.js >> ../jquery-colors-pickers-hslLite/jquery.colors.pickers.hslLite.bundle.js





rm ../jquery-colors-pickers-hslCircle/jquery.colors.pickers.hslCircle.bundle.js

echo "/**
 * jQuery Colors Picker: HSL Circle
 * @license Copyright 2010 Enideo. Released under dual MIT and GPL licenses.
*/

(function($){
" >> ../jquery-colors-pickers-hslCircle/jquery.colors.pickers.hslCircle.bundle.js

cat jquery.colors.pickers.hsl.dependencies.js >> ../jquery-colors-pickers-hslCircle/jquery.colors.pickers.hslCircle.bundle.js

echo "

})(jQuery);
" >> ../jquery-colors-pickers-hslCircle/jquery.colors.pickers.hslCircle.bundle.js

cat ../jquery-colors-pickers-hslCircle/src/jquery.colors.pickers.hslCircle.js >> ../jquery-colors-pickers-hslCircle/jquery.colors.pickers.hslCircle.bundle.js


