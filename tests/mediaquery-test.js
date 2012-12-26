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
    
    it("jsmq.update", function () {
        expect(jsmq.update).toBeDefined();
    });

    it("jsmq.fire", function () {
        expect(jsmq.fire).toBeDefined();
    });
    
    it("jsmq.get", function () {
        expect(jsmq.get).toBeDefined();
    });
    
    it("jsmq.set", function () {
        expect(jsmq.set).toBeDefined();
    });
    
    it("jsmq.init", function () {
        expect(jsmq.init).toBeDefined();
    });
    
    it("jsmq.isAt", function () {
        expect(jsmq.isAt).toBeDefined();
    });
    
    it("jsmq.isBelow", function () {
        expect(jsmq.isBelow).toBeDefined();
    });
    
    it("jsmq.reload", function () {
        expect(jsmq.reload).toBeDefined();
    });
    
    it("jsmq.getSizes", function () {
        expect(jsmq.getSizes).toBeDefined();
    });
    
    it("jsmq.nextLarger", function () {
        expect(jsmq.nextLarger).toBeDefined();
    });
    
    it("jsmq.allLarger", function () {
        expect(jsmq.allLarger).toBeDefined();
    });
    
});


describe("get()", function () {
    
    it("returns configuration object", function () {
        expect(typeof jsmq.get()).toEqual('object');
    });
    
    it("returns specific properties from configuration object", function () {
        // Return a property not an object because by default it returns
        // an object if no properties match.
        var result = jsmq.get('useMyOwnStyles');
        expect(typeof result).toEqual('boolean');
    });
    
});


describe("init()", function () {
    var docEl = document.documentElement,
        PREFIX = jsmq.get('PREFIX');
    
    it("has not added a class name to <html>", function () {
        expect('').toEqual(docEl.className);
    });
    
    it("has run and added classname", function () {
        // Now run init
        jsmq.init();
        expect(docEl.className).not.toBeFalsy();
    });
    
    it("has added media element", function () {
        var el = document.getElementById(PREFIX + 'media-width');
        expect(el).not.toBeNull();
    });
    
    it("has added device element", function () {
        var el = document.getElementById(PREFIX + 'media-device-width');
        expect(el).not.toBeNull();
    });
    
    it("has added inline style element", function () {
        var el = document.getElementById(PREFIX + 'styles');
        expect(el).not.toBeNull();
    });
    
    // TODO: test for not using inline styles
    
});


describe("update()", function () {
    var name = jsmq.DEFAULT_EVENT,
        el = document;
        
    it("returns jsmq object", function () {
        var result = jsmq.update(); 
        expect(result.VERSION).toBeDefined();
    });
    
    it("is chainable with isAt()", function () {
        var names = classNames.split(" ");
        expect(names).toContain(jsmq.update().isAt());
    });
    
    it("calls callback after update()", function () {
        var result = 'not called',
            expected = 'called',
            callback = function () { result = expected; };
            
        jsmq.update(name, el, callback);
        expect(result).toEqual(expected);
    });
    
    it("accepts callback as a single argument to update()", function () {
        var result = 'not called',
            expected = 'called',
            callback = function () { result = expected; };
            
        jsmq.update(callback);
        expect(result).toEqual(expected);
    });
    
});


describe("fire()", function () {
    var name = jsmq.get('DEFAULT_EVENT'),
        el = document,
        result,
        fn = function (e) {
            result = e.type;
        };
        
    afterEach(function () {
        off(name, el, fn);
        name = jsmq.get('DEFAULT_EVENT');
        el = document;
        result = undefined;
    });
    
    it("fires event", function () {
        on(name, el, fn);
        jsmq.fire();
        expect(result).toBeDefined();
    });
    
    it("fires default event", function () {
        on(name, el, fn);
        jsmq.fire();
        expect(result).toEqual(name);
    });
    
    it("fires default event on default element", function () {
        // Explicitly set them inside the test since they are the test case.
        var el = document.getElementById(jsmq.get('DEFAULT_EVENT_ELEM')),
            name = jsmq.get('DEFAULT_EVENT');
            
        on(name, el, function (e) {
            result = e.type;
        });
        jsmq.fire(name, el);
        expect(result).toEqual(name);
    });
    
    it("fires custom event", function () {
        var name = 'jsmq:custom';
        
        on(name, el, fn);
        jsmq.fire(name);
        expect(result).toEqual(name);
    });
    
    it("fires custom event on custom element after update()", function () {
        var name = 'jsmq:custom',
            el = document.getElementById('results');
            
        on(name, el, fn);
        jsmq.fire(name, el);
        expect(result).toEqual(name);
    });
    
    it("event object has className property", function () {
        on(name, el, function (e) {
            result = e.className;
        });
        jsmq.fire(name, el, jsmq.isAt());    
        expect(result).toBeDefined();
    });
    
    it("event object has size property", function () {
        on(name, el, function (e) {
            result = e.size;
        });
        jsmq.fire(name, el, jsmq.isAt());    
        expect(result).toBeDefined();
    });
    
    it("event object has correct value for className property", function () {
        on(name, el, function (e) {
            result = e.className;
        });
        jsmq.fire(name, el, jsmq.isAt());    
        expect(result).toEqual(jsmq.isAt());
    });
    
    it("event object has correct value for size property", function () {
        on(name, el, function (e) {
            result = e.size;
        });
        jsmq.fire(name, el, jsmq.isAt());    
        expect(result).toEqual(jsmq.get('names')[jsmq.isAt()]);
    });
});


