/**
 * VexFlow TabDiv
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.TabDiv = function(sel) {
  if (arguments.length > 0) this.init(sel);
}

Vex.Flow.TabDiv.SEL = ".vex-tabdiv";
Vex.Flow.TabDiv.ERROR_NOCANVAS =
  "<b>This browser does not support HTML5 Canvas</b><br/>" +
  "Please use a modern browser such as <a href='http://google.com/chrome'>" +
  "Google Chrome</a> or <a href='http://firefox.com'>Firefox</a>.";

Vex.Flow.TabDiv.prototype.init = function(sel) {
  this.sel = sel;

  // Grab code and clear tabdiv
  this.code = $(sel).text();
  $(sel).empty();

  // Get tabdiv properties
  this.width = $(sel).attr("width") || 400;
  this.height = $(sel).attr("height") || 200;
  this.scale = $(sel).attr("scale") || 1.0;

  // If the Raphael.js sources are included, then use Raphael, else
  // resort to HTML5 Canvas.
  if (typeof (Raphael) == "undefined") {
    this.canvas = $('<canvas></canvas>').addClass("vex-canvas");
    $(sel).append(this.canvas);
    this.renderer = new Vex.Flow.Renderer(this.canvas[0],
        Vex.Flow.Renderer.Backends.CANVAS);
  } else {
    this.canvas = $('<div></div>').addClass("vex-canvas");
    $(sel).append(this.canvas);
    this.renderer = new Vex.Flow.Renderer(this.canvas[0],
        Vex.Flow.Renderer.Backends.RAPHAEL);
  }

  this.renderer.resize(this.width, this.height);
  this.ctx = this.renderer.getContext();
  this.ctx.scale(this.scale, this.scale);

  // Grab editor properties
  this.editor = $(sel).attr("editor") || "";
  this.editor_width= $(sel).attr("editor_width") || this.width;
  this.editor_height= $(sel).attr("editor_height") || 200;

  var that = this;
  if (this.editor == "true") {
    this.text_area = $('<textarea></textarea>').addClass("editor").
      val(this.code);
    this.editor_error = $('<div></div>').addClass("editor-error");
    $(sel).append($('<p/>')).append(this.editor_error);
    $(sel).append($('<p/>')).append(this.text_area);
    this.text_area.width(this.editor_width);
    this.text_area.height(this.editor_height);
    this.text_area.keyup(function() {
        if (that.timeoutID) window.clearTimeout(that.timeoutID);
        that.timeoutID =
          window.setTimeout(function() {
            // Draw only if code changed
            if (that.code != that.text_area.val()) {
              that.code = that.text_area.val();
              that.redraw()
            }
          }, 100);
    });
  }

  // Initialize parser.
  this.parser = new Vex.Flow.VexTab();
	//this.parser.tuning = new Vex.Flow.Tuning("A/1,D/2,G/3,C/4");
	
  this.message = "vexflow.com";
  if (!this.message) this.extra_height = 10; else this.extra_height = 20;
  this.redraw();
}

Vex.Flow.TabDiv.prototype.redraw = function() {
  var that = this;
  Vex.BM("Total render time: ", function() {
      that.parse(); that.draw();});

  return this;
}

Vex.Flow.TabDiv.prototype.resize = function(width, height) {
  this.renderer.resize(this.width * this.scale, this.height * this.scale);
  this.ctx = this.renderer.getContext();
}

Vex.Flow.TabDiv.prototype.drawInternal = function() {
  if (!this.parser.isValid()) return this;

  if (this.editor_error) this.editor_error.empty();

  var elements = this.parser.getElements();
  var staves = elements.staves;
  if (staves.length == 0) {
    this.resize(this.width, 10);
    this.ctx.clear();
    return this;
  }

  var tabnotes = elements.tabnotes;
  var notes = elements.notes;
  var ties = elements.ties;
  var beams = elements.beams;

  this.height = this.parser.getHeight() + this.extra_height;
  this.resize(this.width, this.height);
  this.ctx.clear();
  this.ctx.setFont("Arial", 8, "Bold");

  for (var i = 0; i < staves.length; ++i) {
    var tabstave = staves[i].tab;
    var notestave = staves[i].note;
    var voice_tabnotes = tabnotes[i];
    var voice_ties = ties[i];
    var voice_notes = notes[i];

    if(tabstave) {
      tabstave.setWidth(this.width - 50);
      tabstave.setContext(this.ctx).draw();
    }

    if (notestave) {
      notestave.setWidth(this.width - 50);
      notestave.setContext(this.ctx).draw();
    }

    if (notestave && tabstave) {
      Vex.Flow.Formatter.FormatAndDrawTab(
        this.ctx,
        tabstave, notestave,
        voice_tabnotes, 
        voice_notes,
        this.width - 100);
    } else if (tabstave) {
      if (voice_tabnotes) Vex.Flow.Formatter.FormatAndDraw(
          this.ctx, tabstave, voice_tabnotes, this.width - 100);
    } else if (notestave) {
      if (voice_notes) Vex.Flow.Formatter.FormatAndDraw(
          this.ctx, notestave, voice_notes, this.width - 100);
    }

    // Draw ties
    for (var j = 0; j < voice_ties.length; ++j) {
      voice_ties[j].setContext(this.ctx).draw();
    }
  }

  // Draw beams
  for (var j = 0; j < beams.length; ++j) {
    beams[j].setContext(this.ctx).draw();
  }

  if (this.message) {
    this.ctx.setFont("Times", 10, "bold italic");
    this.ctx.fillText(this.message, (this.width / 2) - 40, this.height - 10);
  }

  return this;
}

Vex.Flow.TabDiv.prototype.parseInternal = function() {
  try {
    this.parser.parse(this.code);
  } catch (e) {
    if (this.editor_error) {
      this.editor_error.empty();
      this.editor_error.append(
          $('<span></span>').addClass("text").html(e.message));
    }
  }
  return this;
}

Vex.Flow.TabDiv.prototype.parse = function() {
  var that = this;
  Vex.BM("Parse time: ", function() { that.parseInternal(); });
  return this;
}

Vex.Flow.TabDiv.prototype.draw = function() {
  var that = this;
  Vex.BM("Draw time: ", function() { that.drawInternal(); });
  return this;
}



// Automatic initialization.
var gTabDiv;
var gCanvasElement;
var gDrawingContext;
Vex.Flow.TabDiv.start = function() {
  $(Vex.Flow.TabDiv.SEL).each(function(index) {
      gTabDiv = new Vex.Flow.TabDiv(this);
			gCanvasElement = gTabDiv.canvas[0];
			gDrawingContext = gTabDiv.ctx;
  });
}
$(function() {if (Vex.Flow.TabDiv.SEL) { Vex.Flow.TabDiv.start() }});

var gTabNotes = "0/5 2/5 3/5 5/5 2/4 3/4 5/4 7/4 0/2 1/2 3/2 5/2 1/1 3/1 5/1 7/1".split(/\s/);
var gNotes    = "C   D   E   F   G   A   B   C   D   E   F   G   A   B   C   D".split(/\s*/);
var gCurrentNote = 0;
var gCode = "tabstave notation=true tablature=false clef=bass key=C\nnotes :q ";

function moveNote() {
	gTabDiv.code = gCode + gTabNotes[gCurrentNote];
	gTabDiv.redraw();
}
function handleArrowKeys(e) {
	var changed = false;
	switch(e.keyCode) {
		case 38: //arrow up
			gCurrentNote++;
			changed = true;
			break;
		case 40: //arrow down
			gCurrentNote--;
			changed = true;
			break;
	}
	if (gCurrentNote >= gNotes.length) gCurrentNote = 0;
	if (gCurrentNote < 0) gCurrentNote = gNotes.length - 1
	if (changed) {
		moveNote();
	}
}

$(function () { $(document).keyup(function (event) { handleArrowKeys(event) }) });
