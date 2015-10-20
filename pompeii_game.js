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
			//else if (ch == "s")
				//fieldType = "vine";
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

function elmnt(name,className) {
	var elmnt = document.createElement(name);
	if (className) elmnt.className = className;
		return elmnt;
}

function DOMDisplay(parent, level) {
	this.wrap = parent.appendChild(elmnt("div", "game"));
	this.level = level;
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

function runLevel(level, Display) {
	var display = new Display(document.body, level);
}

function runGame(plans, Display) {
	function startLevel(n) {
		runLevel(new Level(plans[n]), Display);
	}
	startLevel(0);
}
