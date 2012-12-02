js-media-query
==============

This is an alternate way to do "responsive design" that uses JavaScript and CSS
together to determine what to do. The idea is that you set a CSS class with JS
early in the page rendering in order to apply what you would usually put inside
an @media media query. The reason to do this is so that you are in control of
when to be "responsive" and not have the browser automagically respond with
matching CSS rules, but then have the JS be "out of sync" with the CSS.

I've found that many times, we only need to be "responsive" about the
layout/design at page load and that only developers and designers are resizing
the browser to test their responsive designs. I've also found using Modernizr.MQ
and/or matchMedia.js to potentially cause window resize events to fire on
Androids, which caused undesirable things to happen.

This is an experiment to see if this gives more predictable control to the
developers. This should also give us a better way to implement responsive
design in IE (if you really are in to self torture).



For example, instead of doing this:

    @media only screen and (max-width: 63em) { 
        .someStyle {
            color: blue;
        }
    }

    @media only screen and (max-width: 45em) {
        .someStyle {
            color: red;
        }
    }
    
We could just do this:

    .large {
        color: blue;
    }
    .medium {
        color: red;
    }
    
If you really want to update the CSS class after a window resize event, you
can use:
    
    jsmq.update();
    
API:

    jsmq.VERSION;       // Returns version info
    jsmq.init();        // Makes things happen
    jsmq.update();      // Refreshes the current CSS class, useful after a resize
    jsmq.getState();    // Basically does a JS Media Query (like a CSS media query)    


Thanks!