/**
 * jQuery Colors Core
 * Copyright 2010 Enideo. Released under dual MIT and GPL licenses.
*/

var Color = function(color, format, model){

  if( this instanceof Color === false ) return new Color(color, format, model);

  if( color && color instanceof Color ){
    return color;
  }

  this.currentModel = Color.defaultModel;

  if( color ){

    if( typeof color == 'string' ) {
      color = $.trim(color);
    }

    this.inputColor = color;

    /// valid input format
    if( format && format in Color.formats &&
      Color.formats[ format ].validate( color )===true ){

      this.inputFormat = format;

    /// otherwise try to guess the format
    }else{

      if( model===undefined ){
        model = format;
      }

      for( format in Color.formats ){
        if( Color.formats[ format ].validate(color)===true ){
          this.inputFormat = format;
          break;
        }
      }

    }


    if( this.inputFormat ){

      format = Color.formats[ format ];

      this.inputModel = model || format.model || Color.defaultInputModel ;

      ///apply input format conversion to it's default model
      color = applyModelMethod( format.toModel , this.inputModel, color );

      if( this.inputModel != this.currentModel ){

        color = Color.models[ this.inputModel ].sanitize( color );

        ///convert input color to default model
        color = applyModelMethod( Color.convertModels[ this.inputModel ], this.currentModel, color );

      }

      this.color = Color.models[ this.currentModel ].sanitize( color );

    }

  }else{

    /// creates random with no arguments
    this.color = Color.models[ this.currentModel ].sanitize( );

  }

  if( this.color ){

    return this;

  }else{

    throw('Color format unknown: ' + color);

  }


}


/// provides auto detection of model methods and fallback through RGB model if models are missing

function applyModelMethod(listModelMethods, modelName, color){

  /// check if model exists
  if( modelName in listModelMethods){

    return listModelMethods[modelName]( color );

  /// else convert through RGB if possible
  }else{

    if ( modelName=='RGB' || 'RGB' in Color.convertModels[modelName] ){

      if ( modelName!='RGB' ) color = Color.convertModels[modelName].RGB( color );

      for( var existingModel in listModelMethods ){

        if ( existingModel=='RGB' || existingModel in Color.convertModels.RGB ){

          if ( existingModel!='RGB' ) color = Color.convertModels.RGB[existingModel]( color );

          /// integer format
          color = $.colors.formats.array3Octet1Normalized.fromModel.RGB(color);

          return listModelMethods[ existingModel ]( color );

        }

      }

    }

  }

  /// else throw

  throw('No valid conversion methods for this color model: ' + modelName);

}

function getSetParameter(parameter, value){
  var index,
    haystack = $.colors.models[ this.currentModel ].parameterIndexes,
    color = this.currentModel == 'RGB' ? this.format('array3Octet1Normalized') : this.color; /// integer format

  if( parameter ){
    parameter = parameter.toLowerCase();

    if( parameter in haystack ){

      if( value!==undefined ){
        this.color[ haystack[parameter] ] = value;
        this.color = $.colors.models[ this.currentModel ].sanitize(this.color);
      }else{
        return color[ haystack[parameter] ];
      }

    }else{
      throw('Parameter not in the current color model: ' + parameter );
    }
  }else{
    return color;
  }

  return this;
};


Color.fn = Color.prototype = {

  get : getSetParameter,
  set : getSetParameter,

  model : function( newModel ){

    if( newModel === undefined ){

      return this.currentModel;

    }else if (newModel == this.currentModel ) {

      return this;

    }else if (newModel in Color.models) {

      this.color = applyModelMethod( Color.convertModels[this.currentModel] , newModel, this.color );
      this.currentModel = newModel;

      return this;

    }else{

      throw('Model does not exist');

    }

  },

  format : function( format ){

    var color = (this.currentModel == 'RGB' && format!=='array3Octet1Normalized' )
      ? this.format('array3Octet1Normalized') : this.color; /// integer format

    if ( format && format in Color.formats ){

      return applyModelMethod( Color.formats[ format ].fromModel , this.currentModel, color );

    }else{

      throw('Format does not exist');

    }

  },

  toString : function( format ){

    if( !format || format in Color.formats === false ){
      format = Color.defaultString;
    }

    try{
      return this.format( format ).toString();
    }catch(e){
      return this.format( Color.defaultString ).toString();
    }

  },


  isFormat : function( format ){

    if ( format && format in Color.formats ){
      return Color.formats[ format ].validate( this.inputColor );
    }else{
      throw('Format does not exist');
    }

  }


};


