
// Test for external request
var EXTERNAL_SITE = "http://mywebfonts.appspot.com/concept";

function initialize() {
	var script = new Element('script', { "type": "text/javascript", "src": EXTERNAL_SITE + "/javascriptDatas.js" });
	$$("head").first().appendChild(script);
}

/*
 * It's bad and ugly code time
 */
function process(element, letterCoordinates) {
	var child;
	for (child = element.firstChild; child; child = child.nextSibling) {
		switch (child.nodeType) {
			case Node.TEXT_NODE:
				replaceText(child, element, letterCoordinates);
				break;
			case Node.ELEMENT_NODE:
				process(child, letterCoordinates);
				break;
		}
	}
}

function launchLetterReplacement(letterCoordinates) {

	$("debug").insert("Font Family : " + $("letters").style.fontFamily + "\n");
	$("debug").insert("Font Size : " + $("letters").style.fontSize + "\n");
	$("debug").insert("Font Weight : " + $("letters").style.fontWeight + "\n");
	//$("letters").style.backgroundColor = "red";
//$("debug").insert("Current color : " + $("letters").style.backgroundColor + "\n");

	var word = "Bonjour tous les enfants Test: ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwxyz!?,;:/\\_()[]\"'&# ";

	//var descendants = $("letters").descendants();

	process($("letters"), letterCoordinates);

	/*
	alert("Node value : " + $("letters").firstChild.nodeValue + " and nodeType " + $("letters").firstChild.nodeName);
	for (var descendantIndex = 0; descendantIndex < descendants.length; ++descendantIndex) {
		var descendant = descendants[descendantIndex];


		//alert("Descendant : " + descendant.firstChild.nodeValue + " and nodeType + " + descendant.nodeName);
		$("debug").update(descendant.inspect());
	}
	*/

	//$("debug").insert("Titi");
}

function replaceText(element, parent, letterCoordinates) {
	$("debug").insert("Titi : " + element.nodeValue + "\n");

	var letterImages = createTextImage(element, letterCoordinates);
	for (var index = 0; index < letterImages.length; ++index) {
		if (index == 0)
			parent.replaceChild(letterImages[index], element);
		else
			parent.insert(letterImages[index]);
		//$("debug").insert("Titi : " + letterImages[index] + "\n");
	}

}

function createTextImage(element, letterCoordinates) {
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

		var backgroundParameter = (-letterCoordinate.x) + "px " + (-letterCoordinate.y) + "px url(" + EXTERNAL_SITE + "/font-example.png)";

		var image = new Element('img', { src: EXTERNAL_SITE + "/transparent.png", alt: currentLetter });
		image.setStyle({
			background: 			backgroundParameter,
			width:					letterCoordinate.width + "px",
			height:					letterCoordinate.height + "px",
			padding:				"0px"/*,
			border:					"1px solid red",*/
		});

		letterImages.push(image);
	}

	return letterImages;
}
