new Test.Unit.Runner({


	testParseFontFamily: function() {
	 	this.assertEqual('rough-typewriter', MyWebFonts.parseFontFamily(' "mwf:rough-typewriter" '));
    	this.assertEqual('rough-typewriter', MyWebFonts.parseFontFamily("monospace, 'Arial','mwf:rough-typewriter' "));
    	this.assertEqual('rough-typewriter', MyWebFonts.parseFontFamily("monospace, 'Arial','mwf:rough-typewriter' "));

    	this.assertEqual("rough-typewriter", MyWebFonts.parseFontFamily(' mwf:rough-typewriter'));
    	this.assertEqual(null, MyWebFonts.parseFontFamily(' "monospace, '));
	},
	
	testLoadFontDatas: function() {
		// Setup
		var element = new Element("div", { id: "elementTest1", style: "font-family: 'mwf:rough-typewriter'" } ).update("Test 1");
		$$("body").first().insert(element);
		
		MyWebFonts.loadFontDatas($("elementTest1"));

		var scriptElement = $$("head script").last();
		
		this.assertEqual("text/javascript", scriptElement.type);
		this.assertMatch(/.*\/font\/rough-typewriter\/datas/, scriptElement.src);
		
		// Cleanup
		$("elementTest1").remove();
		scriptElement.remove();
	},

	testDescendants: function() {
		
		var textNodes = MyWebFonts.findTextNodes($("toto"));
		showTextArray(textNodes);

	},

 });

/**
 * Utility functions
 */
function showArray(array) {
	for (var index = 0; index < array.length; ++index) {
		$("debug").insert("array[" + index + "] = " + array[index] + "\n");
	}
}

function showTextArray(array) {
	for (var index = 0; index < array.length; ++index) {
		$("debug").insert("array[" + index + "] = " + array[index].nodeValue + "\n");
	}
}
