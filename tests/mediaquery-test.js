// String of classnames for doing regex against
var classNames = 'jsmq-large jsmq-medium jsmq-small jsmq-smaller';

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
    
    it("returns a valid value", function () {
        var names = classNames.split(" ");
        expect(names).toContain(jsmq.get());
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
