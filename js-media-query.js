/*!
 *  js-media-query
 *  https://github.com/skaiser/js-media-query
 
 *  License: MIT License (MIT)
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
        
        var VERSION = '0.0.1',
            prevClass = '',
            cfg = {},
            cfgSizesByName = {};
            
        
        /**
         *  Responsive breakpoint sizes.
         *  Sizes default to em values.
         *  See: http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/
         */
        cfg.sizes = {
            '61': 'large',                      // 61em > 960px
            '60': 'medium',                     // 60em ~= 960px
            '45': 'small',                      // 45em ~= 720px
            '30': 'smaller'                     // 30em ~= 480px
        };
        
        
        // HTML id values of the elements that will be added to the page and queried
        cfg.elemNames = {
            'viewport': 'jsmqMediaWidth',       // Viewport/browsesr width
            'device': 'jsmqMediaDeviceWidth'    // Width of actual device
        };
        
        
        // Set to 'true' to skip auto-appending of CSS and add your stylesheet
        cfg.useCustomStyles = false;
        
        
        
        
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
         *  Returns a new object that reverses the key/value pairs of another object
         *
         *  @method     _reverseKeyValue
         *  @param      {Object}    o   Object to have key/values reversed
         *  @returns    {Object}        A new object with key/values reversed
         *  @private
         */
        function _reverseKeyValue(o) {
            var newObj = {},
                k;
            for (k in o) {
            
                if (o.hasOwnProperty(k)) {
                    newObj[o[k]] = k;        
                }
            }
            return newObj;
        }
        
        
        /**
         *  This is used to switch key/values of cfg.sizes to make it so that we
         *  can do queries for the size using the CSS class name instead of the
         *  numeric value.
         */
        cfgSizesByName = _reverseKeyValue(cfg.sizes);
        
        
        /**
         *  Returns the computed style of the special elements that were added to
         *  the page. The value will be changed by CSS media queries and this
         *  method will return the current value, effectively emulating a CSS
         *  media query @media rule.
         *
         *  @method     _getMediaWidth
         *  @returns    {Boolean}
         *  @private
         */
        function _getMediaWidth() {
            var cs = window.getComputedStyle;
            return cs   ? parseInt(cs(_getId(cfg.elemNames['viewport'])).getPropertyValue('width'), 10)
                        : false;
        }
        
        
        /**
         *  Returns the computed style of the special elements that were added to
         *  the page. The value will be changed by CSS media queries and this
         *  method will return the current value, effectively emulating a CSS
         *  media query @media rule.
         *
         *  NOTE: THIS METHOD RETURNS THE VALUE BASED ON THE DEVICE'S WIDTH.
         *
         *  @method     _getMediaDeviceWidth
         *  @returns    {Boolean}
         *  @private
         */
        function _getMediaDeviceWidth() {
            var cs = window.getComputedStyle;
            return cs   ? parseInt(cs(_getId(cfg.elemNames['device'])).getPropertyValue('width'), 10)
                        : false;
        }

        
        
        /**
         *  Allows us to check whether we are at a specific media query.
         *  Examples:
         *      jsmq.isAt('small');
         *      jsmq.isAt(45, true);
         *
         *  @method     _isMatchMediaWidth
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @param      [Boolean]           useInt  Optional. Whether to use the CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @protected  (See API for public name)
         */
        function _isMatchMediaWidth(value, useInt) {
            // Allow to use either the numeric value or the CSS class name value
            return value ? parseInt((useInt ? value : cfgSizesByName[value]), 10) === _getMediaWidth() : false;
        }
        
        
        /**
         *  Allows us to check whether we are at a specific media query BASED ON DEVICE WIDTH.
         *  Examples:
         *      jsmq.isAtDevice('small');
         *      jsmq.isAtDevice(45, true);
         *
         *  @method     _isMatchMediaDeviceWidth
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @param      [Boolean]           useInt  Optional. Whether to use the CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @protected  (See API for public name)
         */
        function _isMatchMediaDeviceWidth(value, useInt) {
            return value ? parseInt((useInt ? value : cfgSizesByName[value]), 10) === _getMediaDeviceWidth() : false;
        }
        
        
        /**
         *  Allows us to check whether we are BELOW a specific media query.
         *  Examples:
         *      jsmq.isBelow('large');
         *      jsmq.isBelow(61, true);
         *
         *  @method     _isBelowMediaWidth
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @param      [Boolean]           useInt  Optional. Whether to use the CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @protected  (See API for public name)
         */
        function _isBelowMediaWidth(value, useInt) {
            return value ? _getMediaWidth() < parseInt((useInt ? value : cfgSizesByName[value]), 10) : false;
        }
        
        
        /**
         *  Allows us to check whether we are BELOW a specific media query BASED ON DEVICE WIDTH.
         *  Examples:
         *      jsmq.isBelowDevice('large');
         *      jsmq.isBelowDevice(61, true);
         *
         *  @method     _isBelowMediaDeviceWidth
         *  @param      {String|Number}     value   Either a string for CSS classname or number from cfg.sizes
         *  @param      [Boolean]           useInt  Optional. Whether to use the CSS classname or number from cfg.sizes
         *  @returns    {Boolean}
         *  @static
         *  @protected  (See API for public name)
         */
        function _isBelowMediaDeviceWidth(value, useInt) {
            return value ? _getMediaDeviceWidth() < parseInt((useInt ? value : cfgSizesByName[value]), 10) : false;
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
         *  @param      [String]            unit    Optional. CSS unit value (e.g., 'em' or 'px')
         *  @returns    {String}                    String of CSS rules
         *  @private
         */
        function _writeMediaQuery(val, unit) {
            return  '@media only screen and (max-width: ' + val + (unit || 'em') + ') {' +
                        '#' + cfg.elemNames.viewport + ' {' +
                            'width: ' + val + 'px;' +
                        '}' +
                    '}\n' +
                    '@media only screen and (max-device-width: ' + val + (unit || 'em') + ') {' +
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
         *  Gets the current 'media query' state of the breakpoint we are at right now.
         *
         *  @method     get
         *  @param      {Boolean}   useDeviceWidth  Whether to check using device or viewport width. Default is viewport
         *  @returns    {String}                    The CSS class name (i.e., a word) value for the breakpoint we are currently at
         *  @public
         */
        function get(useDeviceWidth) {
            var fn = useDeviceWidth ? _getMediaDeviceWidth : _getMediaWidth;
            return cfg.sizes[fn()];
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
         *  Does a fresh check of the current state and updates the CSS class name accordingly
         *
         *  @method     update
         *  @public
         */
        function update() {
            _setCssClass();
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
        }
        
        
        
        /**
         *  Public methods.
         *
         *  Names on the left are the public method name that you would use.
         *  For example: jsmq.isAt() instead of jsmq._isMatchMediaWidth()
         */
        return {
            VERSION         : VERSION,
            update          : update,
            get             : get,
            init            : init,
            isAt            : _isMatchMediaWidth,
            isAtDevice      : _isMatchMediaDeviceWidth,
            isBelow         : _isBelowMediaWidth,
            isBelowDevice   : _isBelowMediaDeviceWidth
        };
        
    })();
    
    
    // Export
    window.jsmq = _jsmq;
    
    window.jsmq.init();
    
})(this, this.document);