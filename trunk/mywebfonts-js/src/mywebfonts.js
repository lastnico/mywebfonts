/*  
 * MyWebFonts JavaScript API, version 0.01
 * December 16th, 2008
 * (c) 2008-2009 Nicolas Ternisien <nicolas.ternisien@gmail.com>
 *
 * Prototype is freely distributable under the terms of an MIT-style license.
 * For details, see the MyWebFonts web site: http://mywebfonts.minipoulpe.org/
 *
 * -------------------------------------------------------------------------- */

var MyWebFonts = {
	version: '0.01',

	// Configuration
	options: {
		// Test for external request
		//externalSite: "http://mywebfonts.minipoulpe.org/concept"
		externalSite: 		"",
		debug:				true
	},
	
	foundElements: [],
	downloadedFonts: [],

	initialize: function() {
		fontElements = $$(".mywebfonts");
		for (var index = 0; index < fontElements.length; ++index) {
			MyWebFonts.addFoundElement(fontElements[index]);
		}

	},

	addFoundElement: function(fontElement) {
		var fontIdentifier = MyWebFonts.parseFontFamily(fontElement.style.fontFamily);
		var fontSize = fontElement.style.fontSize;
		
		MyWebFonts.foundElements.push({ 
			element:		fontElement,
			fontIdentifier:	fontIdentifier,
			fontSize:		fontSize
		});
		
		MyWebFonts.debug("[addFoundElement] New Element found : " + fontElement);
		
		MyWebFonts.loadFontDatas(fontIdentifier);
	},
	
	loadFontDatas: function(fontIdentifier) {
		// First search if already loaded, or currently loaded
		MyWebFonts.debug("[loadFontDatas] Font Identifier : " + fontIdentifier);

		var scriptUrl = MyWebFonts.createFontDatasUrl(fontIdentifier);
		var script = new Element('script', { "type": "text/javascript", "src": scriptUrl });
		$$("head").first().appendChild(script);

	},
	
	parseFontFamily: function(fontFamily) {

		MyWebFonts.debug("Font Family : " + fontFamily);

		fonts = fontFamily.split(",");
		if (fonts.length == 0) {
			fonts = new Array();
			fonts.push(fontFamily);
		}
		
		for (var index = 0; index < fonts.length; ++index) {
			fontFamily = fonts[index].strip();
			fontFamily = fontFamily.replace(/'|"/g, "");
			
			var namespaceIndex = fontFamily.indexOf("mwf:");
			if (namespaceIndex == -1)
				continue;

			fontFamily = fontFamily.substring(namespaceIndex + 4, fontFamily.length);
			fontFamily = fontFamily.strip();
			
			return fontFamily;
		}

		return null;
	},

	
	// Optional parameters are fontIdentifier, fontVariant, fontSize, fontColor
	createFontGenericUrl: function() {
		genericUrl = MyWebFonts.options.externalSite;
		if (arguments.length >= 1)
			genericUrl += "/font/" + arguments[0];
		
		if (arguments.length >= 2) 
			genericUrl += "/v:" + arguments[1];
		
		if (arguments.length >= 3)
			genericUrl += "/" + arguments[2] + "px";
		
		if (arguments.length >= 4)
			genericUrl += "/c:" + arguments[3];
		
		return genericUrl;
		
	},

	createFontDatasUrl: function() {
		return MyWebFonts.createFontGenericUrl($A(arguments)) + "/datas";
	},

	createFontContentUrl: function() {
		return MyWebFonts.createFontGenericUrl($A(arguments)) + "/content";
	},

	findTextNodes: function(element) {
	    var nodes = [];

	    (function(currentElement) {
	        //if (!currentElement) return;
	        if ((currentElement.nodeType == 3))
	        	nodes.push(currentElement);
	        else
	            for (var i=0; i < currentElement.childNodes.length; ++i)
	                arguments.callee(currentElement.childNodes[i]);
	    })(element);
	    
	    return nodes;
	},
	
	triggerSubstitutions: function(letterCoordinates) {

		var textNodes = MyWebFonts.findTextNodes($("letters"));
		for (var i=0; i < textNodes.length; ++i) {
			
			MyWebFonts.replaceText(textNodes[i], letterCoordinates);
		}
		

	},

	replaceText: function(element, letterCoordinates) {
		var elementContent = element.nodeValue;
		elementContent = elementContent.strip();
		if (elementContent == "")
			return;

		MyWebFonts.debug("Element : " + element.nodeValue + "[type=" + element.nodeType + "]");
	
		var parent = element.parentNode;
		
		MyWebFonts.debug("Parent : " + parent.nodeName + "[type=" + parent.nodeType + "]");
		
		var letterImages = MyWebFonts.createTextImage(element.nodeValue, letterCoordinates);
		
		// Simplest and working solution : Create a <span> element which will contains <img> tags that will replace element content
		// Problem : Add an additional span element, which is normally not needed
		var substitute = new Element("span");
		for (var index = 0; index < letterImages.length; ++index) {
			var currentElement = letterImages[index];
			substitute.insert(currentElement);
		}
		
		parent.replaceChild(substitute, element);
		
		/*
		// Harder and non-working solution : First <img> tag replace the element content, and next <img> tags are inserted just after
		// this first <img> tag. 
		// Problem : Strange behavior...
		var previous = null;
		for (var index = 0; index < letterImages.length; ++index) {
			var currentElement = letterImages[index];
			
			if (index == 0) {
				$("debug").insert(currentElement.alt  + " replaces " + element.nodeValue + "\n");
				parent.replaceChild(currentElement, element);
			}
			else {
				$("debug").insert(currentElement.alt + " inserts after " + previous.alt + "\n");
				parent.insert(currentElement, { after : previous });
				
			}
			
			previous = currentElement;
			
			
		}
		*/
	},


	createTextImage: function(word, letterCoordinates) {
		var letterImages = new Array();
		for (var index = 0; index < word.length; ++index) {
			var currentLetter = word[index];
			var letterCoordinate = letterCoordinates[currentLetter];
			if (letterCoordinate == null) {
				letterImages.push(new Element('span').update(currentLetter));
				continue;
			}
	

			var fontIdentifier = "rough-typewriter";
			var imageUrl = MyWebFonts.createFontContentUrl(fontIdentifier);
			var backgroundParameter = (-letterCoordinate.x) + "px " + (-letterCoordinate.y) + "px url(" + imageUrl + ")";
	
			var image = new Element('img', { src: MyWebFonts.options.externalSite + "/images/transparent.png", alt: currentLetter });
			image.setStyle({
				background: 			backgroundParameter,
				width:					letterCoordinate.width + "px",
				height:					letterCoordinate.height + "px",
				padding:				"0px"
				
			});
			//, border:					"1px solid red",
			
			letterImages.push(image);
		}

		return letterImages;
	},
	
	debug: function(message) {
		if (MyWebFonts.options.debug==false)
			return;
		
		var debugElement = $("debug");
		if (debugElement == null) {
			debugElement = new Element("pre", { id: "debug" } );
			debugElement.setStyle({
				fontFamily: 		"monospace",
				fontSize:			"11px",
				border:				"1px solid #ccc"
			});
			
			$$("body").last().appendChild(new Element("h2").update("My Web Fonts Debugging:"));
			$$("body").last().appendChild(debugElement);
		}
		
		var date = new Date();
		debugElement.insert( 	(date.getHours()<10?'0'+date.getHours():date.getHours()) + ":" + 
								(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes()) + ":" + 
								(date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds()) + " " + 
								(date.getMilliseconds()<10?'00'+date.getMilliseconds() : date.getMilliseconds()<100?'0'+date.getMilliseconds():date.getMilliseconds()) + "ms" + " : " + 
								message + "\n"
		);
		
	}
	
};

document.observe("dom:loaded", function() {
  // Initialize MyWebFonts
  MyWebFonts.initialize();
});
