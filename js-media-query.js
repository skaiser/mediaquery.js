/**!
 *  js-media-query
 *  https://github.com/skaiser/js-media-query
 
 *  License: MIT License (MIT)
 *  Copyright (c) 2012 Stephen Kaiser
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to
 *  deal in the Software without restriction, including without limitation the
 *  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 *  sell copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *  IN THE SOFTWARE.
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
        
        
        // Add hidden elements to page include styles for hiding elems naturally
        // Check their width
        // Add CSS class
        var VERSION = '0.0.1',
            prevClass = '',
            cfg = {};
        
        cfg.sizes = {
            '64': 'large',
            '63': 'medium',
            '45': 'small',
            '30': 'smaller'
        };
        
        cfg.elemNames = {
            'viewport': 'mediaWidth',       // Viewport/browsesr width
            'device': 'mediaDeviceWidth'    // Width of actual device
        };
        
        cfg.useDeviceWidth = false;
        
        
        // getElementById
        function _get(id) {
            return document.getElementById(id);
        }

        function _getMediaWidth() {
            var cs = window.getComputedStyle;
            return cs   ? parseInt(cs(_get(cfg.elemNames['viewport'])).getPropertyValue('width'), 10)
                        : false;
        }

        function _getMediaDeviceWidth() {
            var cs = window.getComputedStyle;
            return cs   ? parseInt(cs(_get(cfg.elemNames['device'])).getPropertyValue('width'), 10)
                        : false;
        }

        function _createElem(name) {
            var el = document.createElement('script'),
                id = cfg.elemNames[name];
            el.setAttribute('id', id);
            return el;
        }
        
        function _addHiddenElems() {
            head.appendChild(_createElem('viewport'));
            head.appendChild(_createElem('device'));
        }
        
        // Get current state
        function getState(useDeviceWidth) {
            var fn = useDeviceWidth ? _getMediaDeviceWidth : _getMediaWidth;
            return cfg.sizes[fn()];
        }
        
        function _setCssClass() {
            var currClass = getState();
            docEl.className = (" " + docEl.className + " ").replace(prevClass, " " + currClass);
            prevClass = currClass;
        }
        
        // Does a fresh check of current state
        function update() {
            _setCssClass();
        }
        
        function init(config) {
            //_configure(config);
            _addHiddenElems();
            update();
            
        }
        
        
        
        // Public methods
        return {
            VERSION: VERSION,
            update: update,
            getState: getState,
            init: init
        };
        
    })();
    
    
    
    // Export
    window.jsmq = _jsmq;
    
    window.jsmq.init();
    
})(this, this.document);