Color.formats = {

  'array3Octet' : {

    validate : function( color, maxLength ){

      var a=0, maxLength = maxLength || 3;

      if( $.isArray(color) && color.length==maxLength ){
        while ( a<maxLength ){
          if( typeof color[a] == 'number' && color[a]>=0 &&
          ( a<3 && color[a]<=255 && /^\d+$/.test(color[a].toString()) ) ||
          ( a==3 && color[a]<=1 ) ){
            a++;
          }else{
            break;
          }
        }
        if( a==maxLength ){
          return true;
        }
      }

      return false;

    },

    toModel : {

      'RGB' : function ( color ){

        return color.slice(0,3);

      }

    },

    fromModel : {

      'RGB' : function ( color ){

        return color.slice(0,3);

      }

    }
  },

  'array3Octet1Normalized' : {

    validate : function( color ){

      return Color.formats.array3Octet.validate( color, 4 );

    },

    toModel : {

      'RGB' : function ( color ){

        return color.slice(0,4);

      }

    },

    fromModel : {

      'RGB' : function ( color ){

        var a=0;

        color = color.slice(0,4)

        while(a<3){
          color[a] = Math.round( color[a] );
          a++;
        }

        return color;

      }

    }
  },

  'rgb' : {

    validate : function( color, returnTuples ){

      var a=1, result;

      if( color && typeof color == 'string' &&
        (result = /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/.exec(color)) ){

        while ( a<4 ){
          result[a] = parseInt(result[a])
          if( result[a] < 256 ){
            a++;
          }else{
            break;
          }
        }

        if( a==4 ){
          if( returnTuples ){
            result.shift();
            return result.slice(0);
          }else{
            return true;
          }
        }

      }
      return false;
    },

    fromModel : {

      'RGB' : function(rgb){
        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
      }
    },

    toModel : {

      'RGB' : function(rgbString){
        var result = Color.formats.rgb.validate(rgbString,true);
        if(result===false){
          return null;
        }else{
          return result;
        }

      }
    },
    model : 'RGB'
  }

}


Color.models = {
  'RGB' : {

    sanitize : function( rgb ){
      var a;

      if ( !rgb || !$.isArray(rgb) ){
        rgb = [
          Math.floor(256*Math.random()),
          Math.floor(256*Math.random()),
          Math.floor(256*Math.random()),
          Math.random()
        ];
      }

      while( rgb.length<4 ){

        if(rgb.length==3){
          rgb.push( 1 );
        }else{
          rgb.push( 0 );
        }

      }

      rgb = rgb.slice(0,4);

      for( a=0; a<rgb.length; a++ ){

        if ( !rgb[a] ){
          rgb[a] = 0;
        }

        if( a<3 ){

          if( rgb[a] > 255 ){
            rgb[a] = 255;
          }
          if( rgb[a] < 0 ){
            rgb[a] = 0;
          }
        }else if ( a==3 ){
          rgb[a] = parseFloat(rgb[a])
          if( rgb[a] > 1 ){
            rgb[a] = 1;
          }
          if( rgb[a] < 0 ){
            rgb[a] = 0;
          }
        }
      }

      return rgb;
    },

    parameterIndexes : {
      'r':0,
      'g':1,
      'b':2,
      'a':3,
      'red':0,
      'green':1,
      'blue':2,
      'alpha':3
    }

  }
};

Color.convertModels = {};

Color.defaultInputModel = Color.defaultModel = 'RGB';
Color.defaultString = 'rgb';

if($.colors===undefined){
  $.extend({colors:Color});
}
/**
 * jQuery Colors HSL
 * Copyright 2010 Enideo. Released under dual MIT and GPL licenses.
*/

