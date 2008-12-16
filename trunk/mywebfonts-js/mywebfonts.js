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
		externalSite: "/concept"
	},
	

	initialize: function() {
		var scriptUrl = MyWebFonts.options.externalSite + "/javascriptDatas.js";
		alert("Coucou !" + scriptUrl);
		var script = new Element('script', { "type": "text/javascript", "src": scriptUrl });
		$$("head").first().appendChild(script);
		alert("Coucou Bis" + MyWebFonts.options.externalSite);

	},
	
	// It's bad and ugly code time
	process: function(element, letterCoordinates) {
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
	
	launchLetterReplacement: function(letterCoordinates) {
		alert("Callback !");
		$("debug").insert("Font Family : " + $("letters").style.fontFamily + "\n");
		$("debug").insert("Font Size : " + $("letters").style.fontSize + "\n");
		$("debug").insert("Font Weight : " + $("letters").style.fontWeight + "\n");
		//$("letters").style.backgroundColor = "red";
		//$("debug").insert("Current color : " + $("letters").style.backgroundColor + "\n");

		var word = "Bonjour tous les enfants Test: ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz!?,;:/\\_()[]\"'&# ";
	
		//var descendants = $("letters").descendants();
	
		MyWebFonts.process($("letters"), letterCoordinates);
	
//		alert("Node value : " + $("letters").firstChild.nodeValue + " and nodeType " + $("letters").firstChild.nodeName);
//		for (var descendantIndex = 0; descendantIndex < descendants.length; ++descendantIndex) {
//			var descendant = descendants[descendantIndex];
//	
//	
//			//alert("Descendant : " + descendant.firstChild.nodeValue + " and nodeType + " + descendant.nodeName);
//			$("debug").update(descendant.inspect());
//		}
	
		//$("debug").insert("Titi");
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
	
			var backgroundParameter = (-letterCoordinate.x) + "px " + (-letterCoordinate.y) + "px url(" + MyWebFonts.options.externalSite + "/font-example.png)";
	
			var image = new Element('img', { src: MyWebFonts.options.externalSite + "/transparent.png", alt: currentLetter });
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
	}
};
