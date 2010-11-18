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