describe("isAt()", function () {
    
    it("returns a value", function () {
        // TODO: It would be nice if we could set the browser size and test the results
        expect(jsmq.isAt()).toBeTruthy();
    });
    
    it("querying device width returns a value", function () {
        // TODO: It would be nice if we could set the browser size and test the results
        expect(jsmq.isAt(true)).toBeTruthy();
    });
    
    it("returns a string value when no arguments are passed", function () {
        expect(typeof jsmq.isAt()).toEqual('string');
    });
    
    it("returns a boolean value when at least one argument is passed", function () {
        // Using object since that is not currently one of the specific logic paths
        // and so won't be processed by the logic
        expect(typeof jsmq.isAt({})).toEqual('boolean');
    });
    
    it("returns a string value when single boolean argument is passed", function () {
        expect(typeof jsmq.isAt(true)).toEqual('string');
    });
    
    it("returns a string value when double boolean argument is passed", function () {
        expect(typeof jsmq.isAt(true, true)).toEqual('string');
    });
    
    it("returns a boolean value when a number is passed", function () {
        expect(typeof jsmq.isAt(34)).toEqual('boolean');
    });
    
    it("returns a boolean when a string is passed", function () {
        expect(typeof jsmq.isAt('some string')).toEqual('boolean');
    });
    
    it("returns a valid string value for current classname", function () {
        var names = classNames.split(" ");
        expect(names).toContain(jsmq.isAt());
    });
    
    it("querying device width returns a valid value for current classname", function () {
        var names = classNames.split(" ");
        expect(names).toContain(jsmq.isAt(true));
    });
    
    it("using number value matches current state value", function () {
        var atNum = jsmq.get('names')[jsmq.isAt()];         // 61, etc
        expect(jsmq.isAt(atNum)).toEqual(true);
    });
   
    it("using size value matches current state value", function () {
        var atNum = jsmq.get('names')[jsmq.isAt()],         // TODO: Allow query by num - currently returns true    
            atSize = jsmq.get('sizes')[atNum];              // jsmq-large, etc.
        expect(jsmq.isAt(atSize)).toEqual(true);
    });
    
    it("using wrong number value does not match current state value", function () {
        var atNum = jsmq.get('names')[jsmq.isAt()];         // 61, etc    
        expect(jsmq.isAt(atNum + 1)).toEqual(false);
    });
    
    it("using invalid size value does not match current state value", function () {
        expect(jsmq.isAt('kjndscjndcjndcj - no match')).toEqual(false);
    });
    
    // If we use a device width to test against, it has to always be true since both
    // should be equal.
    it("matching device width always returns true", function () {
        var atNum = jsmq.get('names')[jsmq.isAt(  true  )];
        expect(jsmq.isAt(atNum, true)).toEqual(true);
    });
    
    it("changing device width value always returns false", function () {
        var atNum = jsmq.get('names')[jsmq.isAt(  true  )];
        expect(jsmq.isAt(atNum + 1, true)).toEqual(false);
    });
    
    it("matching device width string name value always returns true", function () {
        var atNum = jsmq.get('names')[jsmq.isAt(  true  )],
            atSize = jsmq.get('sizes')[atNum];
        expect(jsmq.isAt(atSize, true)).toEqual(true);
    });
    
    it("changing device width string name value always returns false", function () {
        var atNum = jsmq.get('names')[jsmq.isAt(  true  )];
            atSize = jsmq.get('sizes')[atNum];
        expect(jsmq.isAt(atSize + 'xxxxx', true)).toEqual(false);
    });
    
    
    // passing in a class name to get back a number instead of string isAt('name')
    // Test for passing in no prefix on classname
});


describe("isBelow()", function () {
    
    it("returns a boolean value", function () {
        expect(typeof jsmq.isBelow()).toEqual('boolean');
    });
    
    it("is never below device width", function () {
        expect(jsmq.isBelow(jsmq.isAt(true), true)).toEqual(false);
    });
    
    it("device width is never below lowest breakpoint width", function () {
        var lowest = getLowestObjKey(jsmq.get('sizes'));
        expect(jsmq.isBelow(lowest, true)).toEqual(false);
    });
    
});