var hslRgbConversion = {
  /// Credits to http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  'RGB' : {
    'HSL' : function(rgb){

      var r = rgb[0]/255,
        g = rgb[1]/255,
        b = rgb[2]/255,
        max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        delta = max - min,
        h, s,
        l = (max + min) / 2;

      if(max == min){
          h = s = 0; // achromatic
      }else{
          s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
          if( max==r ){

              h = (g - b) / delta + (g < b ? 6 : 0);

          }else if ( max==g ){

              h = (b - r) / delta + 2;

          }else{ /// max==b

            h = (r - g) / delta + 4;

          }
          h /= 6;
      }

      return [h*360, s*100, l*100, rgb[3]];
    }

  },

  'HSL' : {
    'RGB' : function(hsl){

      var r, g, b, q, p,
        h = hsl[0]/360,
        s = hsl[1]/100,
        l = hsl[2]/100;

      if(s == 0){
          r = g = b = l; // achromatic

      }else{

          q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return [r * 255, g * 255, b * 255, hsl[3]];

      function hue2rgb(p, q, t){
        if( t<0 ) t+=1;
        if( t>1 ) t-=1;

        if(t < 1/6) {
          return p + (q - p) * 6 * t;
        }else if(t < 1/2) {
          return q;
        }else if(t < 2/3) {
          return p + (q - p) * (2/3 - t) * 6;
        }else{
          return p;
        }
      }

    }
  }
},

  hslModel = {
    'HSL' : {
      sanitize : function( hsl ){
        var a;

        if ( !hsl || !$.isArray(hsl) ){
          hsl = [
            Math.floor(361*Math.random()),
            Math.floor(101*Math.random()),
            Math.floor(101*Math.random()),
            Math.random()
          ];
        }


        while( hsl.length<4 ){
          if(hsl.length==3){
            hsl.push( 1 );
          }else{
            hsl.push( 0 );
          }
        }

        hsl = hsl.slice(0,4);

        for( a=0; a<hsl.length; a++ ){

          if (!hsl[a] ){
            hsl[a] = 0;
          }

          hsl[a] = parseFloat(hsl[a]);

          if( a==0 ){

            while( hsl[a] > 360 ){
              hsl[a] -= 360;
            }
            if( hsl[a] < 0 ){
              hsl[a] += 360;
            }

          }else if( a<3 ){

            while( hsl[a] > 100 ){
              hsl[a] = 100;
            }
            if( hsl[a] < 0 ){
              hsl[a] = 0;
            }
          }else if ( a==3 ){

            if( hsl[a] > 1 ){
              hsl[a] = 1;
            }
            if( hsl[a] < 0 ){
              hsl[a] = 0;
            }
          }
        }

        return hsl;
      },

      parameterIndexes : {
        'h':0,
        's':1,
        'l':2,
        'a':3,
        'hue':0,
        'saturation':1,
        'lightness':2,
        'alpha':3
      },

      cycleMixes : [360,0,0,0],

      reverseCylce : function ( parameter ){
        this.cycleMixes[ this.parameterIndexes[ parameter ] ] *= -1;
      }

    }

  },

  hslFormats = {

    'array1Circle2Percentage' : {

      validate : function( color, maxLength ){

        var a=0, maxLength = maxLength || 3;

        if( $.isArray(color) && color.length==maxLength ){
          while ( a<maxLength ){
            if( typeof color[a] == 'number' && color[a]>=0 &&
              ( ( a==0 && color[a]<=360 ) || ((a==1||a==2) && color[a]<=100 ) || ( a==3 && color[a]<=1 ) ) ){
              a++;
            }else{
              break;
            }
          }
          if( a==maxLength ){
            return true;
          }
        }

        return false;

      },

      toModel : {
        'HSL' : function ( color ){
          return color.slice(0,3);
        }
      },
      fromModel : {
        'HSL' : function ( color ){
          return color.slice(0,3);
        }
      }

    },

    'array1Circle2Percentage1Normalized' : {

      validate : function( color ){

        return hslFormats.array1Circle2Percentage.validate( color, 4 );

      },

      toModel : {
        'HSL' : function ( color ){
          return color.slice(0,4);
        }
      },
      fromModel : {
        'HSL' : function ( color ){
          return color.slice(0,4);
        }
      }

    }


  };

$.extend(true, $.colors.convertModels,hslRgbConversion);
$.extend($.colors.models,hslModel);
$.extend($.colors.formats,hslFormats);