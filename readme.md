
Two color pickers have been developed upon the [jQuery.colors](http://github.com/Enideo/jquery-colors) plugin using the HSL (hue, saturation, lightness) color model.

# Demos and docs
[http://enideo.com/#jquery-colors-pickers-hsl](http://enideo.com/#jquery-colors-pickers-hsl)


# Developers Documentation
* The setGlobals function sets the globals of the anononymous function (which means they remain hidden from the DOM global scope)
  * It is an unorthodox method but simpler than object management whilst maintaining scope.
* Where possible, styling that is necessary for the picker to render correctly has been applied to the elements, not in the head.

# Future work

## Better method logic
For now we have an imitation of the jQuery UI for ease of pickup but these methods seem confusing. Could something better be done?:

* something.insert( $.colors.pickers.hslLite.render() )
* Give it an id.
* $(#id).colorPicker( options... )
* store settings in data

## More methods
* destroy
* reset

## More complete versions
* More for designers i.e.
  * [http://www.eyecon.ro/colorpicker/](http://www.eyecon.ro/colorpicker/)
  * [http://www.digitalmagicpro.com/jPicker/](http://www.digitalmagicpro.com/jPicker/)

## Misc
* Animate the movement of the markers?
* Make one wrapper and clone each time?



## Misc
* Optimise the size/speed
* qunit testing
