/**
 * jQuery Colors Picker: HSL Lite
 * @license Copyright 2010 Enideo. Released under dual MIT and GPL licenses.
*/

(function($){

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

})(jQuery);

/**
 * jQuery Colors Picker: HSL Lite
 * Copyright 2010 Enideo. Released under dual MIT and GPL licenses.
*/

(function($){

  var ini, settings = {},
    hsl, disabled, onStartChange, onChange, onEndChange,
    container, wrapper, scales, currentId, scriptSrc;


function setuphslLiteColorPicker(){

  var scaleTemplate = $('<div/>').css({width:198,backgroundRepeat:'repeat-y',position:'relative',overflow:'hidden'}).addClass('scale'),
    overlayTemplate =   $('<div/>').css({zIndex:1,bottom:0,backgroundRepeat:'repeat-y'}),
    handleTemplate = $('<span/>').css({position:'absolute',zIndex:3}),
    handleWrapper = $('<span/>').css({bottom:0}).addClass('handle');

  overlayTemplate.add(handleWrapper).css({position:'absolute',top:0,left:0,right:0});

  wrapper = $('<div/>').addClass('hslLiteColorPicker');
  wrapper
    .append(  scaleTemplate.clone().addClass('h sprite').data('arrayIndex',0)
      .append( overlayTemplate.clone() ) )
    .append(  scaleTemplate.clone().addClass('s').data('arrayIndex',1)
      .append( overlayTemplate.clone().addClass('sprite').css({backgroundPosition:"-792px 0"}) )
      .append( overlayTemplate.clone().addClass('sprite').css({backgroundPosition:"-396px 0"}) )
      .append( overlayTemplate.clone().addClass('sprite').css({backgroundPosition:"-594px 0"}) ) )
    .append(  scaleTemplate.clone().addClass('l sprite').data('arrayIndex',2)
      .css({backgroundPosition:"-198px 0"}) );

  container.append( wrapper );

  scales = wrapper.children('div');

  handleWrapper.append( handleTemplate.clone().text('▼') ).append( handleTemplate.clone().text('▲') );
  handleTemplate.addClass('outline').css({zIndex:2});
  handleWrapper.append( handleTemplate.clone().text('▼') ).append( handleTemplate.clone().text('▲') );

  scales.append( handleWrapper )
    .children().children().each(function(i){

      var self = $(this),
        topOrBottom = 'top';

      if(i%2!==0){
        topOrBottom = 'bottom';
      }

      // -1 ?
      self.css({left:-self.width()/2 -1}).css( topOrBottom , -self.height()/2 );

    });

  hsl = [ Math.random()*360 , Math.random()*100 , Math.random()*100 ];
  disabled = false;
  onStartChange = onChange = onEndChange = null;

  scales.mousedown(mousedown);

}


function mousedown(event) {

  var scale = $(event.currentTarget),
    xOffset = scale.offset().left,
    whichCase = scale.data('arrayIndex');

  function mousemove(event) {

    var factor = 100, value = (event.pageX - xOffset)/200;
    value = value > 1 ? 1 : value < 0 ? 0 : value;


    if ( whichCase===0 ) { factor = 360; }
    hsl[whichCase] = value*factor;

    refresh();

    if( $.isFunction(onChange) ){
      onChange( $.colors( hsl , 'array1Circle2Percentage','HSL') );
    }

    return false;
  }

  function mouseup(event){

    if( $.isFunction(onEndChange) ){
      onEndChange( $.colors( hsl , 'array1Circle2Percentage','HSL') );
    }

    $(document).unbind('mousemove', mousemove).unbind('mouseup', mouseup);
    wrapper.data('dragging',false);
  }

  setGlobals( $(this).closest('.hslLiteColorPicker').parent() );

  if(disabled){
    return true;
  }

  if( $.isFunction(onStartChange) ){
    onStartChange( $.colors( hsl , 'array1Circle2Percentage','HSL') );
  }

  if ( !wrapper.data('dragging') ) {
    $(document).bind('mousemove', mousemove).bind('mouseup', mouseup);
    wrapper.data('dragging',true);
  }

  mousemove(event);

  return false;

} /// mousedown


function refresh() {

  var opacityValuesArray, opacityValue;

  scales.each(function(){
    var self = $(this),
      whichCase = self.data('arrayIndex'),
      factor = 100;

    if( whichCase===0 ) { factor = 360; }

    self.children('span').css({
      left: hsl[ whichCase ]*200/factor
    });

  });


  if( hsl[2] > 50 ){
    opacityValue = (hsl[2]-50)*2/100;
    opacityValuesArray = [opacityValue, 1-opacityValue, 0];
  }else{
    opacityValue = (50-hsl[2])*2/100;
    opacityValuesArray = [0, 1-opacityValue, opacityValue];
  }
  /// gray is never 100%: otherwise background hue doesnt come through on IE7
  opacityValuesArray[1] *= 0.8;

  scales.filter('.h').children('div').css({
    backgroundColor: $.colors( [ 0, 0, hsl[2] ], 'array1Circle2Percentage','HSL').toString('rgb')
  }).css('opacity',Math.max(opacityValue,(100-hsl[1])/100));


  scales.filter('.s').css({
    backgroundColor: $.colors( [ hsl[0], 100, 50 ], 'array1Circle2Percentage','HSL').toString('rgb')
  }).children('div').each(function(i){
    $(this).css('opacity',opacityValuesArray[i]);
  });

  scales.filter('.l').css({
    backgroundColor: $.colors( [ hsl[0], hsl[1], 50 ], 'array1Circle2Percentage','HSL').toString('rgb')
  });

}


function setGlobals(thisContainer,options){

  container = thisContainer;

  /// create it if it doesn't exist
  if( !container.data('hslLiteColorPickerId') ){
    currentId = new Date().getTime();
    container.data('hslLiteColorPickerId',currentId);
    setuphslLiteColorPicker();

    settings[ currentId ] = {
      hsl:hsl,
      disabled:disabled,
      onStartChange:onStartChange,
      onChange:onChange,
      onEndChange:onEndChange
    };

  }else{

    wrapper = container.children();
    scales = wrapper.children('div.scale');
    currentId = container.data('hslLiteColorPickerId');
    hsl = settings[ currentId ].hsl;
    disabled = settings[ currentId ].disabled;

    onStartChange = settings[ currentId ].onStartChange;
    onChange = settings[ currentId ].onChange;
    onEndChange = settings[ currentId ].onEndChange;

  }
}


$.fn.hslLiteColorPicker = function(options){

  var returnedElements, resultsArray = [];

  if (typeof options == 'string' && this.data('hslLiteColorPickerId') ){
    if(options==='color'){
      return $.colors( settings[ this.data('hslLiteColorPickerId') ].hsl , 'array1Circle2Percentage','HSL');
    }else{
      return settings[ this.data('hslLiteColorPickerId') ][options];
    }
  }

  if(!ini){
    initiate();
  }

  returnedElements = this.each(function(){

    setGlobals($(this));

    if (typeof options == 'object' ) {

      applyOptions(options);

    }else if(options === 'hsl'){
      resultsArray.push(hsl);
    }

    refresh();

  });

  if( resultsArray.length>1 ){

    return resultsArray;

  }else if( resultsArray.length==1 ){

    return resultsArray[0];

  }else{

    return returnedElements;

  }

};


function applyOptions(options){

  var hslParameterIndexes = $.colors.models.HSL.parameterIndexes, optionName;

  for ( optionName in options ){

    if(optionName in hslParameterIndexes){
      settings[currentId].hsl[ hslParameterIndexes[ optionName ] ] = options[ optionName ];
      delete options[ optionName ];
    }

    if( optionName==='color' ){
      if( options[ optionName ] instanceof $.colors === false ){
        options[ optionName ] = $.colors( options[ optionName ] );
      }
      settings[currentId].hsl = options[ optionName ].model('HSL').format('array1Circle2Percentage');
      delete options[ optionName ];
    }

  }


  $.extend( settings[currentId], options);

  settings[currentId].hsl = $.colors.models.HSL.sanitize( settings[currentId].hsl ).slice(0,3);

  setGlobals(container); /// called twice: but then fast and logical

  if( 'disabled' in options ){

    if( options.disabled ){
      wrapper.addClass('disabled');
    }else{
      wrapper.removeClass('disabled');
    }

  }

}

  if( $.colors.pickers === undefined ){
    $.colors.pickers = {};
  }

  scriptSrc = $('script[src]'); // :last-child fails on chrome?
  if( scriptSrc.length>0 ){
    scriptSrc = scriptSrc.eq( scriptSrc.length -1).attr('src').split('/');
    scriptSrc.pop();
    scriptSrc = scriptSrc.join('/')+'/';
  }else{
    scriptSrc = '';
  }


  $.colors.pickers.hslLite = {
    pathToImages : scriptSrc
  };



function initiate(){

  var a, aMax, b, bMax,
    style=[
      /// wrapper
      ['.hslLiteColorPicker',
        ['display','inline-block']
      ], /// scale
      ['.hslLiteColorPicker>div.scale',
        ['height','1.5em'],
        ['border','1px solid #000'],
        ['margin','auto'],
        ['cursor','crosshair']
      ], /// handles
      ['.hslLiteColorPicker>div.scale>span.handle>span',
        ['color','#eee'],
        ['font-size','1.2em']
      ], /// handle outline
      ['.hslLiteColorPicker>div>span.handle>span.outline',
        ['color','#111'],
        ['font-size','1.4em']
      ], /// disabled scale
      ['.hslLiteColorPicker.disabled>div.scale',
        ['cursor','default']
      ], /// disabled handle
      ['.hslLiteColorPicker.disabled>div.scale>span.handle>span',
        ['opacity','0.5'],
        ['filter','alpha(opacity=50)']
      ], /// sprites
      ['.hslLiteColorPicker .sprite',
        ['background-image',"url('"+$.colors.pickers.hslLite.pathToImages+"jquery.colors.pickers.hslLite.sprite.png')"]
      ]
    ],
    styleElement = document.createElement('style'),
    thisStyle, beforeThis;

  /// confirm initiation
  ini = true;


  if( !/MSIE/.test(navigator.appVersion) ){

    style = style.concat([
    /// insert sprite.css here
[".hslLiteColorPicker .sprite",
["background-image","url('data:image/png;charset=\"utf-8\";base64,iVBORw0KGgoAAAANSUhEUgAAA94AAAABEAYAAAB4faoPAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAABFklEQVRYw+1X2w6DIAwFfdD99bKfVkyAbbDGeCk3cTHb6YPNKT3lpG00SmvFy97PvhfOyHddGHM+lsfVvd2O8XP17MeV8mgYvCc8jvt4HSfeOs7xOJ96T279WF3CV5hoKb/uZsQ6l3rObQS3Mam41sTDes7qeWzWqee1d4PLPzK50snEJjRN4XdW6X17eU0jpVLWSmdae28M4cbZjMPxWrzUesYs87e8WB53Xykvr14p77j+vL5et5/n7psQHret983HCM9xwpSxPOfitXip9Ur1r3npdWvz8uqV8qCf4z2c0ZfT/21svTF58W/zrqLj1/Wjn9CPfv6z/rszrdFP6Ec/oR/9hP4Qzxu+F9CPfkI/9gH6w7wnLhg+WFwMyfwAAAAASUVORK5CYII=')"]]
    /// end sprite.css
    ]);

  }

  styleElement.type = 'text/css';
  styleElement.charset = 'utf-8';
  styleElement.rel = 'stylesheet';

  for( a=0, aMax=style.length; a<aMax; a++ ){

    thisStyle = [ style[a][0] , '{' ];

    for( b=1, bMax=style[a].length; b<bMax; b++ ){
      thisStyle.push( style[a][b].join(':') , ';' );
    }

    thisStyle.push('}');

    style[a] = thisStyle.join('');
  }

  style = style.join('');


  beforeThis = document.getElementsByTagName('link');
  if(beforeThis.length===0){
    beforeThis = document.getElementsByTagName('style');
  }
  if(beforeThis.length!==0){
    document.getElementsByTagName('head')[0].insertBefore( styleElement, beforeThis[0] );
  }else{
    document.getElementsByTagName('head')[0].appendChild( styleElement);
  }


  /// http://www.mail-archive.com/jquery-en@googlegroups.com/msg16487.html
  if( styleElement.styleSheet ) {  // IE
    styleElement.styleSheet.cssText = style;
  }else{  // other browsers
    $(styleElement).text( style );
  }

}

})(jQuery);