
## Introduction
---

[View demo](http://mediaqueryjs.com/)&nbsp;&nbsp;|&nbsp;&nbsp;[API docs](http://mediaqueryjs.com/#api)


### What is this?

This is a small (about 1.5KB) JS library independent solution for making sure your JS and CSS are in sync with regards to changing "media queries"
and to give developers (you) more control over whether or not you page is "responsive" only at page load or when the browser is resized.
It is an experiment in an alternate approach to implementing "responsive design." I think we should call it "JSS media queries." :)


### Supported Browsers

IE6+ and any other modern browser.


### Why should I use this?
The advantages of this approach are several:

1. We now have control (through JavaScript) of when
those CSS classes get changed instead of them automatically happening when the
user (most likely only the developer or designer) resizes the page. 
2. We can
more easily support older browsers without doing any real tricks other than
measuring the viewport or screen width. 
3. It also gives us a guarantee that JS and
CSS are in sync with what each of them think the user's screen/viewport size is.
This prevents weird behaviors that can happen when the CSS media query gets
triggered, but JS reports the `window.inner(outer)Width` to be completely different or [at least inconsistent across devices][1].
4. It
gives us the option to _not_ respond to user resizes unless we absolutely
want to, yet **we can still be responsive at page load (on the client-side,
without user-agent sniffing).** 
5. You can still add your own media queries for
things like background images (to prevent unnecessary downloads), of course. You
will probably still want to preface them with the "JSS media query" class name,
though, to make sure things don't get out of sync.
6. Works with `@import` rules (unconfirmed)


### Common use cases

* If you like the power of CSS media queries, but have ever had trouble ensuring your "responsive JS" is in sync with your "responsive CSS"
* If you've ever wanted to have your "responsive design" only be "responsive" to the user's browser/screen size at page load, but not necessarily _after_ page load (i.e., browser resize)
* If you need to support "responsive design" in older browsers (IE), but don't want to make separate CSS rules for them
* If you only want to have to declare your "responsive breakpoints" in one place
* If you want a more reliable way to query what size the CSS media query thinks the screen is at vesus the [unreliable way that some browsers report the size using JS][1] 


### How does it work?
Mediaquery.js adds a CSS class to the html element and adds three elements to the head
element of your page (configurable):

1. Adds an inline style tag with generated
media queries representing your defined breakpoints
2. Adds two script tags
that are simply non-rendered items that will have media query rules applied to
them (if the browser supports media queries)
3. The CSS class is configurable
and is based on your defined breakpoints


That's it. You can then **hook into the window.resize event to detect changes
consistently and accurately based on native media query behavior**, or if you
choose to support older browsers, viewport measurements (more reliable than
newer mobile browsers in this regard).

Then, **instead of putting all your CSS rules inside of media queries, you preface
them with the CSS class you defined in your breakpoints**. For example:

```css
.jsmq-large .some-style {color: green;}
.jsmq-medium .some-style {color: orange;}
```

**These are now your media query rules.**

If you want to provide your own elements and stylesheets to avoid incurring the reflow cost of appending the elements at page load, you can add
them to the page yourself beforehand and set: 
	
```javascript
window.jsmq_config = { 
    useMyOwnStyles: true, 
    useMyOwnElements: true
};
```

