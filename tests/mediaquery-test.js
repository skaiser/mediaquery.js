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

var getLowestObjKey = function (obj) {
    var sorted = [];
    for (k in obj) {
        if (obj.hasOwnProperty(k)) {
            sorted.push(k);
        }
    }
    sorted.sort().reverse();
    return sorted[sorted.length - 1];
}


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
    
    it("jsmq.isBelow", function () {
        expect(jsmq.isBelow).toBeDefined();
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
        var result = jsmq.getConfig('useMyOwnStyles');
        expect(typeof result).toEqual('boolean');
    });
    
});


describe("isAt()", function () {
    
    it("returns a boolean value", function () {
        expect(typeof jsmq.isAt()).toEqual('boolean');
    });
    
    it("using number value matches current state value", function () {
        var atNum = jsmq.getConfig('names')[jsmq.get()];    // 61, etc
        expect(jsmq.isAt(atNum)).toEqual(true);
    });
   
    it("using size value matches current state value", function () {
        var atNum = jsmq.getConfig('names')[jsmq.get()],    
            atSize = jsmq.getConfig('sizes')[atNum];        // jsmq-large, etc.
        expect(jsmq.isAt(atSize)).toEqual(true);
    });
    
    it("using wrong number value does not match current state value", function () {
        var atNum = jsmq.getConfig('names')[jsmq.get()];    // 61, etc    
        expect(jsmq.isAt(atNum + 1)).toEqual(false);
    });
    
    it("using invalid size value does not match current state value", function () {
        expect(jsmq.isAt('kjndscjndcjndcj - no match')).toEqual(false);
    });
    
    // If we use a device width to test against, it has to always be true since both
    // should be equal.
    it("matching device width always returns true", function () {
        var atNum = jsmq.getConfig('names')[jsmq.get(  true  )];
        expect(jsmq.isAt(atNum, true)).toEqual(true);
    });
    
    it("changing device width value always returns false", function () {
        var atNum = jsmq.getConfig('names')[jsmq.get(  true  )];
        expect(jsmq.isAt(atNum + 1, true)).toEqual(false);
    });
    
    it("matching device width string name value always returns true", function () {
        var atNum = jsmq.getConfig('names')[jsmq.get(  true  )],
            atSize = jsmq.getConfig('sizes')[atNum];
        expect(jsmq.isAt(atSize, true)).toEqual(true);
    });
    
    it("changing device width string name value always returns false", function () {
        var atNum = jsmq.getConfig('names')[jsmq.get(  true  )];
            atSize = jsmq.getConfig('sizes')[atNum];
        expect(jsmq.isAt(atSize + 'xxxxx', true)).toEqual(false);
    });
    
});


describe("isBelow()", function () {
    
    it("returns a boolean value", function () {
        expect(typeof jsmq.isBelow()).toEqual('boolean');
    });
    
    it("is never below device width", function () {
        expect(jsmq.isBelow(jsmq.get(true), true)).toEqual(false);
    });
    
    it("device width is never below lowest breakpoint width", function () {
        var lowest = getLowestObjKey(jsmq.getConfig('sizes'));
        expect(jsmq.isBelow(lowest, true)).toEqual(false);
    });
    
});