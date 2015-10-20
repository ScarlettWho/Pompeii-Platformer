var activeChars = {
	"@": Player,
	"#": Marco,
	"a": whiteAtfct,
	"A": blackAtfct,
	"h": Hand,
	"M": keyAtfct,
	"V": Boss,
	"N": Enemy,
	"-": brkblWall
};

function Level(blueprint) {
	this.width = blueprint[0].length;
	this.height = blueprint.length;
	this.grid = [];
	this.actors = [];

	for (var y = 0; y < this.height; y++) {
		var line = plan[y], gridLine = [];

		for (var x = 0; x < this.width; x++) {
			var ch = line[x], fieldType = null;
			var Actor = activeChars[ch];

			if (Actor)
				this.actors.push(new Actor(new Vector(x, y), ch));
			else if (ch == "x")
				fieldType = "wall";
			else if (ch == "b")
				fieldType = "bush";
			else if (ch == "s")
				fieldType = "vine";
			else if (ch == "c")
				fieldType = "door";
			gridLine.push(fieldType);
		}
		this.grid.push(gridLine);
	}
	this.player = this.actors.filter(function(actor) {
		return actor.type == "player";
	})[0];
}
