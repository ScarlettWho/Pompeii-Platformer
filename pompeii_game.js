/*var activeChars = {
	"@": Player,
	"#": Marco,
	"a": whiteAtfct,
	"A": blackAtfct,
	"h": Hand,
	"M": keyAtfct,
	"V": Boss,
	"N": Enemy,
	"-": brkblWall
}; */

function Level(blueprint) {
	this.width = blueprint[0].length;
	this.height = blueprint.length;
	this.grid = [];
	//this.actors = [];

	for (var y = 0; y < this.height; y++) {
		var line = blueprint[y], gridLine = [];

		for (var x = 0; x < this.width; x++) {
			var ch = line[x], fieldType = null;
			//var Actor = activeChars[ch];

			//if (Actor)
			//	this.actors.push(new Actor(new Vector(x, y), ch));
			if (ch == "x")
				fieldType = "wall";
			else if (ch == "b")
				fieldType = "bush";
			else if (ch == "s")
				fieldType = "vine";
			//else if (ch == "c")
				//fieldType = "door";
			gridLine.push(fieldType);
		}
		this.grid.push(gridLine);
	}
	//this.player = this.actors.filter(function(actor) {
		//return actor.type == "player";
	//})[0];
}

//What does this vector function refer to and control?
function Vector(x, y) {
	this.x = x; this.y = y;
}

Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.times = function(factor) {
	return new Vector(this.x * factor, this.y * factor);
}

function elmnt(name,className) {
	var elmnt = document.createElement(name);
	if (className) elmnt.className = className;
		return elmnt;
}

function DOMDisplay(parent, level) {
	this.wrap = parent.appendChild(elmnt("div", "game"));
	this.level = level;
	this.pos = new Vector(0, -0.5);
	this.speed = new Vector(0,0);
	this.wrap.appendChild(this.drawBackground());
}

var scale = 10;

DOMDisplay.prototype.drawBackground = function() {
	var table = elmnt("table", "background");
	table.style.width = this.level.width * scale + "px";
	this.level.grid.forEach(function(row) {
		var rowElmnt = table.appendChild(elmnt("tr"));
		rowElmnt.style.height = scale + "px";
		row.forEach(function(type) {
			rowElmnt.appendChild(elmnt("td", type));
		});
	});
	return table;
};

var scrollXSpeed = 100;
var scrollYSpeed = 100;

DOMDisplay.prototype.scrollView = function(keys, step) {
	var width = this.wrap.clientWidth;
	var maxWidth = this.wrap.scrollWidth;
	var height = this.wrap.clientHeight;
	var maxHeight = this.wrap.scrollHeight;

	this.speed.x = 0;
	if (keys.left && this.pos.x > 0) this.speed.x -= scrollXSpeed;
	if (keys.right && (this.pos.x < (maxWidth - width))) this.speed.x += scrollXSpeed;

	this.speed.y = 0;
	if (keys.up && this.pos.y > 0) this.speed.y -= scrollYSpeed;
	if (keys.down && (this.pos.y < (maxHeight - height))) this.speed.y += scrollYSpeed;

	var motion = new Vector(this.speed.x * step, this.speed.y * step);
	var newPos = this.pos.plus(motion);
	this.wrap.scrollLeft = newPos.x;
	this.wrap.scrollTop = newPos.y;
	this.pos = newPos;
};

function runLevel(level, Display) {
	var display = new Display(document.body, level);
}

function runGame(plans, Display) {
	function startLevel(n) {
		runLevel(new Level(plans[n]), Display);
	}
	startLevel(0);
}
