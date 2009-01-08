/*  
 * MyWebFonts JavaScript API, version 0.2
 * December 16th, 2008
 * (c) 2008-2009 Nicolas Ternisien <nicolas.ternisien@gmail.com>
 *
 * Prototype is freely distributable under the terms of an MIT-style license.
 * For details, see the MyWebFonts web site: http://mywebfonts.minipoulpe.org/
 *
 * -------------------------------------------------------------------------- */

var MyWebFonts = {
	version: '0.2',

	// Configuration
	options: {
		// Test for external request
		//externalSite: "http://mywebfonts.minipoulpe.org"
		externalSite: 		"",
		debug:				true
	},
	
	// Used variables of the current page
	foundElements: [],
	availableFonts: [],

	initialize: function() {
		var domElements = $$(".mywebfonts");
		for (var index = 0; index < domElements.length; ++index) {
			MyWebFonts.addFoundElement(domElements[index]);
		}

	},

	addFoundElement: function(domElement) {
		var fontIdentifier = MyWebFonts.parseFontFamily(domElement.style.fontFamily);
		var fontVariant = null; //TODO
		var fontSize = MyWebFonts.parseFontSize(domElement.style.fontSize);
		var fontColor = null; //TODO
		
		if (fontIdentifier == null) {
			MyWebFonts.debug("[addFoundElement] Invalid element found : " + domElement + " with " + fontIdentifier);
			return;
		}
		
		MyWebFonts.debug("[addFoundElement] New element found : " + domElement + " with " + fontIdentifier);
		MyWebFonts.foundElements.push(new FoundElement(domElement, fontIdentifier, fontVariant, fontSize, fontColor));
		
		// TODO See if font datas already exists
		
		// If not, load them, and after receive font datas, the replacement will be triggered
		MyWebFonts.loadFontDatas(fontIdentifier, fontVariant, fontSize, fontColor);
	},
	
	loadFontDatas: function(fontIdentifier, fontSize, fontVariant, fontColor) {
		// First search if already loaded, or currently loaded
		MyWebFonts.debug("[loadFontDatas] Font Identifier : " + fontIdentifier);

		var scriptUrl = MyWebFonts.createFontDatasUrl(fontIdentifier, fontSize, fontVariant, fontColor);
		var script = new Element('script', { "type": "text/javascript", "src": scriptUrl });
		$$("head").first().appendChild(script);

	},
	
	parseFontSize: function(fontSize) {
		if (fontSize.empty() == true)
			return null;
		
		//TODO Improve this pattern and test
		if (fontSize.endsWith("px"))
			return fontSize.replace(/px\s*/g, "");
	},
	
	parseFontFamily: function(fontFamily) {
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


	createFontDatasUrl: function(fontIdentifier, fontVariant, fontSize, fontColor) {
		genericUrl = MyWebFonts.options.externalSite;
		genericUrl += "/font/" + arguments[0];
		
		if (fontVariant != null) 
			genericUrl += "/v:" + arguments[1];
		
		if (fontSize != null)
			genericUrl += "/" + arguments[2] + "px";
		
		if (fontColor != null)
			genericUrl += "/c:" + arguments[3];
		
		return genericUrl + "/datas";
		
	},
	
	newAvailableFont: function(fontDatas) {
		MyWebFonts.debug("[triggerSubstitutions] Receive new font datas : " + fontDatas.fontIdentifier);
		
		var availableFont = new AvailableFont(fontDatas);
		MyWebFonts.availableFonts.push(availableFont);
		
		for (var foundElementIndex = 0; foundElementIndex < MyWebFonts.foundElements.length; ++foundElementIndex) {
			var foundElement = MyWebFonts.foundElements[foundElementIndex];
			
			// If the foundElement does not match fondDatas content, then ignore it
			if (foundElement.isRequestedFont(availableFont) == false) {
				continue;
			}
			
			MyWebFonts.debug("Replacing element : " + foundElement.domElement);
			var textNodes = foundElement.findTextNodes();
			for (var i=0; i < textNodes.length; ++i) {
				MyWebFonts.replaceText(textNodes[i], availableFont);
			}
			
			// TODO Check if it works !
			// Remove element from list of pending elements
			MyWebFonts.foundElements.splice(foundElementIndex, 1);
			foundElementIndex--;

		}
		

	},
	
	replaceText: function(element, availableFont) {
		var elementContent = element.nodeValue;

		// TODO Be sure tabs are also stripped 
		elementContent = elementContent.strip();
		if (elementContent == "")
			return;

		MyWebFonts.debug("Element : " + element.nodeValue + "[type=" + element.nodeType + "]");
	
		var parent = element.parentNode;
		
		MyWebFonts.debug("Parent : " + parent.nodeName + "[type=" + parent.nodeType + "]");
		
		// TODO Separate each words inside a span, and add a "whitespace: no-wrap" to be sure words are not cut in their middle.  
		var letterImages = MyWebFonts.createTextImage(element.nodeValue, availableFont);
		
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


	createTextImage: function(word, availableFont) {
		var letterImages = new Array();
		var coordinates = availableFont.coordinates;
		for (var index = 0; index < word.length; ++index) {
			var currentLetter = word[index];
			var letterCoordinate = coordinates[currentLetter];
			if (letterCoordinate == null) {
				letterImages.push(new Element('span').update(currentLetter));
				continue;
			}
	

			var imageUrl = MyWebFonts.options.externalSite + availableFont.contentImagePath;
			var backgroundParameter = (-letterCoordinate.x) + "px " + (-letterCoordinate.y) + "px url(" + imageUrl + ")";
	
			var image = new Element('img', { src: MyWebFonts.options.externalSite + availableFont.transparencyImagePath, alt: currentLetter });
			image.setStyle({
				background: 			backgroundParameter,
				width:					letterCoordinate.width + "px",
				height:					letterCoordinate.height + "px",
				padding:				"0px",
				border:					"none" // Replace this to debug easily : "1px solid red"
			});
		
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
				border:				"1px solid #E6DB55",
				background:			"#FFFFCC none repeat scroll 0 0",
				color:				"#252111",
				padding:			"0px 0px 5px"
			});
			
			var debugTitle = new Element("h2").update("My Web Fonts Debugging:");
			debugTitle.setStyle({
				fontFamily: 		"monospace",
				fontSize:			"14px",
				padding:			"0px",
				border:				"0"
			});
			
			debugElement.appendChild(debugTitle);
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

var AvailableFont = Class.create({
	initialize: function(fontDatas) {
		this.contentImagePath = fontDatas.contentImagePath;
		this.transparencyImagePath = fontDatas.transparencyImagePath;
		
		this.fontIdentifier = fontDatas.fontIdentifier;
		this.fontVariant = fontDatas.fontVariant;
		this.fontSize = fontDatas.fontSize;
		this.fontColor = fontDatas.fontColor;

		this.coordinates = fontDatas.coordinates;
	}

});

var FoundElement = Class.create({
	initialize: function(domElement, fontIdentifier, fontVariant, fontSize, fontColor) {
		this.domElement = domElement;
		this.fontIdentifier = fontIdentifier;
		this.fontVariant = fontVariant;
		this.fontSize = fontSize;
		this.fontColor = fontColor;
	},

	isRequestedFont: function(availableFont) {
		if (this.fontIdentifier != availableFont.fontIdentifier) {
			MyWebFonts.debug("Not same fontIdentifier : " + this.fontIdentifier + " != " + availableFont.fontIdentifier);
			return false;
		}
		
		if (this.fontVariant != availableFont.fontVariant) {
			MyWebFonts.debug(this.fontIdentifier + " : Not same fontVariant : " + this.fontVariant + " != " + availableFont.fontVariant);
			return false;
		}
		
		if (this.fontSize != availableFont.fontSize) {
			MyWebFonts.debug(this.fontIdentifier + " : Not same fontSize : " + this.fontSize + " != " + availableFont.fontSize);
			return false;
		}
		
		if (this.fontColor != availableFont.fontColor) {
			MyWebFonts.debug(this.fontIdentifier + " : Not same fontColor : " + this.fontColor + " != " + availableFont.fontColor);
			return false;
		}
		
		MyWebFonts.debug(this.fontIdentifier + " : Correct font found.");
		return true;
	},
	

	findTextNodes: function() {
	    var nodes = [];

	    (function(currentElement) {
	        //if (!currentElement) return;
	        if ((currentElement.nodeType == 3))
	        	nodes.push(currentElement);
	        else
	            for (var i=0; i < currentElement.childNodes.length; ++i)
	                arguments.callee(currentElement.childNodes[i]);
	    })(this.domElement);
	    
	    return nodes;
	}

});

document.observe("dom:loaded", function() {
	// Initialize MyWebFonts
	MyWebFonts.initialize();
});