either in the head **_before_** you load mediaquery.js or
(recommended) just add it to the mediaquery.min.js file above the library code. See the [Configuration Options](#config-options) section for more details.



## Installation
---

Insert the following into the `<head>` on your page **_after_** the viewport meta tag:

```html
<script src="mediaquery.min.js"></script>
```

Ideally, since we are setting CSS classes to adjust the layout, this needs to run as early as possible. 


## Usage
---

Insert the following into the `<head>` on your page **_after_** the viewport meta tag:

```html
<script src="mediaquery.min.js"></script>
```

Prepend your CSS rules that are inside `@media` rules with standard CSS class selectors representing the names of your "breakpoints". For example:

**Instead of doing this in your CSS:**

```css
/* THE OLD WAY */
.hero-unit p {
    font-size: 18px;
}

@media only screen and (max-width: 60em) { 
    .hero-unit p {
        font-size: 17px;
    }
}

@media only screen and (max-width: 45em) {
    .hero-unit {
        padding: 45px 15px;
    }
}

@media only screen and (min-width: 30em) and (max-width: 45em) {
    .carousel-control {
        left: -5px;
        top: -20px;
    }
}
```
    
**Do this:**

```css
/* THE NEW WAY */
.hero-unit p {
    font-size: 18px;
}

/* Target all screen sizes BELOW this width (i.e., 'max-width: 60em') */
.below-jsmq-large .hero-unit p {
    font-size: 17px;
}

/* All sizes BELOW this width (i.e., 'max-width: 45em') */
.below-jsmq-medium .hero-unit {
    padding: 45px 15px;
}
        
/* Target ONLY screen sizes AT this width (i.e., 'min-width: 30em and max-width: 45em') */
.jsmq-small .carousel-control {
    left: -5px;
    top: -20px;
}
```

If you want to update the CSS class after page load (e.g., after a window resize event (recommended)), you
can use:
    
```javascript
jsmq.update();
```

By default, `jsmq.update` fires the `"jsmq:update"` event after a CSS class state has changed.

You can also do something like this on a window resize to check what CSS state we are in:

```javascript
jsmq.update().isAt();            // "jsmq-large", etc.
```
   
Or before doing an animation:

```javascript
if (jsmq.isBelow('jsmq-medium')) {
    // animate panel full width
} else {
    // animate panel 200px
}
```

## API
---
## Methods

<a name="method-init"></a>
#### jsmq.init()
_Makes things happen._ **This runs automagically at load by default.** _See [jsmq\_config](#jsmq_config)
and/or [reload()](#method-reload) if you want to call this manually later._     
**Returns**: The jsmq object.


<a name="method-update"></a>
#### jsmq.update( [callback] )
#### jsmq.update( [name="jsmq:update"] [, elem="#jsmq-media-width"] [, callback] )
_Refreshes the current CSS class. Useful after a window resize. It also [fires an event](#event-default) after
an update occurs. Accepts a callback function._     
**name**: A string containing the name of the custom event to fire     
**elem**: Native DOM element to fire the event on    
**callback**: Callback after updating. Can be passed as a single argument.      
**Returns**: The jsmq object.


<a name="method-isat"></a>
#### jsmq.isAt( [value] [, useDeviceWidth] )
_Does the current media query match our current width? Passing no arguments will return the CSS class
name (e.g., 'jsmq-large') for the current state the user is in. Passing a single boolean argument
will use the device-width to evaluate the return value._      
**value**: Either a string for CSS classname (from [get('names')](#method-get)) or number (from [get('sizes')](#method-get))     
**useDeviceWidth**: Boolean of whether to use media-device-width media query       
**Returns**: No arguments or single boolean argument returns CSS class name string. Others return boolean.     
Examples:

```javascript
jsmq.isAt();                    // 'jsmq-large', etc.
jsmq.isAt(true);                // 'jsmq-large' for device-width
jsmq.isAt('jsmq-small');        // true/false
jsmq.isAt('jsmq-small', true);  // true/false for device-wdith
jsmq.isAt(45, true);            // true/false for device width
```


<a name="method-isbelow"></a>
#### jsmq.isBelow( value [, useDeviceWidth] )
_Is the current media query BELOW our current width? I've found this very useful for doing some branching logic where I needed to animate to 100% if below a certain width, etc. Though the example below is quite contrived._     
**value**: Either a string for CSS classname (from [get('names')](#method-get)) or number (from [get('sizes')](#method-get))     
**useDeviceWidth**: Boolean of whether to use media-device-width media query      
**Returns**: Boolean of whether current width is below a given width.
Example:

```javascript
// Animate a panel 100% width if below a certain width or 200px, if larger.
var mySizes = jsmq.getSizes(); 		// [61, 60, 45, 30]
var MEDIUM_WIDTH = mySizes[1]; 		// '60'

if (jsmq.isBelow(MEDIUM_WIDTH))) { 
    $panel.animate({width: '100%'});
} else {
    $panel.animate({width: '200px'});
}

// OR

if ($('html').hasClass('below-jsmq-medium')) { 
    // do stuff
}
```


#### jsmq.getSizes()
_Returns an array of [cfg.sizes](#config-sizes) number values sorted high to low. This is very helpful in setting some constants within your own app code that you can use later with [isAt()](#method-isat) or [isBelow()](#method-isbelow) in `if` statements without needing to know the names of the sizes ahead of time. You just configure them once for mediaquery.js and that's it!_      
**Returns**: An array of [cfg.sizes](#config-sizes) number values sorted high to low.     
Example:     

```javascript
var mySizes = jsmq.getSizes(); 						// [61, 60, 45, 30]
var LARGE_WIDTH = jsmq.get('sizes')[mySizes[0]];	// 'jsmq-large'

if (jsmq.isAt() === LARGE_WIDTH)) { 
    // do stuff
}

// OR

if ($('html').hasClass(LARGE_WIDTH)) { 
    // do stuff
}
```


<a name="method-get"></a>
#### jsmq.get( [prop] )
_Returns the configuration object or optionally, a [specific property](#config-options)._     
**prop**: A string of the name of a specfic configuration propery name to query.      
**Returns**: Local configuration object or specific property.           
Examples: 

```javascript
jsmq.get('names');		// { 'jsmq-large' : 61, 'jsmq-medium': 60 }, etc.
jsmq.get('sizes');		// { '61': 'jsmq-large', '60': 'jsmq-medium' }, etc.
```


#### jsmq.set( prop, value )
_Set a [configuration property/value](#config-options). Note that you probably want to set up the [delayInit](#config-delayinit) configuration option to delay calling init() to make good use of this method. Otherwise, init() runs as soon as the script loads and your config options have already been passed in._      
**prop**: String representation of configuration property name.     
**value**: Any valid JavaScript data type you want to store.      
**Returns**: The jsmq object if both arguments are passed. Undefined if not.    
Example:

```javascript
jsmq.set('isTest', true);
```


#### jsmq.allLarger( at )
_Returns a string containing CSS classnames for all larger breakpoints with a
'lt-' modifier on the classname so that you can do something like the following
example in your CSS rules to target all sizes below a certain size._     
**at**: CSS classname of the size to find larger values for.      
**Returns**: String with CSS classes for _all_ larger breakpoints.     
Example:

```javascript
jsmq.allLarger('jsmq-smaller');		// "below-jsmq-small below-jsmq-medium below-jsmq-large"
```

In your CSS, you could do something like the following to reduce the font-size for `<h1>` elements for all breakpoints below the 'medium' breakpoint size:

```css
.below-jsmq-medium h1 { font-size: 0.8em; }
```


#### jsmq.nextLarger( at )
_Returns the CSS classname of the next largest breakpoint, if there is one._     
**at**: CSS classname of the size to find larger values for.      
**Returns**: CSS classname of the next largest breakpoint, if there is one.     
Example:

```javascript
// With the viewport at the 'medium' breakpiont size
jsmq.nextLarger(jsmq.isAt());		// "jsmq-large"
```


#### jsmq.fire( [name="jsmq:update"] [, elem="#jsmq-media-width"] )
_Fire custom event_    
**name**: A string containing the name of the custom event to fire      
**elem**: Native DOM element to fire the event on


<a name="method-reload"></a>
#### jsmq.reload()
_Reloads the configuration by removing our media query nodes and CSS. Really only useful for unit testing, I think._

    
#### jsmq.VERSION
**Returns**: Version info


<a name="config-options"></a>
## Configuration Options/Properties

<a name="jsmq_config"></a>
#### window.jsmq_config (Object)
_If you want to set configuration options without changing them in the code base, use this. Since mediqquery.js is designed to run early in the page load and and calls [init()](#method-init) on itself, you need to set this_ **before** _mediaquery.js runs. The recommended way is to just add it to the top of the min file, above the mediaquery.js code. Or you can load it in an extra script tag (like we do in the tests/SpecRunner.html file). See below for options._


#### PREFIX (String)
_Prefix to use on CSS classes and appended page elements._      
**Default**: "jsmq-"


#### BELOW_PREFIX (String)
_CSS classname prefix that will be used for sizes below a given size. For example: 'below-jsmq-medium' would be valid to use if you wanted to target styles for all cases below the 'medium' width._      
**Default**: "below-"     
Example:

```css
/* 
 * Target all devices BELOW the medium width (i.e., the 'small' width and lower)
 * Similar to @media (max-width: 720px) {…}
 * or @media (max-width: 45em) {…}
 */
.below-jsmq-medium .hero-unit p {
    font-size: 17px;
}
.below-jsmq-medium .carousel-control {
    left: -5px;
    top: -20px;
}

/* 
 * Target all devices AT the medium width only
 * Similar to @media (min-width: 721px) and (max-width: 960px) { ... }
 * or @media (min-width: 45em) and (max-width: 60em) { ... }
 */
.jsmq-medium .hero-unit {
    padding: 45px 15px;
}
```

	
#### DEFAULT_EVENT (String)
_The name of the default custom event name that gets fired on updates._           
**Default**: "jsmq:update"


#### DEFAULT_EVENT_ELEM (String)
_Default native DOM element to bind the default [update()](#method-update) event to._       
**Default**: elemNames['viewport'] (i.e., 'jsmq-mediq-width')


#### UNITS (String)
_Default unit sizes to use for breakpoints. If you don't think you should use 'em', please consider [this][6]:_      
**Default**: 'em'


<a name="config-sizes"></a>
#### sizes (Object)
_Responsive breakpoint sizes._ **Sizes default to 'em' values**. _See: [http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/][6]_      
**Default**:      

```javascript
{
    '61': PREFIX + 'large',                      // 61em > 960px
    '60': PREFIX + 'medium',                     // 60em ~= 960px
    '45': PREFIX + 'small',                      // 45em ~= 720px
    '30': PREFIX + 'smaller'                     // 30em ~= 480px
};
```


<a name="config-names"></a>
#### names (Object)
**Do not set this yourself with set(). They are defined in [sizes](#config-sizes) and this is automagically mapped to [sizes](#config-sizes)**.      
_CSS classnames that represent your breakpoint sizes. These are the names you will scope your CSS selectors with to emulate @media rules. Use PREFIX to change the 'jsmq-' value._    
**Default**: 'jsmq-large', 'jsmq-medium', 'jsmq-small', 'jsmq-smaller'


#### elemNames (Object)
_HTML id values of the elements that will be added to the page and queried._      
**Default**:     

```javascript
{
    'viewport'  : PREFIX + 'media-width',        // Viewport/browser width
    'device'    : PREFIX + 'media-device-width', // Width of actual device
    'css'       : PREFIX + 'styles'              // id for inline styles for unit tests    
};
```


<a name="config-mystyles"></a>
#### useMyOwnStyles (Boolean)
_Set to 'true' to skip auto-appending of CSS and add your stylesheet. Could minimize reflows._    
**Default**: false


<a name="config-myelements"></a>
#### useMyOwnElements (Boolean)
_Set to 'true' is you want to use elements that you've already added. Could minimize reflows._     
**Default**: false


#### supportOldBrowsers (Boolean)
_Support IE < 9 and other old browsers with no media queries. Added in v0.3.3._    
**Default**: true (mostly so demos show it working…I recommend setting this to false)


<a name="config-delayinit"></a>
#### delayInit (Boolean)
_Whether to delay calling [init()](#method-init) at load or not. Mostly useful for unit testing._      
**Default**: false


#### isTest (Boolean)
_For unit testing. Are we running tests or not?_      
**Default**: false



## Events

<a name="event-default"></a>
#### jsmq:update
_Fires after a CSS class change event occurs when [update()](#method-update) is called. The following additional properties are available on the Event Object to help with filtering logic after an event:_       
**Additional properties on the Event Object**:     
**event.className**: String of all current (jsmq) CSS classes being used (e.g., 'jsmq-medium below-jsmq-large')      
**event.size**: Size (number) of the CSS class      
**event.baseClass**: The base class value for the size we are at (i.e., what [isAt()](#method-isat) would return)      
Example:

```javascript
$('#jsmq-media-width').on('jsmq:update', function (e) {
    if (e.className.match(MyApp.LARGE_WIDTH)) {
        // Do stuff for large screens
    }
    
    // OR 
    
    if (e.size === 45) {
        // Do stuff 
    }
    
    // OR
    
    if (e.baseClass === MyApp.MEDIUM_WIDTH) {
        // Do stuff for medium screens
    }
    
    // OR
    
    if ($('html').hasClass(MyApp.LARGE_WIDTH)) {
        // Do stuff
    }
});
```



## Philosophy
---

There is something that has never felt quite right to me about using _only_ CSS media queries to do "responsive design" - **using CSS media queries, the CSS rules are immediately applied to adjust the layout when the browser is resized, but the JavaScript doesn't know about it**. This has always bothered me. One reason this bothers me is that I'm not really sure how many users (i.e., not developers or designers testing their "responsive" page) actually resize their browser after page load (You can't currently resize windows in mobile devices (arguably the main reason we need to be "responsive")), but if we allow it to adjust, it needs to work!!  And then if they do resize, do they _definitely_ want the layout to adjust? Your mind has to then reprocess the new layout and becomes kind of like a browser engine doing a "reflow" (what has moved? what is now completely gone?, etc.). 

Another reason is: what if you need to also apply different JS behaviors or add/remove markup? The JS needs to be in sync with the CSS media query and [not all browsers report width values the same][1]. We need "Responsive JavaScript" or "JSS Media Queries."

This alternate approach to implementing "responsive design" is based off the idea presented in this article by Jeremy Keith: [Conditional CSS][2]. Here Jeremy describes using the `:after` psuedo element on the `body` tag to create a link between JS and CSS and also to provide meaningful names to the values, instead of being tied to pixel width values. And example is something like this: `body:after {content: "large-screen";}`. I really like the idea of this approach! And I tried the [onMediaQuery jQuery plugin][3]. The main complication I found with it was that iOS 4 (specifically, iOS 4.2.1), my old iPhone, wasn't able to read this value. I was bummed. How many other browsers did this not work for? [According to the Josh Barr from Springload, it doesn't work well on Android either][5]. So, I tried various other properties trying to simulate the useful method of using human readable strings (and somewhat future friendly - what if device pixel size changes?) to represent the size of the screen. I didn't find any that worked with strings, but **I did find that using the "width" property, we could at least match the value of the CSS media query to check the current width.** And `width` works everywhere.

So, **in this approach, we only use CSS media queries to set width values on "special" elements that we will then query from JS for their width. To emulate the behavior of CSS media queries in CSS, we just use class names (i.e., `.jsmq-large .someElement`). This allows us to be "responsive" to the browser/device size at page load and then _predictablly_ decide when we want to change the layout for the user and ensure that JS is in sync with this CSS at this "moment"**. It provides a potentially slightly simpler way to implement "responsive" into IE (or unsupported browsers), by hooking up a window.resize event, checking the viewport width, and applying the desired CSS class. All the CSS rules can then remain unchanged (how would you apply the same CSS rules inside a CSS media query to IE otherwise?).

### Why not matchMedia.js or Modernizr.MQ?

I found that Modernizr.MQ's implementation (which is basically the same as [matchMedia.js][4]), was getting triggered because the window size changed when the soft keyboard popped up. This was causing a very strange issue in Android 2.x (Kindle Fire) in which the keyboard would hide after the user started typing (I had a 50ms delay on executing the widnow.resize callback).

I also found matchMedia.js to crash IE8, at least when using it in a particular CMS envrionment I was using. I wasn't really able to reproduce this anywhere else, but I couldn't use it there because of this.


## Resources
---
[First, Understand Your Screen][1] by James Pearce

[Conditional CSS][2] by Jeremy Keith

[onMediaQuery jQuery plugin][3]

[MatchMedia.js][4]

[onMediaQuery jQuery plugin Github][5]

[The EMs have it: Proportional Media Queries FTW!][6] Cloud Four Blog by Lyza Gardner

[1]: http://tripleodeon.com/2011/12/first-understand-your-screen/
[2]: http://adactio.com/journal/5429/
[3]: http://www.springload.co.nz/love-the-web/responsive-javascript
[4]: https://github.com/paulirish/matchMedia.js/
[5]: https://github.com/JoshBarr/js-media-queries
[6]: http://blog.cloudfour.com/the-ems-have-it-proportional-media-queries-ftw/



## Known Bugs
---
See [Issues](https://github.com/skaiser/mediaquery.js/issues)


## Attribution/Credits
---
Jeremy Keith, James Pearce, Paul Irish, Nicholas Zakas and Springload for their inspiring and pioneering ideas and work.

Thanks!!


Author
---
Stephen Kaiser




