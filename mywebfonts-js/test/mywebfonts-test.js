/*  
 * My Web Fonts Unit Tests
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
		this.assertEqual("20", MyWebFonts.parseFontSize(' 20px'));
		this.assertEqual("20", MyWebFonts.parseFontSize(' 20.3px')); // A trap ;-)
		this.assertEqual("21", MyWebFonts.parseFontSize(' 20.8px')); // Another trap ;-)
		this.assertEqual("20", MyWebFonts.parseFontSize('     20px	'));
		this.assertEqual("30", MyWebFonts.parseFontSize('     30px	'));
		this.assertEqual("8", MyWebFonts.parseFontSize('			xx-small		'));
		this.assertEqual("10", MyWebFonts.parseFontSize('		   x-small		'));
		this.assertEqual("12", MyWebFonts.parseFontSize('			small		'));
		this.assertEqual("14", MyWebFonts.parseFontSize('		   	medium		'));
		this.assertEqual("16", MyWebFonts.parseFontSize('			large		'));
		this.assertEqual("18", MyWebFonts.parseFontSize('			x-large		'));
		this.assertEqual("20", MyWebFonts.parseFontSize('xx-large'));
		this.assertEqual("16", MyWebFonts.parseFontSize('1em'));
		this.assertEqual("19", MyWebFonts.parseFontSize('1.2em')); //Pixels size are always rounded
		this.assertEqual("3", MyWebFonts.parseFontSize('2pt')); //Pixels size are always rounded
		this.assertEqual("4", MyWebFonts.parseFontSize('3pt'));
	},

	testParseFontColor: function() {
		this.assertEqual("eeff55", MyWebFonts.parseFontColor(' #eeff55'));
		this.assertEqual("0c0d0e", MyWebFonts.parseFontColor('rgb(12,13,14)'));
		this.assertEqual("0c0d0e", MyWebFonts.parseFontColor('rgb		( 12	 , 13 ,	 14)'));
		this.assertEqual("0000ff", MyWebFonts.parseFontColor('blue'));
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
