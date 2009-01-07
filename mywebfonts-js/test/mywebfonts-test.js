new Test.Unit.Runner({


	testParseFontFamily: function() {
	 	this.assertEqual('rough-typewriter', MyWebFonts.parseFontFamily(' "mwf:rough-typewriter" '));
    	this.assertEqual('rough-typewriter', MyWebFonts.parseFontFamily("monospace, 'Arial','mwf:rough-typewriter' "));
    	this.assertEqual('rough-typewriter', MyWebFonts.parseFontFamily("monospace, 'Arial','mwf:rough-typewriter' "));
    	this.assertEqual('rough-typewriter', MyWebFonts.parseFontFamily(' "mwf:rough-typewriter" '));

    	this.assertEqual(null, MyWebFonts.parseFontFamily(" monospace, 'Arial'"));
    	this.assertEqual(null, MyWebFonts.parseFontFamily(' "monospace, '));
	},

	testParseFontSize: function() {
		this.assertEqual("20", MyWebFonts.parseFontFamily(' 20px'));
		this.assertEqual("20", MyWebFonts.parseFontFamily('     20px	'));
		this.assertEqual("20", MyWebFonts.parseFontFamily('     20px	'));
	},
	
	testAddFoundElement: function() {
		// Setup
		var element = new Element("div", { id: "elementTest1", style: "font-family: 'mwf:rough-typewriter'" } ).update("Test 1");
		$$("body").first().insert(element);
		
		MyWebFonts.addFoundElement($("elementTest1"));

		var scriptElement = $$("head script").last();
		
		this.assertEqual("text/javascript", scriptElement.type);
		this.assertMatch(/.*\/font\/rough-typewriter\/datas/, scriptElement.src);
		
		// Cleanup
		$("elementTest1").remove();
		scriptElement.remove();
	},
	

	testLoadFontDatas: function() {
		// Setup
		MyWebFonts.loadFontDatas("rough-typewriter", null, null, null);

		var scriptElement = $$("head script").last();
		
		this.assertEqual("text/javascript", scriptElement.type);
		this.assertMatch(/.*\/font\/rough-typewriter\/datas/, scriptElement.src);
		
		// Cleanup
		scriptElement.remove();
	},

	testDescendants: function() {
		var element = new FoundElement($("toto"), null, null, null, null);
		var textNodes = element.findTextNodes();
		showTextArray(textNodes);

	},
	
	testCreateFontDatasUrl: function() {
		this.assertEqual("/font/fontname/datas", MyWebFonts.createFontDatasUrl("fontname", null, null, null));
		this.assertEqual("/font/fontname/45px/datas", MyWebFonts.createFontDatasUrl("fontname", null, "45", null));
		this.assertEqual("/font/fontname2/v:regular/10px/datas", MyWebFonts.createFontDatasUrl("fontname2", "regular", "10", null));
		this.assertEqual("/font/fontname2/v:regular/10px/c:009933/datas", MyWebFonts.createFontDatasUrl("fontname2", "regular", "10", "009933"));
		
	}

 });

/**
 * Utility functions
 */
function showArray(array) {
	for (var index = 0; index < array.length; ++index) {
		MyWebFonts.debug("array[" + index + "] = " + array[index] + "\n");
	}
}

function showTextArray(array) {
	for (var index = 0; index < array.length; ++index) {
		MyWebFonts.debug("array[" + index + "] = " + array[index].nodeValue + "\n");
	}
}
