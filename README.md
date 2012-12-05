mediaquery.js
==============

## Introduction

### What is this?

This is a small (less than 1KB) JS library independent solution for making sure your JS and CSS are in sync with regards to changing "media queries" and to give developers (you) more control over whether or not you page is "responsive" only at page load or when the browser is resized. It is an experiment in an alternate approach to implementing "responsive design." 


### Why use this?

* If you like the power of CSS media queries, but have ever had trouble ensuring your "responsive JS" is in sync with your "responsive CSS"
* If you've ever wanted to have your "responsive design" only be "responsive" to the user's browser/screen size at page load, but not necessarily _after_ page load (i.e., browser resize)
* If you need to support "responsive design" in older browsers (IE), but don't want to make separate CSS rules for them
* If you only want to have to declare your "responsive breakpoints" in one place
* If you want a more reliable way to query what size the CSS media query thinks the screen is at vesus the [unreliable way that some browsers report the size using JS][1] 


## Installation

Insert the following into the `<head>` on your page:

    <script src="mediaquery.min.js"></script>
    
Ideally, since we are setting CSS classes to adjust the layout, this needs to run as early as possible. 


## Usage

Insert the following into the `<head>` on your page:

    <script src="mediaquery.min.js"></script>

Prepend your CSS rules that are inside `@media` rules with standard CSS class selectors representing the names of your "breakpoints". For example:

    Instead of doing this in your CSS:

    .someStyle {
        color: black;
    }

    @media only screen and (max-width: 63em) { 
        .someStyle {
            color: blue;
        }
    }

    @media only screen and (max-width: 45em) {
        .someStyle {
            color: red;
            width: 100%;
        }
    }

    
    Do this:


    .someStyle {
        color: black;
    }
    
    .jsmq-large .someStyle {
        color: blue;
    }
    
    .jsmq-medium .someStyle {
        color: red;
    }

If you want to update the CSS class after page load (e.g., after a window resize event), you
can use:
    
    jsmq.update();

You can also do something like this on a window resize to check what CSS state we are in:

    jsmq.update().get();            // "jsmq-large", etc.
    

## API

    jsmq.VERSION;                   // Returns version info
    jsmq.PREFIX;                    // Prefix to use on CSS classes and appended page elements
    jsmq.init();                    // Makes things happen
    jsmq.update();                  // Refreshes the current CSS class, useful after a resize
    jsmq.get();                     // Basically does a JS Media Query (like a CSS media query)
    jsmq.getConfig();               // Returns the local configuration object
    jsmq.isAt('large');             // Does the current media query match this VIEWPORT width?
    jsmq.isAtDevice('small');       // Does the current media query match this DEVICE width?
    jsmq.isBelow('medium');         // Is the current media query BELOW this VIEWPORT width?
    jsmq.isBelowDevice(45);         // Is the current media query BELOW this DEVICE width?


## Philosophy

There is something that has never felt quite right to me about using _only_ CSS media queries to do "responsive design" - **using CSS media queries, the CSS rules are immediately applied to adjust the layout when the browser is resized, but the JavaScript doesn't know about it**. This has always bothered me. One reason this bothers me is that I'm not really sure how many users (i.e., not developers or designers testing their "responsive" page) actually resize their browser after page load (You can't currently resize windows in mobile devices (arguably the main reason we need to be "responsive")), but if we allow it to adjust, it needs to work!! And then if they do resize, do they _definitely_ want the layout to adjust? Sometimes, I find it can just be annoying since your mind has to then reprocess the new layout (what has moved? what is now completely gone?, etc.). Your mind becomes kind of like a browser engine doing a "reflow", right? Another reason is: what if you need to also apply different JS behaviors or add/remove markup? The JS needs to be in sync with the CSS media query and [not all browsers report width values the same][1]. We need "Responsive JavaScript."

This alternate approach to implementing "responsive design" is based off the idea presented in this article by Jeremy Keith: [Conditional CSS][2]. Here Jeremy describes using the `:after` psuedo element on the `body` tag to create a link between JS and CSS and also to provide meaningful names to the values, instead of being tied to pixel width values. And example is something like this: `body:after {content: "large-screen";}`. I really like the idea of this approach! And I tried the [onMediaQuery jQuery plugin][3]. The main complication I found with it was that iOS 4 (specifically, iOS 4.2.1), my old iPhone, wasn't able to read this value. I was bummed. How many other browsers did this not work for? [According to the Josh Barr from Springload, it doesn't work well on Android either][5]. So, I tried various other properties trying to simulate the useful method of using human readable strings (and somewhat future friendly - what if device pixel size changes?) to represent the size of the screen. I didn't find any that worked with strings, but **I did find that using the "width" property, we could at least match the value of the CSS media query to check the current width.** And `width` works everywhere.

So, **in this approach, we only use CSS media queries to set width values on "special" elements that we will then query from JS for their width. To emulate the behavior of CSS media queries in CSS, we just use class names (i.e., `.largeScreen .someElement`). This allows us to be "responsive" to the browser/device size at page load and then _predictablly_ decide when we want to change the layout for the user and ensure that JS is in sync with this CSS at this "moment"**. It could potentially provide a slightly simpler way to implement "responsive" into IE (or unsupported browsers), by hooking up a window.resize event only for those browsers, checking the viewport width, and applying the desired CSS class. All the CSS rules can then remain unchanged (how would you apply the same CSS rules inside a CSS media query to IE otherwise?).

### Why not matchMedia.js or Modernizr.MQ?

I found that Modernizr.MQ's implementation (which is basically the same as [matchMedia.js][4]), was getting triggered because the window size changed when the soft keyboard popped up. This was causing a very strange issue in Android 2.x (Kindle Fire) in which the keyboard would hide after the user started typing (I had a 50ms delay on executing the widnow.resize callback).

I also found matchMedia.js to crash IE8, at least when using it in a particular CMS envrionment I was using. I wasn't really able to reproduce this anywhere else, but I couldn't use it there because of this.


## Resources

[First, Understand Your Screen][1] by James Pearce

[Conditional CSS][2] by Jeremy Keith

[onMediaQuery jQuery plugin][3]

[MatchMedia.js][4]

[onMediaQuery jQuery plugin Github][5]

[1]: http://tripleodeon.com/2011/12/first-understand-your-screen/
[2]: http://adactio.com/journal/5429/
[3]: http://www.springload.co.nz/love-the-web/responsive-javascript
[4]: https://github.com/paulirish/matchMedia.js/
[5]: https://github.com/JoshBarr/js-media-queries



## Known Bugs


## Attribution/Credits
Jeremy Keith, James Pearce, Paul Irish, Nicholas Zakas and Springload for their inspiring and pioneering ideas and work.


Thanks!!

