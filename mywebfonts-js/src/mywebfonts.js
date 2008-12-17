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
		externalSite: ""
	},
	

	initialize: function() {
		fontElements = $$(".mywebfonts");
		for (var index = 0; index < fontElements.length; ++index) {
			MyWebFonts.loadFontDatas(fontElements[index]);
		}

	},

	loadFontDatas: function(fontElement) {
		fontIdentifier = MyWebFonts.parseFontFamily(fontElement.style.fontFamily);

		fontSize = fontElement.style.fontSize;
		//$("debug").insert("Font Weight : " + $("letters").style.fontWeight + "\n");

		$("debug").insert("[loadFontDatas] Font Identifier : " + fontIdentifier + "\n");
		//fontIdentifier = fontFamily.replace(/.*('|")('|").*/, "$1");
		//if (fontFamily.startsWidth("mwf")) {
		//	var fontIdentifier = ;
		//}
		//*/
		var scriptUrl = MyWebFonts.createFontDatasUrl(fontIdentifier);
		var script = new Element('script', { "type": "text/javascript", "src": scriptUrl });
		$$("head").first().appendChild(script);

	},
	
	parseFontFamily: function(fontFamily) {

		$("debug").insert("Titi : " + fontFamily + "\n");
		$("debug").insert("Titi : " + fontFamily + "\n");

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
		
		return genericUrl
		
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
	
	// It's bad and ugly code time
	process: function(element, letterCoordinates) {
		if (element == null)
			return;
		
		var child;
		for (child = element.firstChild; child; child = child.nextSibling) {
			switch (child.nodeType) {
				case Node.TEXT_NODE:
					MyWebFonts.replaceText(child, element, letterCoordinates);
					break;
				case Node.ELEMENT_NODE:
					MyWebFonts.process(child, letterCoordinates);
					break;
			}
		}
	},
	
	triggerSubstitutions: function(letterCoordinates) {

		var textNodes = MyWebFonts.findTextNodes($("letters"));
		for (var i=0; i < textNodes.length; ++i) {
			MyWebFonts.replaceText(textNodes[i], textNodes[i].parent, letterCoordinates);
		}
		

	},

	replaceText: function(element, parent, letterCoordinates) {
		$("debug").insert("Titi : " + element.nodeValue + "\n");
	
		var letterImages = MyWebFonts.createTextImage(element, letterCoordinates);
		for (var index = 0; index < letterImages.length; ++index) {
			if (index == 0)
				parent.replaceChild(letterImages[index], element);
			else
				parent.insert(letterImages[index]);
			//$("debug").insert("Titi : " + letterImages[index] + "\n");
		}
	},


	createTextImage: function(element, letterCoordinates) {
		var word = element.nodeValue;
	
		var letterImages = new Array();
		for (var index = 0; index < word.length; ++index) {
			var currentLetter = word[index];
			var letterCoordinate = letterCoordinates[currentLetter];
			if (letterCoordinate == null) {
				//TODO Could be better !
				//letterImages.push(new Element('span').update(currentLetter));
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
	
};

document.observe("dom:loaded", function() {
  // Initialize MyWebFonts
  MyWebFonts.initialize();
});
