// String of classnames for doing regex against
var classNames = 'jsmq-large jsmq-medium jsmq-small jsmq-smaller';

var on = function (ev, el, fn) {
    if (el.addEventListener) {
        el.addEventListener(ev, fn, false);
    } else if (el.attachEvent) {
        var r = el.attachEvent("on"+ ev, fn);
        return r;   
    }
};

var off = function (ev, el, fn) {
    if (el.removeEventListener) {
        el.removeEventListener(ev, fn, false);
    } else if (el.detachEvent) {
        var r = el.detachEvent("on"+ ev, fn);
        return r;   
    }  
};


describe("Public methods are defined", function () {
    
    it("jsmq", function () {
        expect(jsmq).toBeDefined();
    });
    
    it("window.jsmq", function () {
        expect(window.jsmq).toBeDefined();
    });
    
    it("jsmq.VERSION", function () {
        expect(jsmq.VERSION).toBeDefined();
    });

    it("jsmq.init", function () {
        expect(jsmq.init).toBeDefined();
    });
    
    it("jsmq.update", function () {
        expect(jsmq.update).toBeDefined();
    });
    
    it("jsmq.fire", function () {
        expect(jsmq.fire).toBeDefined();
    });
    
    it("jsmq.get", function () {
        expect(jsmq.get).toBeDefined();
    });
     
    it("jsmq.getConfig", function () {
        expect(jsmq.getConfig).toBeDefined();
    });
    
    it("jsmq.isAt", function () {
        expect(jsmq.isAt).toBeDefined();
    });
    
    it("jsmq.isAtDevice", function () {
        expect(jsmq.isAtDevice).toBeDefined();
    });
    
    it("jsmq.isBelow", function () {
        expect(jsmq.isBelow).toBeDefined();
    });
    
    it("jsmq.isBelowDevice", function () {
        expect(jsmq.isBelowDevice).toBeDefined();
    });
    
});


describe("init()", function () {
    var docEl = document.documentElement;
    
    it("has not added a class name to <html>", function () {
        expect('').toEqual(docEl.className);
    });
    
    it("has run and added classname", function () {
        // Now run init
        jsmq.init();
        expect(docEl.className).not.toBeFalsy();
    });
    
    it("has added media element", function () {
        var el = document.getElementById(jsmq.PREFIX + 'media-width');
        expect(el).not.toBeNull();
    });
    
    it("has added device element", function () {
        var el = document.getElementById(jsmq.PREFIX + 'media-device-width');
        expect(el).not.toBeNull();
    });
    
    it("has added inline style element", function () {
        var el = document.getElementById(jsmq.PREFIX + 'styles');
        expect(el).not.toBeNull();
    });
    
    // TODO: test for not using inline styles
    
});


describe("get()", function () {
    
    it("returns a value", function () {
        // TODO: It would be nice if we could set the browser size and test the results
        expect(jsmq.get()).toBeTruthy();
    });
    
    it("querying device width returns a value", function () {
        // TODO: It would be nice if we could set the browser size and test the results
        expect(jsmq.get(true)).toBeTruthy();
    });
    
    it("returns a valid value", function () {
        var names = classNames.split(" ");
        expect(names).toContain(jsmq.get());
    });
    
    it("querying device width returns a valid value", function () {
        var names = classNames.split(" ");
        expect(names).toContain(jsmq.get(true));
    });
    
});



describe("update()", function () {
    
    it("returns jsmq object", function () {
        var result = jsmq.update(); 
        expect(result.VERSION).toBeDefined();
    });
    
    it("is chainable with get", function () {
        var names = classNames.split(" ");
        expect(names).toContain(jsmq.update().get());
    });
    
});


describe("fire()", function () {
    var name = jsmq.DEFAULT_EVENT,
        el = document,
        result,
        fn = function (e) {
            result = e.type;
        };
        
    afterEach(function () {
        off(name, el, fn);
        name = jsmq.DEFAULT_EVENT;
        el = document;
        result = undefined;
    });
    
    it("is fired after update()", function () {
        runs(function () {
            on(name, el, fn);
            jsmq.update();
        });
        
        runs(function () {
            expect(result).toBeDefined();
        });
    });
    
    it("fires default event after update()", function () {
        runs(function () {
            on(name, el, fn);
            jsmq.update();
        });
        runs(function () {
            expect(result).toEqual(name);
        });
    });
    
    it("fires event on default element after update()", function () {
        var el = document.getElementById('jsmq-media-width');
            
        runs(function () {
            on(name, el, function (e) {  result = e.type;  });
            jsmq.update();
        });
        runs(function () {
            expect(result).toEqual(name);
        });
    });
    
    it("fires custom event after update()", function () {
        var name = 'jsmq:custom';
            
        runs(function () {
            on(name, el, fn);
            jsmq.update(name);
        });
        runs(function () {
            expect(result).toEqual(name);
        });
    });
    
    it("fires custom event on custom element after update()", function () {
        var name = 'jsmq:custom',
            el = document.getElementById('results');
            
        runs(function () {
            on(name, el, fn);
            jsmq.update(name, el);
        });
        runs(function () {
            expect(result).toEqual(name);
        });
    });
    
    it("calls callback after update()", function () {
        var result = 'not called',
            expected = 'called',
            callback = function () { result = expected; };
            
        runs(function () {
            on(name, el, fn);
            jsmq.update(name, el, callback);
        });
        runs(function () {
            expect(result).toEqual(expected);
        });
    });
    
    it("accepts callback as a single argument to update()", function () {
        var result = 'not called',
            expected = 'called',
            callback = function () { result = expected; };
            
        runs(function () {
            on(name, el, fn);
            jsmq.update(callback);
        });
        runs(function () {
            expect(result).toEqual(expected);
        });
    });
});


describe("getConfig()", function () {
    
    it("returns configuration object", function () {
        expect(typeof jsmq.getConfig()).toEqual('object');
    });
    
    it("returns specific properties from configuration object", function () {
        // Return a property not an object because by default it returns
        // an object if no properties match.
        var result = jsmq.getConfig('useCustomStyles');
        expect(typeof result).toEqual('boolean');
    });
    
});
