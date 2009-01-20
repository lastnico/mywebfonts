/*  
 * My Web Fonts JavaScript API, version 0.2-dev
 * January 9th, 2009
 * (c) 2009 Nicolas Ternisien <nicolas.ternisien@gmail.com>
 *
 * My Web Fonts is freely distributable under the terms of an MIT-style license.
 * For details, see the My Web Fonts web site: http://www.mywebfonts.org/
 * 
 * The MIT License
 * Copyright (c) 2009 Nicolas Ternisien <nicolas.ternisien@gmail.com>, http://www.mywebfonts.org
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * -------------------------------------------------------------------------- */

var MyWebFonts = {
	version: '0.2-dev',

	// Configuration
	options: {
		// Test for external request
		//externalSite: "http://www.mywebfonts.org"
		externalSite: 		"",
		debug:				true
	},
	
	// Found Elements of the current page
	foundElements: 					[],
	// Fonts Datas already downloaded
	availableFonts: 				[],
	// Fonts Datas that MyWebFonts is currently downloading
	pendingFontDefinitions: 		[],

	// Constants
	FONT_SIZE_CONSTANTS: {
		"xx-small" : "8",
		"x-small" : "10",
		"small" : "12",
		"medium" : "14",
		"large" : "16",
		"x-large" : "18",
		"xx-large" : "20",
	},
	
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
		var fontColor = MyWebFonts.parseFontColor(domElement.style.color);
		
		if (fontIdentifier == null) {
			MyWebFonts.debug("[addFoundElement] Invalid element found : " + domElement + " with " + fontIdentifier);
			return;
		}
		
		var fontDefinition = new FontDefinition(fontIdentifier, fontVariant, fontSize, fontColor);
		
		MyWebFonts.debug("[addFoundElement] New element found : " + domElement + " with " + fontIdentifier);
		MyWebFonts.foundElements.push(new FoundElement(domElement, fontDefinition));
		
		// First see if this elements could be processed using an available font
		for (var i=0; i < MyWebFonts.availableFonts.length; ++i) {
			var currentFont = MyWebFonts.availableFonts[i];
			if (currentFont.fontDefinition.equals(fontDefinition)) {
				MyWebFonts.processFoundElementsWith(currentFont);
				// The font already exists, the element is now processed
				return;
			}
		}
		
		
		// If not, try to see if this font definition is currently being downloaded
		for (var i=0; i < MyWebFonts.pendingFontDefinitions.length; ++i) {
			var currentFontDefinition = MyWebFonts.pendingFontDefinitions[i];
			if (currentFontDefinition.equals(fontDefinition)) {
				// This font definition is currently downloaded. 
				// This element will be processed as soon as font datas will be downloaded
				return;
			}
		}
		
		// If not, load this font, and after receive font datas, the found element processing will be triggered
		MyWebFonts.loadFontDatas(fontDefinition);
	},
	
	loadFontDatas: function(fontDefinition) {
		// First search if already loaded, or currently loaded
		MyWebFonts.debug("[loadFontDatas] Font Identifier : " + fontDefinition.fontIdentifier);
		
		MyWebFonts.debug("[loadFontDatas] Adding Font Definition to pending list : " + fontDefinition.fontIdentifier);
		MyWebFonts.pendingFontDefinitions.push(fontDefinition);

		var scriptUrl = MyWebFonts.createFontDatasUrl(fontDefinition.fontIdentifier, fontDefinition.fontSize, fontDefinition.fontVariant, fontDefinition.fontColor);
		var script = new Element('script', { "type": "text/javascript", "src": scriptUrl });
		$$("head").first().appendChild(script);

	},
	
	
	parseFontColor: function(fontColor) {
		if (fontColor.empty() == true)
			return null;
		
		fontColor = fontColor.strip();
		MyWebFonts.debug("[parseFontColor] Font Color [" + fontColor + "]");
		
		fontColor = fontColor.replace(/#/g, fontColor);
		
		return fontColor;
	},
	
	// This method always return a font size in pixels, to match server requirements
	parseFontSize: function(fontSize) {
		if (fontSize.empty() == true)
			return null;
		
		fontSize = fontSize.strip();
		MyWebFonts.debug("[parseFontSize] Font Size [" + fontSize + "]");
		
		if (MyWebFonts.FONT_SIZE_CONSTANTS[fontSize] != null)
			return MyWebFonts.FONT_SIZE_CONSTANTS[fontSize];
		
		// 1em = 12pt = 16px = 100%
		var fontSizeRegex = /[\t\s]*(\d+\.?\d*)(px|pt|em)[\t\s]*/;

		var results = fontSize.match(fontSizeRegex);
		if (! results)
			return null;
		
		if (results[2] == "px")
			return Math.round(results[1]);
		else if (results[2] == "pt")
			return Math.round(4/3 * results[1]);
		else if (results[2] == "em")
			return Math.round(16 * results[1]);
		
		return null;
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
	
	newFont: function(fontDatas) {
		MyWebFonts.debug("[newFont] Receive new font datas : " + fontDatas.fontIdentifier);
		
		var font = new Font(fontDatas);
		
		MyWebFonts.debug("[newFont] [pre-remove] Pending list length : " + MyWebFonts.pendingFontDefinitions.length);
		for (var i=0; i < MyWebFonts.pendingFontDefinitions.length; ++i) {
			var currentFontDefinition = MyWebFonts.pendingFontDefinitions[i];
			if (currentFontDefinition.equals(font.fontDefinition)) {
				MyWebFonts.debug("[newFont] Removing font definition from pending list : " + font.fontDefinition.fontIdentifier);
				MyWebFonts.pendingFontDefinitions.splice(i, 1);
				break;
			}
		}
		MyWebFonts.debug("[newFont] [post-remove] Pending list length : " + MyWebFonts.pendingFontDefinitions.length);
		
		MyWebFonts.debug("[newFont] Adding Font to available list : " + font.fontDefinition.fontIdentifier);
		MyWebFonts.availableFonts.push(font);
		
		// Process Found Elements with this font
		MyWebFonts.processFoundElementsWith(font);
		

	},
	
	processFoundElementsWith: function(font) {
		MyWebFonts.debug("[processFoundElementsWith] Process found elements with : " + font.fontDefinition.fontIdentifier);
		
		for (var foundElementIndex = 0; foundElementIndex < MyWebFonts.foundElements.length; ++foundElementIndex) {
			var foundElement = MyWebFonts.foundElements[foundElementIndex];
			
			// If the foundElement does not match fondDatas content, then ignore it
			if (foundElement.isRequestedFont(font) == false) {
				continue;
			}
			
			MyWebFonts.debug("Replacing element : " + foundElement.domElement);
			var textNodes = foundElement.findTextNodes();
			for (var i=0; i < textNodes.length; ++i) {
				MyWebFonts.replaceText(textNodes[i], font);
			}
			
			MyWebFonts.debug("[newFont] [pre-remove] Found element list length : " + MyWebFonts.foundElements.length);
			// TODO Check if it works !
			// This element has been processed, it could be removed from list of found elements.
			MyWebFonts.foundElements.splice(foundElementIndex, 1);
			MyWebFonts.debug("[newFont] [post-remove] Found element list length : " + MyWebFonts.foundElements.length);
			
			foundElementIndex--;

		}
	},
	
	replaceText: function(element, font) {
		var elementContent = element.nodeValue;

		// TODO Be sure tabs are also stripped 
		elementContent = elementContent.strip();
		if (elementContent == "")
			return;

		MyWebFonts.debug("Element : " + element.nodeValue + "[type=" + element.nodeType + "]");
	
		var parent = element.parentNode;
		
		MyWebFonts.debug("Parent : " + parent.nodeName + "[type=" + parent.nodeType + "]");
		
		// TODO Separate each words inside a span, and add a "whitespace: no-wrap" to be sure words are not cut in their middle.  
		var letterImages = MyWebFonts.createTextImage(element.nodeValue, font);
		
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


	createTextImage: function(word, font) {
		var letterImages = new Array();
		var coordinates = font.coordinates;
		for (var index = 0; index < word.length; ++index) {
			var currentLetter = word[index];
			var letterCoordinate = coordinates[currentLetter];
			if (letterCoordinate == null) {
				letterImages.push(new Element('span').update(currentLetter));
				continue;
			}
	

			var imageUrl = MyWebFonts.options.externalSite + font.contentImagePath;
			var backgroundParameter = (-letterCoordinate.x) + "px " + (-letterCoordinate.y) + "px url(" + imageUrl + ")";
	
			var image = new Element('img', { src: MyWebFonts.options.externalSite + font.transparencyImagePath, alt: currentLetter });
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
			mainDebugElement = new Element("div");
			mainDebugElement.setStyle({
				border:				"1px solid #E6DB55",
				background:			"#FFFFCC none repeat scroll 0 0",
				color:				"#252111",
				padding:			"0px 0px 5px"
			});
			
			debugElement = new Element("pre", { id: "debug" } );
			debugElement.setStyle({
				fontFamily: 		"monospace",
				fontSize:			"11px"
			});
			
			
			var debugTitle = new Element("h2").update("My Web Fonts Debugging:");
			debugTitle.setStyle({
				fontFamily: 		"monospace",
				fontSize:			"14px",
				padding:			"0px",
				color:				"#BA6912",
				border:				"0"
			});
			
			var debugShowDetails = new Element("a").update("Details");
			//TODO Add onclick event to $("debug").toggle();
			//debugShowDetails.addEvent()
			debugTitle.append(debugShowDetails);
			
			mainDebugElement.appendChild(debugTitle);
			mainDebugElement.append(debugElement);
			
			$$("body").last().appendChild(mainDebugElement);
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

var FontDefinition = Class.create({
	initialize: function(fontDatas) {
		this.fontIdentifier = fontDatas.fontIdentifier;
		this.fontVariant = fontDatas.fontVariant;
		this.fontSize = fontDatas.fontSize;
		this.fontColor = fontDatas.fontColor;
	},

	equals: function(otherFontDefinition) {
		if (this.fontIdentifier != otherFontDefinition.fontIdentifier) {
			MyWebFonts.debug("Not same fontIdentifier : " + this.fontIdentifier + " != " + otherFontDefinition.fontIdentifier);
			return false;
		}
		
		if (this.fontVariant != otherFontDefinition.fontVariant) {
			MyWebFonts.debug(this.fontIdentifier + " : Not same fontVariant : " + this.fontVariant + " != " + otherFontDefinition.fontVariant);
			return false;
		}
		
		if (this.fontSize != otherFontDefinition.fontSize) {
			MyWebFonts.debug(this.fontIdentifier + " : Not same fontSize : " + this.fontSize + " != " + otherFontDefinition.fontSize);
			return false;
		}
		
		if (this.fontColor != otherFontDefinition.fontColor) {
			MyWebFonts.debug(this.fontIdentifier + " : Not same fontColor : " + this.fontColor + " != " + otherFontDefinition.fontColor);
			return false;
		}
	
		MyWebFonts.debug(this.fontIdentifier + " : Correct font found.");
		return true;
	}
});



var Font = Class.create({
	initialize: function(fontDatas) {
		this.contentImagePath = fontDatas.contentImagePath;
		this.transparencyImagePath = fontDatas.transparencyImagePath;
		
		this.fontDefinition = new FontDefinition(fontDatas.fontIdentifier, fontDatas.fontVariant, fontDatas.fontSize, fontDatas.fontColor);

		this.coordinates = fontDatas.coordinates;
	}

});

var FoundElement = Class.create({
	initialize: function(domElement, fontDefinition) {
		this.domElement = domElement;
		this.fontDefinition = fontDefinition;
	},

	isRequestedFont: function(font) {
		if (this.fontDefinition.equals(font.fontDefinition) == false)
			return false;
		
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
