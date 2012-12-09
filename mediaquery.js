/*!
 *  https://github.com/skaiser/mediaquery.js
 *  MIT License (MIT)
 *  Copyright (c) 2012 Stephen Kaiser
 */

(function (window, document, undefined) {
    
    var _jsmq,
        docEl,
        head = document.getElementsByTagName('head')[0];
        
    if (window.jsmq !== undefined) {
        return;
    }
    
    if (document && document.documentElement) {
        docEl = document.documentElement;
    } else {
        // Not in a browser?
        return;
    }
    
    
    _jsmq = (function () {
        
        var VERSION = '0.1.91',
            PREFIX = 'jsmq-',
            UNITS = 'em',
            DEFAULT_EVENT = "jsmq:update",
            prevClass = '',
            cfg = {};
            
        
        /**
         *  Responsive breakpoint sizes.
         *  Sizes default to em values.
         *  See: http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/
         */
        cfg.sizes = {
            '61': PREFIX + 'large',                      // 61em > 960px
            '60': PREFIX + 'medium',                     // 60em ~= 960px
            '45': PREFIX + 'small',                      // 45em ~= 720px
            '30': PREFIX + 'smaller'                     // 30em ~= 480px
        };
        
        
        // HTML id values of the elements that will be added to the page and queried
        cfg.elemNames = {
            'viewport'  : PREFIX + 'media-width',        // Viewport/browser width
            'device'    : PREFIX + 'media-device-width', // Width of actual device
            'css'       : PREFIX + 'styles'              // id for inline styles for unit tests    
        };
        
        
        // Set to 'true' to skip auto-appending of CSS and add your stylesheet
        cfg.useCustomStyles = false;
        
        
        // Support IE < 9. Are you sure you want to do that to yourself?
        cfg.supportOldIE = true;
        
        
        // Mapping of sizes by name - gets set later. Keeping reading :)
        cfg.names = {};
        
        
        /**
         *  getElementById shortcut
         *
         *  @method     _getId
         *  @param      {String}    id  HTML id selector string
         *  @returns    {Object}    The HTML node
         *  @private
         */  
        function _getId(id) {
            return document.getElementById(id);
        }
        
        
        /**
         *  Returns a new object that reverses the key/value pairs of another object.
         *  It is important to note that this allows us to cast the new value to
         *  a Number object so we can use the typeof operator in other methods
         *  to check whether we are doing a query by name or number value.
         *
         *  @method     _reverseKeyValue
         *  @param      {Object}    o           Object to have key/values reversed
         *  @param      {Boolean}   castNum     Whether to cast value to a Number
         *  @returns    {Object}                A new object with key/values reversed
         *  @private
         */
        function _reverseKeyValue(o, castNum) {
            var newObj = {},
                k;
            
            for (k in o) {
            
                if (o.hasOwnProperty(k)) {
                    newObj[o[k]] = castNum ? Number(k) : k;        
                }
            }
            return newObj;
        }
        
        
        /**
         *  This is used to switch key/values of cfg.sizes to make it so that we
         *  can do queries for the size using the CSS class name instead of the
         *  numeric value.
         */
        cfg.names = _reverseKeyValue(cfg.sizes, true);
        
        
        /**
         *  Returns local configuration object
         *
         *  @method     getConfig
         *  @param      [String]    prop    Optional. Specfici configuration propery name to query.
         *  @returns    {Object}            Local configuration object
         *  @public
         */
        function getConfig(prop) {
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
         *  @param      {Boolean}       useDeviceWidth  RETURNS THE VALUE BASED ON THE DEVICE'S WIDTH
         *  @returns    {Number}
         *  @private
         */
        function _getWidth(useDeviceWidth) {
            
            if (window.getComputedStyle) {
                _getWidth = function (useDeviceWidth) {
                    var cs = window.getComputedStyle,
                        elemName = useDeviceWidth ? 'device' : 'viewport';
                    return parseInt(cs(_getId(cfg.elemNames[elemName])).getPropertyValue('width'), 10);
                };
            }
            // Old IE
            else if (cfg.supportOldIE && window.currentStyle) {
                _getWidth = function (useDeviceWidth) {
                    var el,
                        fontSize,
                        elemName = useDeviceWidth ? 'device' : 'viewport',
                        width = useDeviceWidth ? screen.width : window.clientWidth;
                    
                    // We need to divide the pixel width by the font size if using ems.
                    // TODO: Uh...actually test this in an IE browser once I get another VM...
                    if (UNITS === 'em') {
                        el = _getId(cfg.elemNames[elemName]);
                        el.style.height = '1em';
                        fontSize = parseInt(el.currentStyle.height, 10) || 16;
                        // Original
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
            
        }
        // Overwrite self once we do object detection
        _getWidth();
        
        
        /**
         *  Allows us to check whether we are at a specific media query.
         *  Examples:
         *      jsmq.isAt('small');
         *      jsmq.isAt(45, true);
         *
         *  @method     isAt
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @public
         */
        function isAt(value) {
            value = typeof value === 'number' ? value : cfg.names[value];
            return value ? parseInt(value, 10) === _getWidth() : false;
        }
        
        
        /**
         *  Allows us to check whether we are at a specific media query BASED ON DEVICE WIDTH.
         *  Examples:
         *      jsmq.isAtDevice('small');
         *      jsmq.isAtDevice(45, true);
         *
         *  @method     isAtDevice
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @public
         */
        function isAtDevice(value) {
            value = typeof value === 'number' ? value : cfg.names[value];
            return value ? parseInt(value, 10) === _getWidth(true) : false;
        }
        
        
        /**
         *  Allows us to check whether we are BELOW a specific media query.
         *  Examples:
         *      jsmq.isBelow('large');
         *      jsmq.isBelow(61, true);
         *
         *  @method     isBelow
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @public
         */
        function isBelow(value) {
            value = typeof value === 'number' ? value : cfg.names[value];
            return value ? _getWidth() < parseInt(value, 10) : false;
        }
        
        
        /**
         *  Allows us to check whether we are BELOW a specific media query BASED ON DEVICE WIDTH.
         *  Examples:
         *      jsmq.isBelowDevice('large');
         *      jsmq.isBelowDevice(61, true);
         *
         *  @method     isBelowDevice
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @public
         */
        function isBelowDevice(value) {
            value = typeof value === 'number' ? value : cfg.names[value];
            return value ? _getWidth(true) < parseInt(value, 10) : false;
        }
        
        
        /**
         *  Creates and appends a CSS <style> element in <head> with our media query rules.
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
         *  Creates and appends an HTML element (default <script>) in <head>
         *  that represent our "hidden" elements that will be used to query against.
         *
         *  @method     _createElem
         *  @param      {String}        name        Name of element from cfg.elemNames (e.g., 'viewport' or 'device')
         *  @param      [String]        nodeType    Optional. Type of HTML element to add to page (e.g., 'div')
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
         *  Creates string of CSS to use in the inline <style> tag
         *
         *  @method     _writeMediaQuery
         *  @param      {String|Number}     val     Integer value representing the breakpoint width
         *  @returns    {String}                    String of CSS rules
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
                k,
                i; 
            
            /**
             *  Opera apparently iterates through objects in reverse order, so
             *  we can't trust browser implementations to be consistent and must
             *  force the order we want by first getting the property values,
             *  sorting them and then reversing it. Then, we can iterate back
             *  through to write the values in a "trusted" order.
             */
            for (k in cfg.sizes) {
                if (cfg.sizes.hasOwnProperty(k)) {
                    sorted.push(k);
                }
            }
            // Make sure that the highest value is first to maintain the cascade in CSS
            sorted.sort().reverse();
            
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
         *  Fires custom event. Default is to fire 'jsmq:update' on document.body
         *
         *  @method     fire
         *  @param      [String]    name    Optional. Name of custom event to fire
         *  @param      [Object]    elem    Optional. Native HTML DOM element to fire on
         *  @public
         */
        function fire(name, elem) {
            var ev;
            
            name = name || DEFAULT_EVENT;
            elem = elem || _getId(cfg.elemNames['viewport']);
            
            if (document.createEvent) {
                ev = document.createEvent('Event');
                ev.initEvent(name, true, true);
                elem.dispatchEvent(ev);
            }
        }
        
        
        /**
         *  Gets the current 'media query' state of the breakpoint we are at right now.
         *
         *  @method     get
         *  @param      {Boolean}   useDeviceWidth  Whether to check using device or viewport width. Default is viewport
         *  @returns    {String}                    The CSS class name (i.e., a word) value for the breakpoint we are currently at
         *  @public
         */
        function get(useDeviceWidth) {
            return cfg.sizes[_getWidth(useDeviceWidth)];
        }
        
        
        /**
         *  Adds the CSS class name (from cfg.sizes) to the <html> tag
         *
         *  @method     _setCssClass
         *  @private
         */
        function _setCssClass() {
            var currClass = get();
            docEl.className = (" " + docEl.className + " ").replace(prevClass, " " + currClass);
            prevClass = currClass;
        }
        
        
        /**
         *  Chainable. Does a fresh check of the current state and updates the CSS class name accordingly
         *
         *  @method     update
         *  @param      [String]    name        Optional. Name of custom event to fire after update
         *  @param      [Object]    elem        Optional. Native HTML DOM element to fire on
         *  @param      [Function]  callback    Optional. Callback after updating. Can be passed as a single argument.
         *  @returns    {Object}    The jsmq object
         *  @public
         */
        function update(name, elem, callback) {
            var args = [].slice.call(arguments),
                callbackFn = args.pop();
                
            _setCssClass();
            fire(name, elem);
            
            if (typeof callbackFn === 'function') {
                callbackFn.apply();
            }
            return this;
        }
        
        
        /**
         *  Runs things.
         *
         *  @method     init
         *  @public
         */
        function init() {
            if (!cfg.useCustomStyles) {
                _addInlineCss();
            }
            _addHiddenElems();
            update();
            return this;
        }
        
        
        
        /**
         *  Public methods.
         *  
         */
        return {
            VERSION         : VERSION,
            PREFIX          : PREFIX,
            DEFAULT_EVENT   : DEFAULT_EVENT,
            update          : update,
            fire            : fire,
            get             : get,
            init            : init,
            getConfig       : getConfig,
            isAt            : isAt,
            isAtDevice      : isAtDevice,
            isBelow         : isBelow,
            isBelowDevice   : isBelowDevice
        };
        
    })();
    
    
    // Export
    window.jsmq = _jsmq;
    window.jsmq_config = window.jsmq_config || {
        delayInit: false    
    };
    
    
    if (!window.jsmq_config.delayInit) {
        window.jsmq.init();   
    }
    
})(this, this.document);