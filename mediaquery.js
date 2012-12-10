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
    
    var _jsmq,
        docEl = document.documentElement,
        head = document.getElementsByTagName('head')[0];
    
        
    
    /**
     *  @class jsmq
     *
     */
    _jsmq = (function () {
        
        var VERSION = '0.3.0',
            prevClass = '',
            initHasRun = false,
            
            // Cache local versions of "constants"
            PREFIX,
            UNITS,
            DEFAULT_EVENT,
            DEFAULT_EVENT_ELEM,
            
            // Local configuration object
            cfg;
            
            
        // Allow configurations to be passed in manually while still calling
        // init() automagically at load. Anyone have any better techniques?
        cfg = window.jsmq_config || {};
            
        
        // Prefix that will be added to CSS class names and the HTML element ids
        cfg.PREFIX = PREFIX = cfg.PREFIX || 'jsmq-';
        
        
        // Default unit sizes to use for breakpoints. If you don't think you
        // should use 'em', please consider this:
        // http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/
        cfg.UNITS = UNITS = cfg.UNITS || 'em';
        
        
        /**
         *  Responsive breakpoint sizes.
         *  Sizes default to em values.
         *  See: http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/
         */
        cfg.sizes = cfg.sizes || {
            '61': PREFIX + 'large',                      // 61em > 960px
            '60': PREFIX + 'medium',                     // 60em ~= 960px
            '45': PREFIX + 'small',                      // 45em ~= 720px
            '30': PREFIX + 'smaller'                     // 30em ~= 480px
        };
        
        
        // HTML id values of the elements that will be added to the page and queried
        cfg.elemNames = cfg.elemNames || {
            'viewport'  : PREFIX + 'media-width',        // Viewport/browser width
            'device'    : PREFIX + 'media-device-width', // Width of actual device
            'css'       : PREFIX + 'styles'              // id for inline styles for unit tests    
        };
        
        
        // Set to 'true' to skip auto-appending of CSS and add your stylesheet. Could minimize reflows.
        cfg.useMyOwnStyles = cfg.useMyOwnStyles || false;
        
        
        // Set to 'true' is you want to use elements that you've already added. Could minimize reflows.
        cfg.useMyOwnElements = cfg.useMyOwnElements || false;
        
        
        // TODO: Think about renaming this to indicate something more like "support browsers that don't
        //  support media queries and/or window.getComputedStyle". It's not just IE, right?
        // Support IE < 9. Are you sure you want to do that to yourself?
        cfg.supportOldIE = cfg.supportOldIE || false;
        
        
        // Name of custom event that gets fired when media query update/change occurs
        cfg.DEFAULT_EVENT = DEFAULT_EVENT = cfg.DEFAULT_EVENT || 'jsmq:update';
        
        
        // Default native DOM element to bind the default update() event to
        cfg.DEFAULT_EVENT_ELEM = DEFAULT_EVENT_ELEM = cfg.DEFAULT_EVT_ELEM || cfg.elemNames['viewport'];
        
        
        // Whether to delay calling init() at load or not. Mostly useful for unit testing.
        cfg.delayInit = cfg.delayInit || false;
        
        
        // Are we running unit tests or not?
        cfg.isTest = cfg.isTest || false;
        
        
        /**
         *  Don't set this your self. It is an auto generated mapping of sizes by name that gets
         *  set later based on the 'sizes' configuration property. It is available for convenience
         *  it reading state or doing checks later on, but is auto-populated (also for convenience)
         *  so that you don't have to manage both sets of data. Keeping reading :)
         *  
         *  @property   names
         *  @readonly
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
         *  Returns a new object that reverses the key/value pairs of another object.
         *  It is important to note that this allows us to cast the new value to
         *  a Number object so we can use the typeof operator in other methods
         *  to check whether we are doing a query by name or number value.
         *
         *  @method     _reverseKeyValue
         *  @param      {Object}    o           Object to have key/values reversed
         *  @param      {Boolean}   castNum     Whether to cast value to a Number
         *  @return     {Object}                A new object with key/values reversed
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
         *  @param      [String]    prop    Optional. Specfic configuration propery name to query.
         *  @return     {Object}            Local configuration object
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
         *  @param      [Boolean]       useDeviceWidth  Optional. RETURNS THE VALUE BASED ON THE DEVICE'S WIDTH
         *  @return     {Number}
         *  @private
         */
        function _getWidth(useDeviceWidth) {
            
            if (window.getComputedStyle /* TODO: && window.matchMedia??*/) {
                _getWidth = function (useDeviceWidth) {
                    var cs = window.getComputedStyle,
                        elemName = useDeviceWidth ? 'device' : 'viewport';
                    return parseInt(cs(_getId(cfg.elemNames[elemName])).getPropertyValue('width'), 10);
                };
            }
            // Old IE
            else if (cfg.supportOldIE && window.currentStyle/* TODO: || (!window.matchMedia && window.getComputedStyle)*/) {
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
         *  @param      {String|Number} value           Either a string for CSS classname or number from cfg.sizes
         *  @param      [Boolean]       useDeviceWidth  Optional. RETURNS THE VALUE BASED ON THE DEVICE'S WIDTH
         *  @return     {Boolean}
         *  @public
         */
        function isAt(value, useDeviceWidth) {
            value = typeof value === 'number' ? value : cfg.names[value];
            return value ? parseInt(value, 10) === _getWidth(useDeviceWidth) : false;
        }
        
        
        /**
         *  Allows us to check whether we are BELOW a specific media query.
         *  Examples:
         *      jsmq.isBelow('large');
         *      jsmq.isBelow(61, true);
         *
         *  @method     isBelow
         *  @param      {String|Number} value           Either a string for CSS classname or number from cfg.sizes
         *  @param      [Boolean]       useDeviceWidth  Optional. RETURNS THE VALUE BASED ON THE DEVICE'S WIDTH
         *  @return     {Boolean}
         *  @public
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
         *  @param      [String]        nodeType    Optional. Type of HTML element to add to page (e.g., 'div')
         *  @return     {Object}        el          The native DOM element that was created
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
         *  Fires custom event. Default is to fire 'jsmq:update' on the default media element
         *
         *  @method     fire
         *  @param      [String]    name    Optional. Name of custom event to fire
         *  @param      [Object]    elem    Optional. Native HTML DOM element to fire on
         *  @public
         */
        function fire(name, elem) {
            var ev;
            
            name = name || DEFAULT_EVENT;
            elem = elem || _getId(DEFAULT_EVENT_ELEM);
            
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
         *  @return     {String}                    The CSS class name (i.e., a word) value for the breakpoint we are currently at
         *  @public
         */
        function get(useDeviceWidth) {
            return cfg.sizes[_getWidth(useDeviceWidth)];
        }
        
        
        /**
         *  Adds the CSS class name (from cfg.sizes) to the html tag
         *
         *  @method     _setCssClass
         *  @private
         */
        function _setCssClass() {
            var currClass = get();
            
            if (prevClass !== currClass) {
                docEl.className = (" " + docEl.className + " ").replace(prevClass, " " + currClass);
                prevClass = currClass;
                return true;    
            }
        }
        
        
        /**
         *  Chainable. Does a fresh check of the current state and updates the CSS class name accordingly
         *
         *  @method     update
         *  @param      [String]    name        Optional. Name of custom event to fire after update
         *  @param      [Object]    elem        Optional. Native HTML DOM element to fire on
         *  @param      [Function]  callback    Optional. Callback after updating. Can be passed as a single argument.
         *  @return     {Object}    this        The jsmq object
         *  @chainable
         *  @public
         */
        function update(name, elem, callback) {
            var args = [].slice.call(arguments),
                callbackFn = args.pop(),
                changed;
            
            changed = _setCssClass();
            
            if (changed) {
                fire(name, elem);
            }
            
            // TODO: Is it more intuitive to ALWAYS call this or only if changed?
            if (typeof callbackFn === 'function') {
                callbackFn.apply();
            }
            
            return this;
        }
        
        
        /**
         *  Set a configuration property/value
         *
         *  @method     set
         *  @param      {String}    prop    String representation of configuration property name
         *  @param      {ANY}       value   Any valid JavaScript data type you want to store
         *  @return     {Object}    this    The jsmq object
         *  @chainable
         *  @public
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
                return this;
            }
        }
        
        
        /**
         *  Reloads the configuration by removing our media query nodes and CSS.
         *  Really only useful for unit testing, I think.
         *
         *  @method     reload
         *  @return     {Object}    this    The jsmq object
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
            
            return this;
        }
        
        
        /**
         *  Runs things. This runs automagically at load by default. See jsmq_config and/or
         *  reload() if you want to call this manually later.
         *
         *  @method     init
         *  @return     {Object}    this    The jsmq object
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
            return this;
        }
        
        
        
        /**
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
            getConfig       : getConfig,
            isAt            : isAt,
            isBelow         : isBelow,
            reload          : reload
        };
        
    })();
    
    
    // Export
    window.jsmq = _jsmq;
    
    
    if (!jsmq.getConfig('delayInit')) {
        window.jsmq.init();   
    }
    
    
})(this, this.document);
