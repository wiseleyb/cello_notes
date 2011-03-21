/* modified from http://diveintohtml5.org/examples/halma.js */
function getCursorPosition(e) {
	/* returns Cell with .row and .column properties */
	var x;
	var y;
	if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	}
	else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	// account for location of canvas on page
	x -= gCanvasElement.offsetLeft;
	y -= gCanvasElement.offsetTop;
	// account for border
	x -= 10; 
	y -= 10;
	return [x,y];
}

// function - returns stave index is x,y is in staves boundries 
function inStave(x,y) {
	for (var index = 0; index < gTabDiv.parser.elements.staves.length; index++) {
			var stave = gTabDiv.parser.elements.staves[index].note;
			if (x >= stave.start_x & x <= stave.width + stave.x & y >= stave.y & y <= stave.y + stave.height) {
				return index;
			}
	}
	return -1;
}

function getNote(x,y, stave_index) {
	var notes = gTabDiv.parser.elements.notes[stave_index];
	for (var index = 0; index < notes.length; index++) {
		var note = notes[index];
		
	}
}

function handleMouseMove(e) {
	var xy = getCursorPosition(e);
	$('#status').text(xy[0] + ":" + xy[1] + "   s:" + inStave(xy[0],xy[1]));
}

gCanvasElement.addEventListener("mousemove", handleMouseMove, false);			
