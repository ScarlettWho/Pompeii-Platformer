//  Map out each character class
var activeChars = {
	"@": playerProp,
	"a": bArtifact,		//  black stone will spin or wobble
	"b": Bush
	//"A": wArtifact,		//  white stone will spin or wobble faster than black stone
	//"h": Hand,			//  hands will reach up from the ground and move upand down
	//"N": Enemy,			//  enemies will pace in small areas
	//"#": Friend,		//  Marco will alert player and then join player
	//"V": Boss			//  Boss will move negatively across the level as in a race
};

function Level(blueprint) {
//  'blueprint' refers to the parameters of the level plan as a whole
	this.width = blueprint[0].length; //  this sets the width by grabbing the length of a single row
	this.height = blueprint.length;   //  this sets the height by grabbing the number of total rows
	this.grid = [];					  //  the tiles get stored in an array called 'grid'
	this.actors = [];	// this stores a list of actors to process each frame

	for (var y = 0; y < this.height; y++) {
		var line = blueprint[y], gridLine = [];

		//  this for loop will loo for each element in the plan and assign that element a field type
		for (var x = 0; x < this.width; x++) {
			var ch = line[x], fieldType = null;
			var Actor = activeChars[ch];

			//  This series of statements looks for the specified characters in the level .js and recognizes the classes
			if (Actor)
				this.actors.push(new Actor(new Vector(x,y), ch));  //  Creates a new actor at the grid position
			else if (ch == "x")
				fieldType = "wall";
			else if (ch == "b")
				fieldType = "bush";
			gridLine.push(fieldType);
		}

		//  What does 'push' mean/do?
		this.grid.push(gridLine);
	}

	//  This will find and assign the player character and then assign it to Level.player
	this.player = this.actors.filter(function(actor) {
		return actor.type == "player";
	})[0];
}

//  What does this vector function refer to and control?
function Vector(x, y) {
	this.x = x; this.y = y;
}

//  What does prototype do?
Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function(factor) {
	return new Vector(this.x * factor, this.y * factor);
};

//  This function outlines and controls the properties of the player
function playerProp(pos) {
	this.pos = pos.plus(new Vector(0, -1));
	this.size = new Vector (0.8, 1.5);
	this.speed = new Vector(0,0);
}
playerProp.prototype.type = "player";

//  This will outline and control bArtifact
function bArtifact(pos) {
	this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
	this.size = new Vector(0.6, 0.6);
	this.wobble = Math.random() * Math.PI * 2;
}
bArtifact.prototype.type = "bartifact";

function Bush(pos,ch) {
	this.pos = pos;
	this.size = new Vector(1, 1);
	if (ch == "b") {
		this.speed = new Vector(2, 0);
	}
}

Bush.prototype.type = "bush";

function elmnt(name,className) {
	var elmnt = document.createElement(name);
	if (className) elmnt.className = className;
		return elmnt;
}

function DOMDisplay(parent, level) {
	this.wrap = parent.appendChild(elmnt("div", "game"));  //  Corresponds to the div with "game" class created in the css
	this.level = level;
	this.wrap.appendChild(this.drawBackground());
	this.actorLayer = null;				//  Keeps track of the actors
	this.drawFrame();					//  Updates the world based on the player's position
}

var scale = 20;

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

//  This function will draw the player on the screen
DOMDisplay.prototype.drawActors = function() {
	var wrap = elmnt("div");

	this.level.actors.forEach(function(actor) {
		var rect = wrap.appendChild(elmnt("div", "actor " + actor.type));
		rect.style.width = actor.size.x * scale + "px";
		rect.style.height = actor.size.y * scale + "px";
		rect.style.left = actor.pos.x * scale + "px";
		rect.style.top = actor.pos.y * scale + "px";
	});
	
	return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
	if (this.actorLayer)
		this.wrap.removeChild(this.actorLayer);
	this.actorLayer = this.wrap.appendChild(this.drawActors());
	this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
	var width = this.wrap.clientWidth;
	var height = this.wrap.clientHeight;

	var margin = width / 3;		//  Gives a padding between the player and the screen

	//  Creates the viewport
	var left = this.wrap.scrollLeft, right = left + width;
	var top = this.wrap.scrollTop, bottom = top + height;

	var player = this.level.player;
	var center = player.pos.plus(player.size.times(0.5)).times(scale);

	if (center.x < left + margin)
		this.wrap.scrollLeft = center.x - margin;
	else if (center.x > right - margin)
		this.wrap.scrollLeft = center.x + margin - width;

	if (center.y < top + margin)
		this.wrap.scrollTop = center.y - margin;
	else if (center.y > bottom - margin)
		this.wrap.scrollTop = center.y + margin - height;
};

