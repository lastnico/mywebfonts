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
		// Displays a MyWebFonts debug block
		debug:				true,
		// Display by default the MyWebFonts debug block
		showDebugBlock:		false
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
		"xx-large" : "20"
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
			MyWebFonts.debug("addFoundElement", "Invalid element found : " + domElement + " with " + fontIdentifier);
			return;
		}
		
		var fontDefinition = new FontDefinition(fontIdentifier, fontVariant, fontSize, fontColor);
		
		MyWebFonts.debug("addFoundElement", "New element found : " + domElement + " with " + fontIdentifier);
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
		MyWebFonts.debug("loadFontDatas", "Font Identifier : " + fontDefinition.fontIdentifier);
		
		MyWebFonts.debug("loadFontDatas", "Adding Font Definition to pending list : " + fontDefinition.fontIdentifier);
		MyWebFonts.pendingFontDefinitions.push(fontDefinition);

		var scriptUrl = MyWebFonts.createFontDatasUrl(fontDefinition);
		var script = new Element('script', { "type": "text/javascript", "src": scriptUrl });
		$$("head").first().appendChild(script);

	},
	
	
	parseFontColor: function(fontColor) {
		if (fontColor.empty() == true)
			return null;
		
		fontColor = fontColor.strip();
		
		var rgbColor = new RGBColor(fontColor); 
		
		MyWebFonts.debug("parseFontColor", "Font Color [" + rgbColor.toHex() + "]");
		return rgbColor.toHex().replace(/#/, "");
	},
	
	// This method always return a font size in pixels, to match server requirements
	parseFontSize: function(fontSize) {
		if (fontSize.empty() == true)
			return null;
		
		fontSize = fontSize.strip();
		MyWebFonts.debug("parseFontSize", "Font Size [" + fontSize + "]");
		
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


	createFontDatasUrl: function(fontDefinition) {
		genericUrl = MyWebFonts.options.externalSite;
		genericUrl += "/font/" + fontDefinition.fontIdentifier;
		
		if (fontDefinition.fontVariant != null) 
			genericUrl += "/v:" + fontDefinition.fontVariant;
		
		if (fontDefinition.fontSize != null)
			genericUrl += "/" + fontDefinition.fontSize + "px";
		
		if (fontDefinition.fontColor != null)
			genericUrl += "/c:" + fontDefinition.fontColor;
		
		return genericUrl + "/datas";
		
	},
	
	newFont: function(fontDatas) {
		MyWebFonts.debug("newFont", "Receive new font datas : " + fontDatas.fontIdentifier);
		
		var font = new Font(fontDatas);
		
		for (var i=0; i < MyWebFonts.pendingFontDefinitions.length; ++i) {
			var currentFontDefinition = MyWebFonts.pendingFontDefinitions[i];
			if (currentFontDefinition.equals(font.fontDefinition)) {
				MyWebFonts.debug("newFont", "Removing font definition from pending list : " + font.fontDefinition.fontIdentifier);
				MyWebFonts.pendingFontDefinitions.splice(i, 1);
				break;
			}
		}
		
		MyWebFonts.debug("newFont", "Adding Font to available list : " + font.fontDefinition.fontIdentifier);
		MyWebFonts.availableFonts.push(font);
		
		// Process Found Elements with this font
		MyWebFonts.processFoundElementsWith(font);
		

	},
	
	processFoundElementsWith: function(font) {
		MyWebFonts.debug("processFoundElementsWith", "Process found elements with : " + font.fontDefinition.fontIdentifier);
		
		for (var foundElementIndex = 0; foundElementIndex < MyWebFonts.foundElements.length; ++foundElementIndex) {
			var foundElement = MyWebFonts.foundElements[foundElementIndex];
			
			// If the foundElement does not match fondDatas content, then ignore it
			if (foundElement.isRequestedFont(font) == false) {
				continue;
			}
			
			MyWebFonts.debug("processFoundElementsWith", "Replacing element : " + foundElement.domElement);
			var textNodes = foundElement.findTextNodes();
			for (var i=0; i < textNodes.length; ++i) {
				MyWebFonts.replaceText(textNodes[i], font);
			}
			
			// This element has been processed, it could be removed from list of found elements.
			MyWebFonts.foundElements.splice(foundElementIndex, 1);
			
			foundElementIndex--;

		}
	},
	
	replaceText: function(element, font) {
		var elementContent = element.nodeValue;

		// TODO Be sure tabs are also stripped 
		elementContent = elementContent.strip();
		if (elementContent == "")
			return;

		MyWebFonts.debug("replaceText", "Element : " + element.nodeValue + "[type=" + element.nodeType + "]");
	
		var parent = element.parentNode;
		
		MyWebFonts.debug("replaceText", "Parent : " + parent.nodeName + "[type=" + parent.nodeType + "]");
		
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
	
	debug: function(method, message) {
		if (MyWebFonts.options.debug==false)
			return;
		
		var debugLogElement = $("mywebfonts-debug-log");
		// If this element does not exist, initialize Debug block
		if (debugLogElement == null) {
			debugElement = new Element("div", { "id" : "mywebfonts-debug" });
			debugElement.setStyle({
				border:				"1px solid #E6DB55",
				background:			"#FFFFCC none repeat scroll 0 0",
				color:				"#252111",
				position:			"fixed",
				bottom:				"0px",
				left:				"0px",
				right:				"0px",
				height:				"20px",
				padding:			"1px 0px 1px 10px",
				margin:				"0px auto 0px auto"
			});
			
			debugLogElement = new Element("div", { id: "mywebfonts-debug-log" } );
			debugLogElement.setStyle({
				fontFamily: 		"monospace",
				fontSize:			"11px",
				margin:				"0",
				display:			"none",
				overflow :			"auto",
				height:				"320px"
			});
			
			var debugTitle = new Element("h2", { "title" : "Click here to have more details about MyWebFonts debugging" }).update("My Web Fonts Debug Log");
			debugTitle.setStyle({
				fontFamily: 		"monospace",
				fontSize:			"12px",
				padding:			"0px 0px 10px 0px",
				color:				"#BA6912",
				cursor:				"pointer",
				margin:				"0"
			});
			debugTitle.observe('click', MyWebFonts.toggleDebug);
			
			var debugToggleLog = new Element("span", { "id" : "mywebfonts-toggle-debug", "title" : "Click here to have more details about MyWebFonts debugging" }).update("» Show Details");
			debugToggleLog.setStyle({
				"float":			"right",
				fontSize:			"12px",
				padding:			"0px 10px 0 0",
				fontWeight:			"bold",
				color:				"#BA6912",
				border:				"0",
				cursor:				"pointer"
			});
			debugToggleLog.observe('click', MyWebFonts.toggleDebug);

			
			debugElement.appendChild(debugToggleLog);
			debugElement.appendChild(debugTitle);
			debugElement.appendChild(debugLogElement);
			
			$$("body").last().appendChild(debugElement);
			
			// By default, debug block is built in "hidden" mode, so a toggle will enable it
			if (MyWebFonts.options.showDebugBlock == true) {
				MyWebFonts.toggleDebug(null); // Useless parameter
			}
		}
		
		var date = new Date();
		
		var spanDate = new Element("span").update(
				(date.getHours()<10?'0'+date.getHours():date.getHours()) + ":" + 
				(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes()) + ":" + 
				(date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds()) + " " + 
				(date.getMilliseconds()<10?'00'+date.getMilliseconds() : date.getMilliseconds()<100?'0'+date.getMilliseconds():date.getMilliseconds()) + 
				"ms ");
		spanDate.setStyle({ color: "#61A840" });
		debugLogElement.insert(spanDate);
		
		var spanMethod = new Element("span").update("[" + method + "] ");
		spanMethod.setStyle({ color: "#8CBFE5" });
		debugLogElement.insert(spanMethod);
		debugLogElement.insert(new Element("span").update(message));
		debugLogElement.insert(new Element("br"));
		
	},
	

	toggleDebug: function(event) {
		//var element = Event.element(event);
		$('mywebfonts-debug-log').toggle();

		if ($('mywebfonts-debug-log').visible()) {
			$("mywebfonts-toggle-debug").update("» Hide Details");
			
			$('mywebfonts-debug').setStyle({
				height:				"350px"
			});

		}
		else {
			$("mywebfonts-toggle-debug").update("» Show Details");
			
			$('mywebfonts-debug').setStyle({
				height:				"20px"
			});

		}
		
	}

	
};

var FontDefinition = Class.create({
	initialize: function(fontIdentifier, fontVariant, fontSize, fontColor) {
		this.fontIdentifier = fontIdentifier;
		this.fontVariant = fontVariant;
		this.fontSize = fontSize;
		this.fontColor = fontColor;
	},

	equals: function(otherFontDefinition) {
		if (this.fontIdentifier != otherFontDefinition.fontIdentifier) {
			MyWebFonts.debug("FontDefinition.equals", "Not same fontIdentifier : " + this.fontIdentifier + " != " + otherFontDefinition.fontIdentifier);
			return false;
		}
		
		if (this.fontVariant != otherFontDefinition.fontVariant) {
			MyWebFonts.debug("FontDefinition.equals", this.fontIdentifier + " : Not same fontVariant : " + this.fontVariant + " != " + otherFontDefinition.fontVariant);
			return false;
		}
		
		if (this.fontSize != otherFontDefinition.fontSize) {
			MyWebFonts.debug("FontDefinition.equals", this.fontIdentifier + " : Not same fontSize : " + this.fontSize + " != " + otherFontDefinition.fontSize);
			return false;
		}
		
		if (this.fontColor != otherFontDefinition.fontColor) {
			MyWebFonts.debug("FontDefinition.equals", this.fontIdentifier + " : Not same fontColor : " + this.fontColor + " != " + otherFontDefinition.fontColor);
			return false;
		}
	
		MyWebFonts.debug("FontDefinition.equals", this.fontIdentifier + " : Correct font found.");
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

var RGBColor = Class.create({
	
	initialize: function(colorString) {
	    // Strip any leading #
	    if (colorString.charAt(0) == '#') { // remove # if any
	        colorString = colorString.substr(1,6);
	    }
	
	    colorString = colorString.replace(/ /g,'');
	    colorString = colorString.toLowerCase();
	
	    // Before getting into regexps, try simple matches and overwrite the input
	    var simpleColors = {
	        aliceblue: 'f0f8ff',
	        antiquewhite: 'faebd7',
	        aqua: '00ffff',
	        aquamarine: '7fffd4',
	        azure: 'f0ffff',
	        beige: 'f5f5dc',
	        bisque: 'ffe4c4',
	        black: '000000',
	        blanchedalmond: 'ffebcd',
	        blue: '0000ff',
	        blueviolet: '8a2be2',
	        brown: 'a52a2a',
	        burlywood: 'deb887',
	        cadetblue: '5f9ea0',
	        chartreuse: '7fff00',
	        chocolate: 'd2691e',
	        coral: 'ff7f50',
	        cornflowerblue: '6495ed',
	        cornsilk: 'fff8dc',
	        crimson: 'dc143c',
	        cyan: '00ffff',
	        darkblue: '00008b',
	        darkcyan: '008b8b',
	        darkgoldenrod: 'b8860b',
	        darkgray: 'a9a9a9',
	        darkgreen: '006400',
	        darkkhaki: 'bdb76b',
	        darkmagenta: '8b008b',
	        darkolivegreen: '556b2f',
	        darkorange: 'ff8c00',
	        darkorchid: '9932cc',
	        darkred: '8b0000',
	        darksalmon: 'e9967a',
	        darkseagreen: '8fbc8f',
	        darkslateblue: '483d8b',
	        darkslategray: '2f4f4f',
	        darkturquoise: '00ced1',
	        darkviolet: '9400d3',
	        deeppink: 'ff1493',
	        deepskyblue: '00bfff',
	        dimgray: '696969',
	        dodgerblue: '1e90ff',
	        feldspar: 'd19275',
	        firebrick: 'b22222',
	        floralwhite: 'fffaf0',
	        forestgreen: '228b22',
	        fuchsia: 'ff00ff',
	        gainsboro: 'dcdcdc',
	        ghostwhite: 'f8f8ff',
	        gold: 'ffd700',
	        goldenrod: 'daa520',
	        gray: '808080',
	        green: '008000',
	        greenyellow: 'adff2f',
	        honeydew: 'f0fff0',
	        hotpink: 'ff69b4',
	        indianred : 'cd5c5c',
	        indigo : '4b0082',
	        ivory: 'fffff0',
	        khaki: 'f0e68c',
	        lavender: 'e6e6fa',
	        lavenderblush: 'fff0f5',
	        lawngreen: '7cfc00',
	        lemonchiffon: 'fffacd',
	        lightblue: 'add8e6',
	        lightcoral: 'f08080',
	        lightcyan: 'e0ffff',
	        lightgoldenrodyellow: 'fafad2',
	        lightgrey: 'd3d3d3',
	        lightgreen: '90ee90',
	        lightpink: 'ffb6c1',
	        lightsalmon: 'ffa07a',
	        lightseagreen: '20b2aa',
	        lightskyblue: '87cefa',
	        lightslateblue: '8470ff',
	        lightslategray: '778899',
	        lightsteelblue: 'b0c4de',
	        lightyellow: 'ffffe0',
	        lime: '00ff00',
	        limegreen: '32cd32',
	        linen: 'faf0e6',
	        magenta: 'ff00ff',
	        maroon: '800000',
	        mediumaquamarine: '66cdaa',
	        mediumblue: '0000cd',
	        mediumorchid: 'ba55d3',
	        mediumpurple: '9370d8',
	        mediumseagreen: '3cb371',
	        mediumslateblue: '7b68ee',
	        mediumspringgreen: '00fa9a',
	        mediumturquoise: '48d1cc',
	        mediumvioletred: 'c71585',
	        midnightblue: '191970',
	        mintcream: 'f5fffa',
	        mistyrose: 'ffe4e1',
	        moccasin: 'ffe4b5',
	        navajowhite: 'ffdead',
	        navy: '000080',
	        oldlace: 'fdf5e6',
	        olive: '808000',
	        olivedrab: '6b8e23',
	        orange: 'ffa500',
	        orangered: 'ff4500',
	        orchid: 'da70d6',
	        palegoldenrod: 'eee8aa',
	        palegreen: '98fb98',
	        paleturquoise: 'afeeee',
	        palevioletred: 'd87093',
	        papayawhip: 'ffefd5',
	        peachpuff: 'ffdab9',
	        peru: 'cd853f',
	        pink: 'ffc0cb',
	        plum: 'dda0dd',
	        powderblue: 'b0e0e6',
	        purple: '800080',
	        red: 'ff0000',
	        rosybrown: 'bc8f8f',
	        royalblue: '4169e1',
	        saddlebrown: '8b4513',
	        salmon: 'fa8072',
	        sandybrown: 'f4a460',
	        seagreen: '2e8b57',
	        seashell: 'fff5ee',
	        sienna: 'a0522d',
	        silver: 'c0c0c0',
	        skyblue: '87ceeb',
	        slateblue: '6a5acd',
	        slategray: '708090',
	        snow: 'fffafa',
	        springgreen: '00ff7f',
	        steelblue: '4682b4',
	        tan: 'd2b48c',
	        teal: '008080',
	        thistle: 'd8bfd8',
	        tomato: 'ff6347',
	        turquoise: '40e0d0',
	        violet: 'ee82ee',
	        violetred: 'd02090',
	        wheat: 'f5deb3',
	        white: 'ffffff',
	        whitesmoke: 'f5f5f5',
	        yellow: 'ffff00',
	        yellowgreen: '9acd32'
	    };
	    for (var key in simpleColors) {
	        if (colorString == key) {
	            colorString = simpleColors[key];
	            break;
	        }
	    }
	    // end of simple type-in colors
	
	    // Color definition objects
	    var colorDefinitions = [
	        {
	            re: /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/, // Example: 'rgb(123, 234, 45)', 'rgb(255,234,245)'
	            process: function(bits) {
	                return [
	                    parseInt(bits[1]),
	                    parseInt(bits[2]),
	                    parseInt(bits[3])
	                ];
	            }
	        }, {
	            re: /^(\w{2})(\w{2})(\w{2})$/, // Example: '#00ff00', '336699'
	            process: function(bits){
	                return [
	                    parseInt(bits[1], 16),
	                    parseInt(bits[2], 16),
	                    parseInt(bits[3], 16)
	                ];
	            }
	        }, {
	            re: /^(\w{1})(\w{1})(\w{1})$/, // Example: '#fb0', 'f0f'
	            process: function (bits){
	                return [
	                    parseInt(bits[1] + bits[1], 16),
	                    parseInt(bits[2] + bits[2], 16),
	                    parseInt(bits[3] + bits[3], 16)
	                ];
	            }
	        }
	    ];
	
	    // Search through the definitions to find a match
	    for (var i = 0; i < colorDefinitions.length; i++) {
	        var re = colorDefinitions[i].re;
	        var processor = colorDefinitions[i].process;
	        var bits = re.exec(colorString);
	        if (bits) {
	            channels = processor(bits);
	            this.r = channels[0];
	            this.g = channels[1];
	            this.b = channels[2];
	        }
	
	    }
	
	    // Validate and cleanup values
	    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
	    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
	    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
	},
	
    toRGB : function() {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    },
    
    
    toHex : function() {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }
});


document.observe("dom:loaded", function() {
	// Initialize MyWebFonts
	MyWebFonts.initialize();
});