// Note a lot of these tests rely on get()
describe("set()", function () {
    
    it("does not return value if no params are sent", function () {
        expect(jsmq.set()).not.toBeDefined();
    });
    
    it("does not return value if first param is not a string", function () {
        expect(jsmq.set({}, {})).not.toBeDefined();
    });
    
    it("does not return value if second param is not passed", function () {
        expect(jsmq.set('test')).not.toBeDefined();
    });
    
    it("is able to remove a test prop", function () {
        var test = 'test',
            result1,
            result2;
        jsmq.set(test, test);
        // Set it, then remove it
        result1 = jsmq.get()[test];
        jsmq.set('removeTest', test);
        result2 = jsmq.get()[test];
        // Not checking for undefined b/c we want to know that 1st set worked
        expect(result2).not.toEqual(result1);
    });
    
    it("removeTest removes itself", function () {
        var test = 'test';
        jsmq.set(test, test).set('removeTest', test);
        expect(jsmq.get()['removeTest']).not.toBeDefined();
    });
    
    // Can't use instanceof jsmq because we are overwriting constructor with module pattern
    it("returns jsmq object if params are correct", function () {
        var test = 'test';
        expect(typeof jsmq.set(test, test)['init']).toEqual('function');
        jsmq.set('removeTest', test);
    });
    
    it("is chainable when params passed as expected", function () {
        var test1 = 'test1',
            test2 = 'test2';
        expect(typeof jsmq.set(test1, test1).set(test2, test2)['init']).toEqual('function');
        jsmq.set('removeTest', test1).set('removeTest', test2);
    });
    
    it("sets configuration properties", function () {
        var prop = 'some fake prop',
            expected = 'new test value',    
            result;
        jsmq.set(prop, expected);
        result = jsmq.get()[prop];
        expect(result).toEqual(expected);
        jsmq.set('removeTest', prop);
    });
    
    it("can set falsy properties", function () {
        var prop = 'some fake prop',
            result;
        jsmq.set(prop, false);
        result = jsmq.get()[prop];
        expect(result).toBeFalsy();
        jsmq.set('removeTest', prop);
    });
    
    it("sets configuration properties with chaining", function () {
        var prop1 = 'fake prop1',
            prop2 = 'fake prop2',
            expected = 'fake prop1fake prop2',
            result;
        jsmq.set(prop1, prop1).set(prop2, prop2);
        result = jsmq.get(prop1);
        result += jsmq.get(prop2);
        expect(result).toEqual(expected);
        jsmq.set('removeTest', prop1).set('removeTest', prop2);
    });
    
    // Watch it! These two are confusing because the props get reversed
    it("updates cfg.names when setting cfg.sizes", function () {
        var copy = jsmq.get('sizes'),
            newName = 'this is new',
            newSizes = { "14" : newName };
        jsmq.set('sizes', newSizes);
        // Props get reversed
        expect(jsmq.get('names')[newName]).toEqual(14);
        // Put it back - presumes set() works, but if we got this far, it does!
        jsmq.set('sizes', copy);
    });
    
    it("updates cfg.sizes when setting cfg.names", function () {
        var copy = jsmq.get('names'),
            newSize = 52,
            newNames = { "really large size" : newSize };
        jsmq.set('names', newNames);
        // Props get reversed
        expect(jsmq.get('sizes')[newSize]).toEqual("really large size");
        jsmq.set('names', copy);
    });
    
});


describe("reload()", function () {
    
    // TODO: update
   // it("returns string", function () {
     //   expect(typeof jsmq.reload()).toEqual('string');
    //});
    
    
});


describe("getSizes()", function () {
    
    it("returns an array", function () {
        expect(jsmq.getSizes()[0]).toBeDefined();
    });
    
    it("is sorted high to low", function () {
        var sorted = jsmq.getSizes(),
            high = sorted[0],
            low = sorted[sorted.length - 1];
        expect(high).toBeGreaterThan(low);
    });
    
});

describe("nextLarger()", function () {
    var sorted = jsmq.getSizes(),
        sizes = jsmq.get('sizes');
    
    it("is not defined if no valid size passed", function () {
        expect(jsmq.nextLarger('something is not quite right')).not.toBeDefined();
    });
    
    it("returns a string", function () {
        expect(typeof jsmq.nextLarger(sizes[sorted[1]])).toEqual('string');
    });
    
    it("returns a larger classname", function () {
        expect(jsmq.nextLarger(sizes[sorted[1]])).toEqual('jsmq-large');
    });
    
});


describe("allLarger()", function () {
    var sorted = jsmq.getSizes(),
        sizes = jsmq.get('sizes'),
        len = sorted.length;
    
    it("returns a string", function () {
        expect(typeof jsmq.allLarger(sizes[sorted[1]])).toEqual('string');
    });
    
    // a.k.a. - does not infinitely loop if passed an invalid value!!
    it("returns empty string if no valid size passed", function () {
        expect(jsmq.allLarger('something is not quite right')).toEqual('');
    });
    
    it("returns a string with larger classnames", function () {
        expect(jsmq.allLarger(sizes[sorted[len - 1]])).toMatch(/below-jsmq-large/);
    });
    
});


//reload
// returns string (for now)
// still has same property after reload
// setting a property and reload maintains config values
// has new elems on page
// spy on reload() being called
// spy on init() not being called - add to init()

// All kinds of tests for init/reload and setting configuration values!!

//jsmq.set('sizes', {'45': 'jsmq-medium', '56': 'jsmq-small'}).reload().init()


// fire()
// tests for passing classname and size

// Testing _getWidth for IEs and older browsers, etc