//  Collision detection
Level.prototype.obstacleAt = function(pos, size) {
	var xStart = Math.floor(pos.x);
	var xEnd = Math.ceil(pos.x + size.x);
	var yStart = Math.floor(pos.y);
	var yEnd = Math.ceil(pos.y + size.y);

	if (xStart < 0 || xEnd > this.width || yStart < 0 || yEnd > this.height)
		return "wall";

	for (var y = yStart; y < yEnd; y++) {
		for (var x = xStart; x < xEnd; x++) {
			var fieldType = this.grid[y][x];
			if (fieldType) return fieldType;
		}
	}
};

//  Actor collision detection
Level.prototype.actorAt = function(actor) {
	for (var i = 0; i < this.actors.length; i++) {
		var other = this.actors[i];

		if (other != actor &&
			actor.pos.x + actor.size.x > other.pos.x &&
			actor.pos.x < other.pos.x + other.size.x &&
			actor.pos.y + actor.size.y > other.pos.y &&
			actor.pos.y < other.pos.y + other.size.y)
			return other;
	}
};

Level.prototype.animate = function(step, keys) {
	while (step > 0) {
		var thisStep = Math.min(step, maxStep);
		this.actors.forEach(function(actor){
			actor.act(thisStep, this, keys);
		}, this);
		step -= thisStep;
	}
};

Bush.prototype.act = function(step, level) {
	var newPos = this.pos.plus(this.speed.times(step));
	if (!level.obstacleAt(newPos, this.size))
		this.pos = newPos;
	else if (this.repeatPos)
		this.pos = this.repeatPos;
	else
		this.speed = this.speed.times(-1);
};

var wobbleSpeed = 8;
var wobbleDist = 0.07;

bArtifact.prototype.act = function(step) {
	this.wobble += step * wobbleSpeed;
	var wobblePos = Math.sin(this.wobble) * wobbleDist;
	this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

var maxStep = 0.05;
var playerXSpeed = 7;

playerProp.prototype.moveX = function(step, level, keys) {
	this.speed.x = 0;
	if (keys.left) this.speed.x -= playerXSpeed;
	if (keys.right) this.speed.x += playerXSpeed;

	var motion = new Vector(this.speed.x * step, 0);
	var newPos = this.pos.plus(motion);
	var obstacle = level.obstacleAt(newPos, this.size);

	if (obstacle != "wall")
		this.pos = newPos;
};

var gravity = 30;
var jumpSpeed = 17;
var playerYSpeed = 7;

playerProp.prototype.moveY = function(step, level, keys) {
	//this.speed.y = 0;
	//if (keys.up) this.speed.y -= playerYSpeed;
	//if (keys.down) this.speed.y += playerYSpeed;
	
	//  Accelerates the player downward always - inacts gravity
	this.speed.y += step * gravity;
	var motion = new Vector(0, this.speed.y * step);
	var newPos = this.pos.plus(motion);
	var obstacle = level.obstacleAt(newPos, this.size);

	//  This will only allow a player to jump if they are touching an obstacle (i.e. the floor)
	if (obstacle) {
		if (keys.up && this.speed.y > 0)
			this.speed.y = -jumpSpeed;
		else
			this.speed.y = 0
	}
	else {
		this.pos = newPos;
	}
};

playerProp.prototype.act = function(step, level, keys) {
	this.moveX(step, level, keys);
	this.moveY(step, level, keys);

	var otherActor = level.actorAt(this);
	if (otherActor)
		level.playerCollide(otherActor.type, otherActor);
};

Level.prototype.playerCollide = function(type, actor) {
	if (type == "bArtifact") {
		this.actors = this.actors.filter(function(other) {
			return other != actor;
		});
	}
};

var arrowCodes = {37: "left", 38: "up", 39: "right"};

function trackKeys(codes) {
	var pressed = Object.create(null);

	function handler(event) {
		if (codes.hasOwnProperty(event.keyCode)) {
			var down = event.type == "keydown";
			pressed[codes[event.keyCode]] = down;
			event.preventDefault();
		}
	}

	addEventListener("keydown", handler);
	addEventListener("keyup", handler);
	return pressed;
}

function runAnimation(frameFunc) {
	var lastTime = null;
	function frame(time) {
		var stop = false;
		if (lastTime != null) {
			var timeStep = Math.min(time - lastTime, 100) / 1000;
			stop = frameFunc(timeStep) === false;
		}

		lastTime = time;
		if (!stop)
			requestAnimationFrame(frame);
	}

	requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);

function runLevel(level, Display) {
	var display = new Display(document.body, level);

	runAnimation(function(step) {
		level.animate(step, arrows);
		display.drawFrame(step);
	});
}

function runGame(plans, Display) {
	function startLevel(n) {
		runLevel(new Level(plans[n]), Display);
	}
	startLevel(0);
}
