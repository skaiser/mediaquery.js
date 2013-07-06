/*!
 *  https://github.com/skaiser/mediaquery.js
 *  MIT License (MIT)
 *  Copyright (c) 2012 Stephen Kaiser
 */

/**
 *  @module mediaquery.js
 *
 */
(function (window, document, undefined) {
    
    "use strict";
    
    var _jsmq,
        docEl = document.documentElement,
        head = document.getElementsByTagName('head')[0];
    
        
    
    /**
     *  @class jsmq
     *
     */
    _jsmq = (function () {
        
        /**
         *  Version info
         *  @property   VERSION
         *  @type       String
         */
        var VERSION = '0.4.3',
            prevClass = '',
            baseClass = '',
            initHasRun = false,
            sortedSizes,
            
            // Cache local versions of "constants"
            PREFIX,
            BELOW_PREFIX,
            UNITS,
            DEFAULT_EVENT,
            DEFAULT_EVENT_ELEM,
            
            // Function that will overwrite itself at runtime
            _getWidth,
            
            // Local configuration object
            cfg;
            
            
        /**
         *  If you want to set configuration options without changing them in the code base,
         *  use this. Since mediaquery.js is designed to run early in the page load and
         *  calls [init()](#method_init) on itself, **you need to set this before
         *  mediaquery.js run**. The recommended way is to just add it to the top of the min
         *  file, above the mediaquery.js code. Or you can load it in an extra script tag
         *  (like we do in the [tests/SpecRunner.html file](https://github.com/skaiser/mediaquery.js/blob/master/tests/SpecRunner.html))
         *  See other attribute for options.
         *
         *  @property   window.jsmq_config
         *  @type       Object
         *  @example
         *      // Override default options
         *      window.jsmq_config = { 
         *          useMyOwnStyles: true, 
         *          useMyOwnElements: true
         *      }; 
         */
        cfg = window.jsmq_config || {};
            
        
        /**
         *  Prefix to use on CSS classes and appended page elements.
         *
         *  @attribute  PREFIX
         *  @type       String
         *  @default    'jsmq-'
         */
        cfg.PREFIX = PREFIX = cfg.PREFIX || 'jsmq-';
        
        
        /**
         *  CSS classname prefix that will be used for sizes below a given size.
         *  For example: 'below-jsmq-medium' would be valid to use if you wanted to target
         *  styles for all cases below the 'medium' width.
         *
         *  @attribute  BELOW_PREFIX
         *  @type       String
         *  @default    'below-'
         *  
         *  @example
         *      .below-jsmq-medium .hero-unit p {
         *          font-size: 17px;
         *      }
         *      .below-jsmq-medium .carousel-control {
         *          left: -5px;
         *          top: -20px;
         *      }
         *  Targets all devices BELOW the medium width (i.e., the 'small' width and lower).
         *  Similar to @media (max-width: 720px) {...}
         *  or @media (max-width: 45em) {...}
         *  
         *  @example
         *      .jsmq-medium .hero-unit {
         *          padding: 45px 15px;
         *      }
         *  Targets all devices AT the medium width only.
         *  Similar to @media (min-width: 721px) and (max-width: 960px) { ... }
         *  or @media (min-width: 45em) and (max-width: 60em) { ... }
         */
        cfg.BELOW_PREFIX = BELOW_PREFIX = cfg.BELOW_PREFIX || 'below-';
        
        
        /**
         *  Default unit sizes to use for breakpoints. If you don't think you
         *  should use 'em', please consider this:
         *  http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/
         *
         *  @attribute  UNITS
         *  @type       String
         *  @default    'em'  - Other valid values would be 'px'. Or maybe even '%'?!
         */
        cfg.UNITS = UNITS = cfg.UNITS || 'em';
        
        
        /**
         *  Responsive breakpoint sizes. **Sizes default to em values**.
         *  These are probably the most interesting config option. Customize to suit
         *  your project's needs.
         *  
         *  Why did we default to ems?
         *  See: http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/
         *
         *  @attribute  sizes
         *  @type       Object
         *  @default    See example.
         *  @example
         *      window.jsmq_config.sizes = {
         *          '61': PREFIX + 'large',                      // 61em > 960px
         *          '60': PREFIX + 'medium',                     // 60em ~= 960px
         *          '45': PREFIX + 'small',                      // 45em ~= 720px
         *          '30': PREFIX + 'smaller'                     // 30em ~= 480px
         *      };
         */
        cfg.sizes = cfg.sizes || {
            '61': PREFIX + 'large',
            '60': PREFIX + 'medium',
            '45': PREFIX + 'small',
            '30': PREFIX + 'smaller'
        };
        
        
        /**
         *  HTML id values of the elements that will be added to the page and queried.
         *
         *  @attribute  elemNames
         *  @type       Object
         *  @default    See example.
         *  @example
         *      window.jsmq_config.elemNames = {     
         *          'viewport'  : PREFIX + 'media-width',        // Viewport/browser width
         *          'device'    : PREFIX + 'media-device-width', // Width of actual device
         *          'css'       : PREFIX + 'styles'              // id for inline styles for unit tests
         *      };
         */
        cfg.elemNames = cfg.elemNames || {
            'viewport'  : PREFIX + 'media-width',        // Viewport/browser width
            'device'    : PREFIX + 'media-device-width', // Width of actual device
            'css'       : PREFIX + 'styles'              // id for inline styles for unit tests
        };
        
        
        /**
         *  Set to 'true' to skip auto-appending of CSS and add your stylesheet.
         *  Could minimize reflows.
         *
         *  @attribute  useMyOwnStyles
         *  @type       Boolean
         *  @default    false
         *  @example
         *      window.jsmq_config.useMyOwnStyles = true;
         */
        cfg.useMyOwnStyles = cfg.useMyOwnStyles || false;
        
        
        /**
         *  Set to 'true' is you want to use elements that you've already added.
         *  Could minimize reflows.
         *
         *  @attribute  useMyOwnElements
         *  @type       Boolean
         *  @default    false
         *  @example
         *      window.jsmq_config.useMyOwnElements = true; 
         */
        cfg.useMyOwnElements = cfg.useMyOwnElements || false;
        
        
        /**
         *  Support IE and other old browsers with no native media query support. Causes us to
         *  use the width of the viewport and in the case of using 'ems', we have to do some math.
         *  Are you sure you want to support responsive in these devices/browsers?
         *
         *  @attribute  supportOldBrowsers
         *  @type       Boolean
         *  @default    true (for now, mostly so demos show it working...I recommend setting this to false)
         *  @since      0.3.3
         *  @example
         *      window.jsmq_config.supportOldBrowsers = false;
         */
        cfg.supportOldBrowsers = cfg.supportOldBrowsers || true;
        
        
        /**
         *  TODO: IE9+ should be supported without supporting IE < 9 since they natively supports media queries.
         *
         *  @attribute  notIEBelow9
         *  @type       Boolean
         *  @default    (Not yet implemented). See https://github.com/skaiser/mediaquery.js/issues/10
         */
        //cfg.notIEBelow9 = true;
        
        
        /**
         *  Name of custom event that gets fired when media query update/change occurs.
         *
         *  @attribute  DEFAULT_EVENT
         *  @type       String
         *  @default    'jsmq:update'
         */
        cfg.DEFAULT_EVENT = DEFAULT_EVENT = cfg.DEFAULT_EVENT || 'jsmq:update';
        
        
        /**
         *  Default native DOM element to bind the default [update()](#method_update) event to.
         *
         *  @attribute  DEFAULT_EVENT_ELEM
         *  @type       String
         *  @default    cfg.elemNames['viewport'] (i.e., 'jsmq-media-width')
         */
        cfg.DEFAULT_EVENT_ELEM = DEFAULT_EVENT_ELEM = cfg.DEFAULT_EVT_ELEM || cfg.elemNames['viewport'];
        
        
        /**
         *  Whether to delay calling [init()](#method_init) at load or not.
         *  Mostly useful for unit testing and demos.
         *
         *  @attribute  delayInit
         *  @type       Boolean
         *  @default    false
         */
        cfg.delayInit = cfg.delayInit || false;
        
        
        /**
         *  For unit testing. Are we running tests or not?
         *
         *  @attribute  isTest
         *  @type       Boolean
         *  @default    false
         */
        cfg.isTest = cfg.isTest || false;
        
        
        /**
         *  **Do not set this yourself with set(). They are defined in [sizes](#attr_sizes) and
         *  this is automagically mapped to [sizes](#attr_sizes)**. It is available for convenience
         *  in reading state or doing checks later on, but is auto-populated (also for convenience),
         *  so that you don't have to manage both sets of data. The values are CSS classnames
         *  that represent your breakpoint sizes. These are the names you will scope your CSS
         *  selectors with to emulate @media rules.
         *  Use [PREFIX](#attr_PREFIX) to change the 'jsmq-' value.
         *  
         *  @attribute  names
         *  @type       Object
         *  @default    'jsmq-large', 'jsmq-medium', 'jsmq-small', 'jsmq-smaller'
         *  @readonly
         *  @example
         *      var MyApp.MEDIUM_WIDTH = 60;
         *      if (jsmq.get('names')[jsmq.isAt()] === MyApp.MEDIUM_WIDTH) {
         *          // Do stuff
         *      }
         */
        cfg.names = {};
        
        
        
        /**
         *  getElementById shortcut
         *
         *  @method     _getId
         *  @param      {String}    id  HTML id selector string
         *  @return     {Object}    The HTML node
         *  @private
         */  
        function _getId(id) {
            return document.getElementById(id);
        }
        
        
        /**
         *  Trim leading and trailing whitespace from string
         *
         *  @method     _trim
         *  @param      {String}            str     String to remove whitespace from
         *  @return     {String}                    Modified string
         *  @private
         */
        function _trim(str) {
            return str.replace(/^\s+|\s+$/g, '');
        }
        
        
        /**
         *  Finds the index of a value in an Array. Basically the same as jQuery's $.inArray.
         *
         *  @method     _inArray
         *  @param      {String|Number} val     The value you want to find the index of
         *  @param      {Array}         arr     The array to search in
         *  @param      {Number}        i       The start index
         *  @return     {Number}                Just like indexOf, it returns -1 if no match
         *                                      and > -1 if there is a match
         *  @private
         */
        function _inArray(val, arr, i) {
            var len;
            
            if (arr) {
                len = arr.length;
                i = (i && i < len - 1) ? i : 0;
            
                for (; i < len; i++) {
        
                    if (i in arr && arr[i] == val) {
                        return i;
                    }
                }
            }
            
            return -1;
        }
        
        
        /**
         *  Returns the key name from an object using the value to find it.
         *
         *  @method     _key
         *  @param      {String|Number}     key     The key's value
         *  @param      {Object}            o       The object to search in
         *  @return     {String}                    The key's actual name
         *  @private
         */
        function _key(key, o) {
            var prop;
            o = o || cfg.sizes;
            
            for (prop in o) {
                if (o.hasOwnProperty(prop)) {
                    if (o[prop] === key) {
                        return prop;
                    }
                }
            }
        }
        
        /**
         *  Returns a new object that reverses the key/value pairs of another object.
         *  It is important to note that this allows us to cast the new value to
         *  a Number object so we can use the typeof operator in other methods
         *  to check whether we are doing a query by name or number value.
         *
         *  @method     _reverseKeyValue
         *  @param      {Object}    o           Object to have key/values reversed
         *  @param      {Boolean}   [castNum]   Whether to cast value to a Number
         *  @return     {Object}                A new object with key/values reversed
         *  @private
         */
        function _reverseKeyValue(o, castNum) {
            var newObj = {},
                k;
            
            for (k in o) {
            
                if (o.hasOwnProperty(k)) {
                    // TODO: Just use parseInt?
                    newObj[o[k]] = castNum ? Number(k) : k;        
                }
            }
            return newObj;
        }
        
        
        /*
         *  This is used to switch key/values of cfg.sizes to make it so that we
         *  can do queries for the size using the CSS class name instead of the
         *  numeric value.
         */
        cfg.names = _reverseKeyValue(cfg.sizes, true);
        
        
        
        /**
         *  Returns the configuration object or optionally, a specific attribute.
         *
         *  @method     get
         *  @param      {String}    [prop]  Specfic configuration propery name to query.
         *  @return     {Object}            Local configuration object or specific property.
         *  @public
         *  @example
         *      jsmq.get('names');		// { 'jsmq-large' : 61, 'jsmq-medium': 60 }, etc.
         *      jsmq.get('sizes');		// { '61': 'jsmq-large', '60': 'jsmq-medium' }, etc.
         */
        function get(prop) {
            // Some properties can be 'false' so need to check against 'undefined'
            return cfg[prop] !== undefined ? cfg[prop] : cfg;
        }
        
        
        /**
         *  Returns the computed style of the special elements that were added to
         *  the page. The value will be changed by CSS media queries and this
         *  method will return the current value, effectively emulating a CSS
         *  media query @media rule.
         *
         *  @method     _getWidth
         *  @param      {Boolean}       [useDeviceWidth]    RETURNS THE VALUE BASED ON THE DEVICE'S WIDTH
         *  @return     {Number}                            Number value representing the width
         *  @private
         */
        _getWidth = function (useDeviceWidth) {
            
            if (window.getComputedStyle && window.matchMedia) {
                _getWidth = function (useDeviceWidth) {
                    var cs = window.getComputedStyle,
                        elemName = useDeviceWidth ? 'device' : 'viewport';
                    return parseInt(cs(_getId(cfg.elemNames[elemName])).getPropertyValue('width'), 10);
                };
            }
            // Old IE
            else if (cfg.supportOldBrowsers && (head.currentStyle || window.getComputedStyle)) {
                _getWidth = function (useDeviceWidth) {
                    var el,
                        fontSize,
                        height = '1em',
                        elemName = useDeviceWidth ? 'device' : 'viewport',
                        width = useDeviceWidth ? screen.width : window.innerWidth || docEl.clientWidth;
                    
                    // We need to divide the pixel width by the font size if using ems.
                    if (UNITS === 'em') {
                        el = _getId(cfg.elemNames[elemName]);
                        el.style.height = height;
                        
                        if (el.currentStyle) {
                            height = el.currentStyle.height;
                        } else {
                            height = window.getComputedStyle(el).getPropertyValue('height');
                        }
                        // IE8 (others?) doesn't convert to px, so check to see if still in 'em'
                        // and fallback to browser default size if so
                        fontSize = height.match(/em/) !== null ? 16 : parseInt(height, 10);
                        // Put it back to original
                        el.style.height = 0;
                        
                        return width / fontSize;
                    }
                    return width;
                };
            } else {
                _getWidth = function () {
                    return 0;
                };
            }
            
        };
        // Overwrite self once we do object detection
        _getWidth();
        
        
        
        /**
         *  Makes sure the sizes are in order from highest to lowest
         *  since browser implementations may not ensure the order
         *  of object properties when doing a 'for in' loop.
         *  Returns an array of [sizes](#attr_sizes) number values sorted high to low.
         *  This is very helpful in setting some constants within your own app code that you
         *  can use later with [isAt()](#method_isAt) or [isBelow()](#method_isBelow)
         *  in `if` statements without needing to know the names of the sizes ahead of time.
         *  You just configure them once for mediaquery.js and that's it!
         *
         *  @method     getSortedSizes
         *  @return     {Array}         Array of [sizes](#attr_sizes) number values sorted high to low
         *  @public
         *  @example
         *      var mySizes = jsmq.getSizes();                          // [61, 60, 45, 30]
         *      var LARGE_WIDTH = jsmq.get('sizes')[mySizes[0]];        // 'jsmq-large'
         *
         *      if (jsmq.isAt() === LARGE_WIDTH)) { 
         *          // do stuff
         *      }
         *      
         *      // OR
         *
         *      if ($('html').hasClass(LARGE_WIDTH)) { 
         *          // do stuff
         *      }
         */
        function getSortedSizes() {
            var sorted = [],
                sizes = cfg.sizes,
                size;
            
            for (size in sizes) {
                if (sizes.hasOwnProperty(size)) {
                    sorted.push(size);    
                }
            }
            
            // Make sure that the highest value is first to maintain the cascade in CSS
            return sorted.sort().reverse();
        }
        
        
        sortedSizes = getSortedSizes();
        
        /**
         *  This sucks. But IE may not return a match on cfg.sizes[size],
         *  so we need to see if the current width is within our current range
         *  (i.e., is the width currently between 60 and 45 ems?)
         *
         *  @method     _findRange
         *  @param      {Number}    width   Width value of screen or viewport
         *  @return     {String}            String value of the current CSS class based on current JSS media query
         *  @private
         */
        function _findRange(width) {
            var sorted = getSortedSizes(),
                len = sorted.length,
                upper = sorted[0],
                i = 1;
                
            // Lower value of last range is 0
            for (; i <= len; i++) {
                
                if (width <= upper && width > (sorted[i] || 0)) {
                    return cfg.sizes[upper];
                }
                upper = sorted[i];
            }
            // Default to largest if no matches
            return cfg.sizes[sorted[0]]; 
        }
        
        
        /**
         *  Allows us to check whether we are at a specific media query.
         *
         *  @method     isAt
         *  @param      {Boolean|String|Number} [value]             Boolean to use device-width or string for CSS classname
         *                                                          (from [get('names')](#attr_names)) or number (from [get('sizes')](#attr_sizes))
         *  @param      {Boolean}               [useDeviceWidth]    Boolean of whether to use **media-device-width** media query
         *  @return     {Boolean|String}                            No arguments or single bool returns CSS class name string. Others return boolean.
         *  @public
         *  @example
         *      jsmq.isAt();                // 'jsmq-large', etc.
         *      jsmq.isAt(true);            // 'jsmq-large'
         *      jsmq.isAt('jsmq-small');    // true/false
         *      jsmq.isAt(45, true);        // true/false
         */
        function isAt(value, useDeviceWidth) {
            
            if (value === undefined || typeof value === 'boolean') {
                useDeviceWidth = value;
                // If device doesn't support media query and cfg uses 'em', we may not get back a match.
                //  Fallback to largest size defined
                var width = _getWidth(useDeviceWidth);
                return cfg.sizes[width] || _findRange(width);
            }
            
            if (typeof value === 'string') {
                value = cfg.names[value];
            }
            return value ? parseInt(value, 10) === _getWidth(useDeviceWidth) : false;

        }
        
        
        /**
         *  Is the current media query BELOW our current width? I've found this very useful for
         *  doing some branching logic where I needed to animate to 100% if below a certain
         *  width, etc. Though the example below is quite contrived. I will update it once I get
         *  a better demo running.
         *
         *  @method     isBelow
         *  @param      {String|Number} [value]             Either a string for CSS classname (from [get('names')](#attr_names))
         *                                                  or number (from [get('sizes')](#attr_sizes))
         *  @param      {Boolean}       [useDeviceWidth]    Boolean of whether to use **media-device-width** media query
         *  @return     {Boolean}                           Boolean of whether current width is below a given width.
         *  @public
         *  @example
         *      // Animate a panel 100% width if below a certain width or 200px, if larger.
         *      var mySizes = jsmq.getSizes();      // [61, 60, 45, 30]
         *      var MEDIUM_WIDTH = mySizes[1];      // '60'
         *
         *      if (jsmq.isBelow(MEDIUM_WIDTH))) { 
         *          $panel.animate({width: '100%'});
         *      } else {
         *          $panel.animate({width: '200px'});
         *      }
         *      
         *      // OR
         *      
         *      if ($('html').hasClass('jsmq-lt-medium')) { 
         *          // do stuff
         *      }
         */
        function isBelow(value, useDeviceWidth) {
            value = typeof value === 'number' ? value : cfg.names[value];
            return value ? _getWidth(useDeviceWidth) < parseInt(value, 10) : false;
        }
        
        
        /**
         *  Creates and appends a CSS style element in head with our media query rules.
         *
         *  @method     _createCssElem
         *  @param      {String}        styles  String of CSS rules to be added to page
         *  @private
         */
        function _createCssElem(styles) {
            var el = document.createElement('style');
            el.type = 'text/css';
            // Set and id so we can use it for unit tests
            el.setAttribute('id', cfg.elemNames['css']);
            
            if (el.styleSheet) {
                el.styleSheet.cssText = styles;
            } else {
                el.appendChild(document.createTextNode(styles));
            }
            head.appendChild(el);
        }
        
        
        /**
         *  Creates and appends an HTML element (default script) in head
         *  that represent our "hidden" elements that will be used to query against.
         *
         *  @method     _createElem
         *  @param      {String}        name        Name of element from cfg.elemNames (e.g., 'viewport' or 'device')
         *  @param      {String}        [nodeType]  Type of HTML element to add to page (e.g., 'div')
         *  @return     {HTMLElement}   el          The native DOM element that was created
         *  @private
         */
        function _createElem(name, nodeType) {
            var el = document.createElement(nodeType || 'script'),
                id = cfg.elemNames[name];
            el.setAttribute('id', id);
            return el;
        }
        
        
        /**
         *  Adds our "hidden" elements to the page
         *
         *  @method     _addHiddenElems
         *  @private
         */
        function _addHiddenElems() {
            head.appendChild(_createElem('viewport'));
            head.appendChild(_createElem('device'));
        }
        
        
        /**
         *  Creates string of CSS to use in the inline style tag
         *
         *  @method     _writeMediaQuery
         *  @param      {String|Number}     val     Integer value representing the breakpoint width
         *  @return     {String}                    String of CSS rules
         *  @private
         */
        function _writeMediaQuery(val) {
            return  '@media only screen and (max-width: ' + val + UNITS + ') {' +
                        '#' + cfg.elemNames.viewport + ' {' +
                            'width: ' + val + 'px;' +
                        '}' +
                    '}\n' +
                    '@media only screen and (max-device-width: ' + val + UNITS + ') {' +
                        '#' + cfg.elemNames.device + ' {' +
                            'width: ' + val + 'px;' +
                        '}' +
                    '}\n';
        }
        
        
        /**
         *  Loops through cfg.sizes to create required CSS rules to add to page.
         *
         *  @method     _addInlineCss
         *  @private
         */
        function _addInlineCss() {
            var sorted = [],
                css = '',
                i; 
            
            /*
             *  Opera apparently iterates through objects in reverse order, so
             *  we can't trust browser implementations to be consistent and must
             *  force the order we want by first getting the property values,
             *  sorting them and then reversing it. Then, we can iterate back
             *  through to write the values in a "trusted" order and make sure
             *  the highest value is first to maintain the cascade in CSS.
             */
            sorted = getSortedSizes();
            
            for (i = 0; i < sorted.length; i++) {
                
                // Default size to largest. It doesn't need to be in at @media
                if (i === 0) {
                    css =   '#' + cfg.elemNames.viewport + ',' +
                            '#' + cfg.elemNames.device + ' {' +
                                // Hide element in case not using <script>
                                'height: 0;' +    
                                'display: none;' +
                                'position: absolute;' +
                                'left: -999999em;' +
                                'z-index: -10;' +
                                'width: ' + sorted[i] + 'px;' +
                            '}\n';
                } else { 
                    css += _writeMediaQuery(sorted[i]);   
                }
            }
            
            _createCssElem(css);
        }
        
        
        /**
         *  Fires custom event. Default is to fire 'jsmq:update' on the default media element.
         *
         *  @method     fire
         *  @param      {String}        [name]        Name of custom event to fire
         *  @param      {HTMLElement}   [elem]        Native HTML DOM element to fire on
         *  @param      {String}        [className]   Current class name used on the page (e.g., 'jsmq-large')
         *  @public
         *  @example
         *      jsmq.fire();
         */
        function fire(name, elem, className) {
            var ev;
            
            name = name || DEFAULT_EVENT;
            elem = elem || _getId(DEFAULT_EVENT_ELEM);
            // prevClass should actually contain current class in the default setup
            className = className || prevClass;     
            
            if ("createEvent" in document) {
                ev = document.createEvent('Event');
                ev.initEvent(name, true, true);
                // Pass helpful info
                ev.className = className;
                ev.baseClass = baseClass;
                ev.size = cfg.names[baseClass] || _key(baseClass);
                elem.dispatchEvent(ev);    
            }
        }
        
        
        /**
         *  Finds the index in the sorted sizes array that using the CSS classname string.
         *  This helps us to know what size comes before (or after) this size.
         *
         *  @method     _findPos
         *  @param      {String}    at  String for the CSS classname of the position to find.
         *  @return     {Number}        Index in the sorted array of CSS class. Return -1 if not
         *  @private
         */
        function _findPos(at) {
            return _inArray(_key(at), sortedSizes);
        }
        
        
        /**
         *  Finds the CSS classname of the size that is larger than the passed in size.
         *
         *  @method     _findPrevPos
         *  @param      {Number}        pos     Index in the sorted size array to start from.
         *  @return     {String}                CSS classname of the next largest breakpoint.
         *  @private
         */
        function _findPrevPos(pos) {
            if (pos > 0 && pos < sortedSizes.length) {
                return cfg.sizes[sortedSizes[pos - 1]];
            }
        }
        
        
        /**
         *  Returns the CSS classname of the next largest breakpoint, if there is one.
         *
         *  @method     nextLarger
         *  @param      {String}        at  CSS classname of the size to find a larger value for
         *  @return     {String}            CSS classname of the next largest breakpoint, if one
         *  @public
         *  @example
         *      if (jsmq.nextLarger(jsmq.isAt()) === 'jsmq-medium') {
         *          // Do stuff
         *      }
         */
        function findNextLarger(at) {
            return _findPrevPos(_findPos(at));
        }
        
        
        /**
         *  Returns a string containing CSS classnames for all larger breakpoints with a
         *  'below-' modifier on the classname so that you can do something like the following
         *  example in your CSS rules to target all sizes below a certain size.
         *
         *  @method     allLarger
         *  @param      {String}        at  CSS classname of the size to find larger values for
         *  @return     {String}            String with CSS classes for all larger breakpoints.
         *  @public
         *  @example
         *      jsmq.allLarger('jsmq-smaller');     // "jsmq-lt-small jsmq-lt-medium jsmq-lt-large"
         *  In your CSS, you could do something like the following to reduce the
         *  font-size for `<h1>` elements for all breakpoints below the 'medium' breakpoint size:
         *  @example
         *      .below-jsmq-medium h1 { font-size: 0.8em; }
         */
        function findAllLarger(at) {
            var pos = _findPos(at),
                str = '';
                
            if (pos > 0) {
                do {
                    str += _buildBelowClass(_findPrevPos(pos)) || '';
                } while (pos--);
            }
            return str;
        }
        
        
        /**
         *  Makes a CSS classname with a "less than" indicator in the name for using to apply
         *  CSS rules that apply to any breakpoint below a certain size.
         *
         *  @method     _buildBelowClass
         *  @param      {String}            str     CSS classname to modify.
         *  @return     {String}                    Modified classname
         *  @private
         */
        function _buildBelowClass(str) {
            return str ? ' ' + BELOW_PREFIX + str : '';
        }
        
        
        /**
         *  Adds the CSS class name (from cfg.sizes) to the html tag
         *
         *  @method     _setCssClass
         *  @private
         */
        function _setCssClass() {
            var currClass = isAt();
            // Issue #11: Fire does not always return proper size
            baseClass = currClass;
            
            if (prevClass !== currClass) {
                currClass += findAllLarger(currClass);
                docEl.className = _trim(docEl.className).replace(prevClass, currClass);
                prevClass = currClass;
                return prevClass;    
            }
        }
        
        
        /**
         *  Refreshes the current CSS class. Useful after a window resize.
         *  It also [fires an event](#event_jsmq:update) after an update occurs.
         *  Accepts a callback function.
         *
         *  @method     update
         *  @param      {String}        [name]      A string containing the name of the custom event to fire
         *  @param      {HTMLElement}   [elem]      Native HTML DOM element to fire on
         *  @param      {Function}      [callback]  Callback after updating. Can be passed as a single argument.
         *  @return     {Object}                    The jsmq object
         *  @chainable
         *  @public
         *  @example
         *      jsmq.update(function (e) {
         *          if (e.size === MyApp.MEDIUM_WIDTH) {
         *              hidePanel();   
         *          }
         *      });
         */
        function update(name, elem, callback) {
            var args = [].slice.call(arguments),
                callbackFn = args.pop(),
                changed;
            
            changed = _setCssClass();
            
            if (changed) {
                /**
                 *  Fires after a CSS class change event occurs when [update()](#method_update) is called.
                 *  The following additional properties are available on the Event Object
                 *  to help with filtering logic after an event:       
                 *  **event.className**: String of all current (jsmq) CSS classes being used (e.g., 'jsmq-medium below-jsmq-large')      
                 *  **event.size**: Size (number) of the CSS class      
                 *  **event.baseClass**: The base class value for the size we are at (i.e., what [isAt()](#method_isAt) would return) 
                 *  
                 *  @event      jsmq:update
                 *  @bubbles
                 *  @example
                 *      $('#jsmq-media-width').on('jsmq:update', function (e) {
                 *      
                 *          if (e.className.match(MyApp.LARGE_WIDTH)) {
                 *              // Do stuff for large screens
                 *          }
                 *          
                 *          // OR
                 *
                 *          if (e.size === 45) {
                 *              // Do stuff 
                 *          }
                 *
                 *          // OR
                 *
                 *          if (e.baseClass === MyApp.MEDIUM_WIDTH) {
                 *              // Do stuff for medium screens
                 *          }
                 *
                 *          // OR
                 *
                 *          if ($('html').hasClass(MyApp.LARGE_WIDTH)) {
                 *              // Do stuff
                 *          }
                 *      });
                 */
                fire(name, elem, changed);
            }
            
            // TODO: Is it more intuitive to ALWAYS call this or only if changed?
            if (typeof callbackFn === 'function') {
                callbackFn.apply();
            }
            
            return window.jsmq;
        }
        
        
        /**
         *  Set a configuration property/attribute. Note that you probably want to set up the
         *  [delayInit](#attr_delayInit) configuration attribute to delay calling
         *  [init()](#method_init) to make good use of this method. Otherwise,
         *  [init()](#method_init) runs as soon as the script loads and your config
         *  options/attributes have already been passed in.
         *
         *  @method     set
         *  @param      {String}    prop    String representation of configuration attribute name
         *  @param      {ANY}       value   Any valid JavaScript data type you want to store
         *  @return     {Object}            The jsmq object
         *  @chainable
         *  @public
         *  @example
         *      jsmq.set('isTest', true);
         */
        function set(prop, value) {
            
            if (typeof prop === 'string' && value !== undefined) {
                cfg[prop] = value;
                
                // Need to update names if size and vice versa
                if (prop === 'sizes') {
                    cfg.names = _reverseKeyValue(cfg.sizes, true);
                } else if (prop === 'names') {
                    cfg.sizes = _reverseKeyValue(cfg.names);
                } else if (prop === 'removeTest') {
                    // For testing. Delete both test val and revemoTest prop
                    delete cfg[value];
                    delete cfg[prop];
                }
                // Only return 'this' if params were correct so we can test it.
                return window.jsmq;
            }
        }
        
        
        /**
         *  Reloads the configuration by removing our media query nodes and CSS.
         *  Really only useful for unit testing, I think.
         *
         *  @method     reload
         *  @return     {Object}    The jsmq object
         *  @chainable
         *  @public
         */
        function reload() {
            
            // parentNode holds a reference to the removed node, so create a new
            // var for head to avoid 'polluting' our original reference.
            // See: https://developer.mozilla.org/en-US/docs/DOM/Node.removeChild
            var parentNode = head,
                elems = cfg.elemNames,
                prop;
                
            for (prop in elems) {
                if (elems.hasOwnProperty(prop)) {
                    // In case we already removed them with reload()
                    try {
                        parentNode.removeChild(_getId(elems[prop]));    
                    } catch (e) {}
                    
                    // TODO: If this gets used for more than testing, we need to remove event listeners
                }
            }
            parentNode = null;
            initHasRun = false;
            
            return window.jsmq;
        }
        
        
        /**
         *  Runs things. **This runs automagically at load by default**. See [jsmq_config](#property_window.jsmq_config)
         *  and/or [reload()](#method_reload) if you want to call this manually later.
         *
         *  @method     init
         *  @return     {Object}    The jsmq object
         *  @chainable
         *  @public
         */
        function init() {
            
            // Prevent init() from being accidentally run twice (by dev calling .init() manually
            // and not explicitly doing it by using cfg.delayInit) since it runs at load by default.
            if (!initHasRun) {
                
                if (!cfg.useMyOwnStyles) {
                    _addInlineCss();
                }
                
                if (!cfg.useMyOwnElements) { 
                    _addHiddenElems();   
                }
                update();
                
            } else if (initHasRun && cfg.isTest) {
                // Mostly for controlling environment for unit testing
                reload();
            }
            
            initHasRun = true;
            return window.jsmq;
        }
        
        
        
        /*
         *  Public methods.
         *  
         */
        return {
            VERSION         : VERSION,
            update          : update,
            fire            : fire,
            get             : get,
            set             : set,
            init            : init,
            isAt            : isAt,
            isBelow         : isBelow,
            reload          : reload,
            getSizes        : getSortedSizes,
            nextLarger      : findNextLarger,
            allLarger       : findAllLarger
        };
        
    })();
    
    
    // Export
    window.jsmq = _jsmq;
    
    
    if (!window.jsmq.get('delayInit')) {
        window.jsmq.init();   
    }
    
    
})(window, window.document);
