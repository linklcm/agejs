function AgeJS() {

	if (arguments.callee.instance != null) {
		return arguments.callee.instance;
	} else {
		arguments.callee.instance = this;
	}
	
    canvas = document.createElement('canvas');
    /**
     * Define uma classe css para deixar o canvas full page.
     */
	createClass('full-page', 'position: fixed; top: 0; left: 0; right: 0; bottom: 0;');
	canvas.className = 'full-page';
	
	this.resize = function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	
	window.onresize = this.resize;
	this.resize();
    
    var context = canvas.getContext('2d');
    
    var keyboard = new Keyboard();
    document.addEventListener('keydown', keyboard.keyPressed, false);
    document.addEventListener('keyup', keyboard.keyReleased, false);
    
    var mouse = new Mouse();
    canvas.addEventListener('mousedown', mouse.mousePressed, false);
    canvas.addEventListener('mouseup', mouse.mouseReleased, false);
    canvas.addEventListener('mousemove', mouse.mouseMoved, false);
	canvas.addEventListener('mouseleave', mouse.mouseLeave, false);
	canvas.addEventListener('mouseenter', mouse.mouseEnter, false);
    
    var loader = new Loader();
    
    var scenes = new HashTable();
	this.rootScene = new Scene();
	scenes.addItem('ROOT_SCENE', this.rootScene);
    var currentScene = this.rootScene;
    var nextScene = null;
    
	var lastUpdate;    
    var fps;
	var showFPS = false;
	this.drawWireFrame = false;
	
	var loaded = false;
	
	var lastInstanceId = 0;
	var running = false;
	
	this.enableShowFPS = function() {
		showFPS = true;
		fps = new FramePerSecond();
	}
	
	this.disableShowFPS = function() {
		showFPS = false;
		fps = null;
	}

	this.run = function() {
		document.body.appendChild(canvas);		
				
		if (currentScene == null) {
			throw new Error('Initial Scene undefined');
        } else {
			loaded = false;
			currentScene.load();
		}

		lastUpdate = new Date().getTime();
		
		running = true;
		update();		
	}
	
	this.stop = function() {		
		running = false;
	}
	
	function update() {		
		var currentTime = new Date().getTime();
		timeElapsed = currentTime - lastUpdate;
		lastUpdate = currentTime;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		if (loaded) {
			if (typeof currentScene.step === "function")
				currentScene.step(timeElapsed);			
		
			if (typeof currentScene.draw === "function")
				currentScene.draw(context);
		}
		
		if (showFPS) drawFPS();
		
		if (nextScene != null) {            
            nextScene.load();

            currentScene = nextScene;
            nextScene = null;
        }
        if (running) {
        	requestId = window.requestAnimationFrame(update);
        }
	}

	function drawFPS() {
		context.fillStyle = 'green';
		context.fillText('FPS: ' + fps.getFPS(), canvas.width - 50, 10);
	}
	
	this.loaded = function() {
		loaded = true;
		currentScene.loaded();
	}
	
	this.addScene = function(id, scene) {
		if (scene instanceof Scene) {
			scenes.addItem(id, scene);
			if (typeof scene.load === "function")
				scene.load();			
		} else {
			throw new Error('Only accepts Scene object');
		}
	}
	
	this.removeScene = function(id) {
		var scene = scenes.removeItem(id);
		if (typeof scene.unload === "function")
			scene.unload();		
	}
	
	this.getCurrentScene = function() {
        return currentScene;
    }

	this.setStartingScene = function(id) {
        currentScene = scenes.getItem(id);
    }
	
	this.setNextScene = function(id) {
		nextScene = scenes.getItem(id);
    }
	
	this.getKeyboard = function() {
		return keyboard;
	}
	
	this.getMouse = function() {
		return mouse;
	}
	
	this.getCanvas = function() {
		return canvas;
	}

	function createClass(name, rules) {
		name = '.' + name;
		var style = document.createElement('style');
		style.type = 'text/css';
		document.getElementsByTagName('head')[0].appendChild(style);
		if(!(style.sheet||{}).insertRule) 
			(style.styleSheet || style.sheet).addRule(name, rules);
		else style.sheet.insertRule(name+"{"+rules+"}",0);
	}
	
	this.nextInstanceId = function() {
		return lastInstanceId++;
	}
}

AgeJS.getInstance = function() {
    if (AgeJS.instance == null) AgeJS.instance = new AgeJS();        
    return AgeJS.instance;
}

function Mouse() {
	
    var x = 0;
    var y = 0;
	var worldX = 0;
	var worldY = 0;
    var leftButtonPressed = false;
    var middleButtonPressed = false;
    var rightButtonPressed = false;
	var insideCanvas = false;
	
	var buttonPressed = null;
	
	this.isLeftButtonPressed = function() {
        return leftButtonPressed;
    }

    this.isMiddleButtonPressed = function() {
        return middleButtonPressed;
    }

    this.isRightButtonPressed = function() {
        return rightButtonPressed;
    }
	
	this.isInsideCanvas = function() {
        return insideCanvas;
    }
	
	this.mousePressed = function(e) {
		buttonPressed = e.which;
        switch(buttonPressed) {
            case 1:
                leftButtonPressed = true;
                break;
            case 2:
                middleButtonPressed = true;
                break;
            case 3:
                rightButtonPressed = true;
                break;
        }
    }
	
	this.mouseReleased = function(e) {
		buttonPressed = null;
        switch(e.which) {
            case 1:
                leftButtonPressed = false;
                break;
            case 2:
                middleButtonPressed = false;
                break;
            case 3:
                rightButtonPressed = false;				
                break;
        }
    }
	
	this.mouseMoved = function(e) {
        x = e.clientX;
        y = e.clientY;
    }
	
	this.mouseLeave = function(e) {
		insideCanvas = false;
	};
        
    this.mouseEnter = function(e) {
		insideCanvas = true;
	};
	
	this.getScreenPos = function() {
		return new Point(x,y);
	}
	
	this.getWorldPos = function() {
		return new Point(worldX, worldY);
	}
	
	this.setWorldPos = function(p) {
		worldX = p.x;
		worldY = p.y;
	}
		
	this.getX = function() {
		return x;
	}
	
	this.getY = function() {
		return y;
	}
	
	this.getButtonPressed = function() {
		return buttonPressed;
	}
}

function Keyboard() {
	
	var keysPressed = [];

	this.keyDown = function(keyCode) {
		return keysPressed.indexOf(keyCode) > -1;
	};
	
	this.keyPressed = function(event) {		
        if(keysPressed.indexOf(event.keyCode) === -1) {
        	keysPressed.push(event.keyCode);
        }
    }
	
	this.keyReleased = function(event) {
        keysPressed.pop(event.keyCode);
    }
	
	this.getKeysPressed = function() {
		return keysPressed;
	}
}

var Keys = {
	UP:       38,
	LEFT:     37,
	RIGHT:    39,
	DOWN:     40,
	ESCAPE:   27,
	SPACE:    32,
	ENTER:    10,
	BACKSPACE: 8,
    TAB:       9,
    RETURN:   13,
    PAGEUP:   33,
    PAGEDOWN: 34,
    END:      35,
    HOME:     36,    
    INSERT:   45,
    DELETE:   46,
    ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
    A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90
}

function Loader() {
	
	if (arguments.callee.instance != null) {
		return arguments.callee.instance;
	} else {
		arguments.callee.instance = this;
	}
	
	var mp3Support = false;
	var oggSupport = false;
    var audio = document.createElement('audio');
    
	if (audio.canPlayType) { 
  		mp3Support = "" != audio.canPlayType('audio/mpeg');
  		oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');
	}

    // Check for ogg, then mp3, and finally set soundFileExtn to undefined
    var soundFileExtension = oggSupport?".ogg":mp3Support?".mp3":undefined;        
    
    this.loaded = true;
    var loadedCount = 0; // Assets that have been loaded so far
    var totalCount = 0; // Total number of assets that need to be loaded
    
    this.loadImage = function(url){
        totalCount++;
        this.loaded = false;        
        var image = new Image();
        image.src = url;
        image.onload = itemLoaded;
        return image;
    }    
    
    this.loadSound = function(url){
        this.totalCount++;
        this.loaded = false;
        var audio = new Audio();
        audio.src = url + soundFileExtension;
		audio.addEventListener("canplaythrough", itemLoaded, false);
        return audio;   
    }
    
    function itemLoaded() {
        loadedCount++;
        if (loadedCount === totalCount){
            loaded = true;
			AgeJS.getInstance().loaded();
        }
    }
}

Loader.getInstance = function() {
    if (Loader.instance == null) Loader.instance = new Loader();        
    return Loader.instance;
}

function HashTable(obj){
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }

    this.addItem = function(key, value)
    {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        }
        else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    }

    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    }

    this.hasItem = function(key){
        return this.items.hasOwnProperty(key);
    }
   
    this.removeItem = function(key) {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        }
        else {
            return undefined;
        }
    }

    this.keys = function() {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    this.values = function() {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    }

    this.each = function(fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    }

    this.clear = function() {
        this.items = {}
        this.length = 0;
    }
	
	this.isEmpty = function() {
        return this.items.length == 0;
    }
}

function FramePerSecond() {
	
	this.startTime = 0;
	this.frameNumber = 0;
   
	this.getFPS = function() {
		this.frameNumber++;
		var currentDate = new Date().getTime(),
		currentTime = (currentDate - this.startTime) / 1000;
		var fps = Math.floor(this.frameNumber / currentTime);
		if(currentTime > 1 ){
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}
		return fps;
	}
}

function Scene() {
	
	var children = [];	
	this.bgFileName = null;
	this.bgImage = null;
	this.bgColor = null;
	this.bgSoundFileName = null;
	this.bgSound = null;	
		
	this.map = null;
	
	this.addChild = function(child) {
		if (child instanceof GameObject) {			
			children.push(child);			
		} else {
			throw new Error('Only accepts GameObject object');
		}
	}
	
	this.removeChild = function(child) {				
		for (var i = 0; i < children.length; i++)
			if (children[i].instanceId == child.instanceId)
				children.splice(i, 1);
	}
	
	this.getChildren = function(child) {
		if (child instanceof GameObject) {
			children.push(child);			
		} else {
			throw new Error('Only accepts GameObject object');
		}
	}
	
    this.load = function() {
		
		var loader = Loader.getInstance();
		
		if (this.bgSoundFileName) this.bgSound = loader.loadSound(this.bgSoundFileName);
			
		if (this.bgFileName) this.bgImage = loader.loadImage(this.bgFileName);
		
		if (this.map) this.map.load();
		
		for(var i = 0; i < children.length; i++)
			children[i].load();
    }
	
	this.loaded = function() {		
		if (this.map) this.map.loaded();
		
		for(var i = 0; i < children.length; i++)
			children[i].loaded();
		
		if (this.bgSound) {
			this.bgSound.loop = true;
			this.bgSound.play();
		}
    }    
    
    this.step = function(timeElapsed) {		
		
		if (this.map) this.map.step(timeElapsed);
		
		var mouse = AgeJS.getInstance().getMouse();
		var p = (this.map) ? mouse.getWorldPos() : mouse.getScreenPos();
				
		for(var i = 0; i < children.length; i++) {
			var child = children[i];			
			var onCollision = child.getEventListeners().getItem(Event.ON_COLLISION);
			if (onCollision) {
				var collisions = [];
				// check collision with map only if scene has
				if (this.map) {
					for(var j = 0; j < this.map.collisionLayer.length; j++) {
						var collision = this.map.collisionLayer[j];										
						if (child.intersectsWith(collision)) {							
							collisions.push(collision);
						
							collision.color = "#FF0000";
							child.color = "#FF0000";						
						} else {
							collision.color = "#yellow";
							child.color = "#yellow";
						}
					}
				}
				
				// check collision with other children				
				for(var j = 0; j < children.length; j++) {
					var collision = children[j];
					if (collision instanceof CollisionObject) {
						if (!child.equals(collision) && child.intersectsWith(collision))
							collisions.push(collision);
					}
				}		
				if (collisions.length > 0) onCollision.call(child, collisions);
			}
						
			var onMouseClick = child.getEventListeners().getItem(Event.ON_MOUSE_CLICK);			
					
			
			if (mouse.getButtonPressed() && onMouseClick && child.hitBox(p)) onMouseClick.call(child, mouse.getButtonPressed());
			
			child.step(timeElapsed);
		}
	}
	
    this.draw = function(context) {
		
		if (this.bgColor) {
			context.save();
			var canvas = AgeJS.getInstance().getCanvas();
			context.beginPath();
			context.rect(0, 0, canvas.width, canvas.height);
			context.rect(0, 50, 200, 100);
			context.fillStyle = this.bgColor;
			context.fill();
			context.restore();
		}
		
		if (this.bgImage != null)			
			context.drawImage(
				this.backgroundImage,
				0,
				0
			);
		
		var scrollX = 0;
		var scrollY = 0;
		if (this.map) {
			this.map.draw(context);
			scrollX = this.map.scroll.x;
			scrollY = this.map.scroll.y;
		}
				
	    var sortedItems = [];
		var labels = [];
		
		for(var i = 0; i < children.length; i++) {
			var child = children[i];			
			if (child instanceof Label) labels.push(child);
			else sortedItems.push(child);
		}		
		
		if (this.map) sortedItems = this.map.visibleBuildings.concat(sortedItems);
		
		// Sort game items into a sortedItems array based on their x,y coordinates
	   	sortedItems.sort(function(a,b) {
	        return a.y-b.y + ((a.y==b.y)?(b.x-a.x):0);		
	   	});
		
		var drawWireFrame = AgeJS.getInstance().drawWireFrame;
		
		for(var i = 0; i < sortedItems.length; i++) {
			var item = sortedItems[i];
			var x = item.drawX - scrollX;
			var y = item.drawY - scrollY;
			item.draw(context, x, y);
			if (drawWireFrame && item instanceof CollisionObject) {
				x = item.x - scrollX;
				y = item.y - scrollY;
				item.drawWireFrame(context, x, y);
			}
		}
		
		for(var i = 0; i < labels.length; i++) {
			labels[i].draw(context);			
		}		
    }
}

function GameObject() {
	
	this.instanceId = AgeJS.getInstance().nextInstanceId();	
	
	this.x = 0;
	this.y = 0;
	
	this.visible = true;
	
	var eventListeners = new HashTable();
	
	this.addEventListener = function(event, action) {
		if (typeof action === "function")
			eventListeners.addItem(event, action);
		else throw new Error('Only accepts function as action');
	}
	
	this.removeEventListener = function(event) {
		return eventListeners.removeItem(event);
	}
	
	this.getEventListeners = function() {
		return eventListeners;
	}	
}

GameObject.prototype.load = function() {}
	
GameObject.prototype.loaded = function() {}
	
GameObject.prototype.draw = function(context, x, y) { }

GameObject.prototype.step = function(timeElapsed) {
	var enterFrame = this.getEventListeners().getItem(Event.ENTER_FRAME);
	
	if (enterFrame != null) enterFrame.call(this, timeElapsed);
	
	var m = AgeJS.getInstance().getMouse();
        
	if (m.isRightButtonPressed()) {
		onRightButtonPressed = this.getEventListeners().getItem(Event.ON_RIGHT_BUTTON_PRESSED);
		if (onRightButtonPressed != null) 
			onRightButtonPressed.call(this, timeElapsed, m.getX(), m.getY());
	}	
}

GameObject.prototype.equals = function (other) {
    return this.instanceId === other.instanceId;
};

GameObject.prototype.hitBox = function(p) {return false}

function Label(text, x, y) {
	GameObject.call(this);
	
	this.text = text;
	this.x = x;
	this.y = y;
	this.font = "Arial";
	this.size = 10;
	this.color = 'black';

    this.draw = function(context, x, y) {
		//console.log(this.text);
		x = typeof x !== 'undefined' ? x : this.x;
		y = typeof y !== 'undefined' ? y : this.y;
		
		context.save();
		
		context.font = this.size + "px " + this.font;
		context.fillStyle = this.color;
		context.fillText(this.text, x, y);
		
		context.restore();
    }
}

Label.prototype = Object.create(GameObject.prototype);

function Sprite(fileName, width, height) {
	
	GameObject.call(this);
	
	this.fileName = fileName;
	
	this.width = width;
	this.height = height;
	
	this.image = null;
		
	var index = -1;
	this.frames = 0;
	this.currentFrame = 0;
	var offsetX = 0;
	var offsetY = 0;
	
	this.animateStrategy = new FrameBased();
	this.direction = 0;
	
	this.load = function() {
		this.image = Loader.getInstance().loadImage(this.fileName);		
    }
	
	this.step = function(timeElapsed) {		
		
		if (this.animateStrategy.isProcessNextFrame(timeElapsed))
			this.processNextFrame();
	}
	
	this.processNextFrame = function() {
		if (this.frames instanceof Array) {
			if (index >= this.frames.length - 1) index = 0;
			else index++;
			this.currentFrame = this.frames[index];
		} else this.currentFrame = this.frames;
		
		offsetX = this.currentFrame * this.width;
		offsetY = this.direction * this.height;		
	}

    this.draw = function(context, x, y) {
		x = typeof x !== 'undefined' ? x : this.x;
		y = typeof y !== 'undefined' ? y : this.y;
			
		context.drawImage(
			this.image,
			offsetX, //The x coordinate where to start clipping 
			offsetY, //The y coordinate where to start clipping
			this.width, //The width of the clipped image
			this.height, //The height of the clipped image
			x, //The x coordinate where to place the image on the canvas 
			y, //The y coordinate where to place the image on the canvas
			this.width,
			this.height
		);		
    }	
		
    this.clone = function() {
        return new Sprite(this.fileName, this.width, this.height);
    }
}

Sprite.prototype = Object.create(GameObject.prototype);

function AnimateStrategy() {
	this.isProcessNextFrame = function(timeElapsed) { }
}

function FrameBased() {
	
	AnimateStrategy.call(this);
	
	this.isProcessNextFrame = function() {		
		return true;
	}
}

FrameBased.prototype = Object.create(AnimateStrategy.prototype);

function TimeBased(duration) {
	
	AnimateStrategy.call(this);
	
	this.duration = duration;
	var timeElapsedFrame = 0;	
	
	this.isProcessNextFrame = function(timeElapsed) {
		if (this.duration > 0) {
			if (timeElapsedFrame > this.duration) {			
				timeElapsedFrame -= this.duration;
				return true;
			} else timeElapsedFrame += timeElapsed;
		}
		
		return false;		
	}
}

TimeBased.prototype = Object.create(AnimateStrategy.prototype);

function CollisionObject(x, y, width, height) {
	
	GameObject.call(this);
	
	this.x = x;
	this.y = y;
	
	this.width = width;
	this.height = height;
	
	this.baseHeight = width/2;    
	this.halfBaseHeight = this.baseHeight/2;
	
	/*
	*  Point x and y values should be relative to the center.
	*/
	this.addPoint = function(p) {
		this.points.push(p);
	}
	
	this.points = [];
	this.addPoint(new Point(-this.baseHeight, 0));
	this.addPoint(new Point(0, this.halfBaseHeight));
	this.addPoint(new Point(this.baseHeight, 0));
	this.addPoint(new Point(0, -this.halfBaseHeight));
	
	this.wireFrameColor = 'yellow';
	
	this.drawWireFrame = function(context, x, y) {
	
		x = typeof x !== 'undefined' ? x : this.drawX;
		y = typeof y !== 'undefined' ? y : this.drawY;

		context.save();

		// draw polygon
		context.fillStyle = this.wireFrameColor;
		context.beginPath();
		context.moveTo(this.points[0].x + x, this.points[0].y + y);
		for (var i = 1; i < this.points.length; i++) {
			context.lineTo(this.points[i].x + x, this.points[i].y + y);
		}
		context.closePath();
		context.strokeStyle = this.wireFrameColor;
		context.stroke();
		
		// draw center		
		context.beginPath();
		context.arc(x, y, 2, 0, 2 * Math.PI);
		context.closePath();
		context.fillStyle = this.wireFrameColor;
		context.fill();	

		context.restore();
	}
	
	/*
	* Returns the number of sides. Equal to the number of vertices.
	*/
	this.getNumberOfSides = function() {
		return this.points.length;
	}
	
	/*
	*  To detect intersection with another Polygon object, this
	*  function uses the Separating Axis Theorem. It returns false
	*  if there is no intersection, or an object if there is. The object
	*  contains 2 fields, overlap and axis. Moving the polygon by overlap
	*  on axis will get the polygons out of intersection.
	*/
	this.intersectsWith = function(other) {
    	
		var axis = new Point();
		var tmp, minA, maxA, minB, maxB;
		var side, i;
		var smallest = null;
		var overlap = 99999999;

		/* test polygon A's sides */
		for (side = 0; side < this.getNumberOfSides(); side++) {
			/* get the axis that we will project onto */
			if (side == 0) {
				axis.x = this.points[this.getNumberOfSides() - 1].y - this.points[0].y;
				axis.y = this.points[0].x - this.points[this.getNumberOfSides() - 1].x;
			} else {
				axis.x = this.points[side - 1].y - this.points[side].y;
				axis.y = this.points[side].x - this.points[side - 1].x;
			}

			/* normalize the axis */
			tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
			axis.x /= tmp;
			axis.y /= tmp;

			/* project polygon A onto axis to determine the min/max */
			minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
			for (i = 1; i < this.getNumberOfSides(); i++) {
				tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
				if (tmp > maxA) maxA = tmp;
				else if (tmp < minA) minA = tmp;
			}
			/* correct for offset */
			tmp = this.x * axis.x + this.y * axis.y;
			minA += tmp;
			maxA += tmp;

			/* project polygon B onto axis to determine the min/max */
			minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
			for (i = 1; i < other.getNumberOfSides(); i++) {
				tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
				if (tmp > maxB) maxB = tmp;
				else if (tmp < minB) minB = tmp;
			}
			/* correct for offset */
			tmp = other.x * axis.x + other.y * axis.y;
			minB += tmp;
			maxB += tmp;

			/* test if lines intersect, if not, return false */
			if (maxA < minB || minA > maxB) {
				return false;
			} else {
				var o = (maxA > maxB ? maxB - minA : maxA - minB);
				if (o < overlap) {
					overlap = o;
					smallest = {x: axis.x, y: axis.y};
				}
			}
		}

		/* test polygon B's sides */
		for (side = 0; side < other.getNumberOfSides(); side++) {
			/* get the axis that we will project onto */
			if (side == 0) {
				axis.x = other.points[other.getNumberOfSides() - 1].y - other.points[0].y;
				axis.y = other.points[0].x - other.points[other.getNumberOfSides() - 1].x;
			} else {
				axis.x = other.points[side - 1].y - other.points[side].y;
				axis.y = other.points[side].x - other.points[side - 1].x;
			}

			/* normalize the axis */
			tmp = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
			axis.x /= tmp;
			axis.y /= tmp;

			/* project polygon A onto axis to determine the min/max */
			minA = maxA = this.points[0].x * axis.x + this.points[0].y * axis.y;
			for (i = 1; i < this.getNumberOfSides(); i++) {
				tmp = this.points[i].x * axis.x + this.points[i].y * axis.y;
				if (tmp > maxA) maxA = tmp;
				else if (tmp < minA) minA = tmp;
			}
    	
			/* correct for offset */
			tmp = this.x * axis.x + this.y * axis.y;
			minA += tmp;
			maxA += tmp;

			/* project polygon B onto axis to determine the min/max */
			minB = maxB = other.points[0].x * axis.x + other.points[0].y * axis.y;
			for (i = 1; i < other.getNumberOfSides(); i++) {
				tmp = other.points[i].x * axis.x + other.points[i].y * axis.y;
				if (tmp > maxB) maxB = tmp;
				else if (tmp < minB) minB = tmp;
			}
    	
			/* correct for offset */
			tmp = other.x * axis.x + other.y * axis.y;
			minB += tmp;
			maxB += tmp;

			/* test if lines intersect, if not, return false */
			if (maxA < minB || minA > maxB) {
				return false;
			} else {
				var o = (maxA > maxB ? maxB - minA : maxA - minB);
				if (o < overlap) {
					overlap = o;
					smallest = {x: axis.x, y: axis.y};
				}
			}
		}

		return {"overlap": overlap + 0.001, "axis": smallest};	
	}

	this.cloneCollisionObject = function() {
		return new CollisionObject(this.x, this.y, this.width, this.height);
	}
}	

CollisionObject.prototype = Object.create(GameObject.prototype);

function EntityObject(x, y, width, height, baseOffset) {

	CollisionObject.call(this, x, y, width, height);
	
	this.drawX = x - width/2;
	this.drawY = y - height/2;
		
	this.sprite;
	this.baseOffset = baseOffset;
	
	var states = new HashTable();
	var currentState = null;
    var nextState = null;
	
	var sounds = new HashTable();	
	
	this.load = function() {
		if (this.sprite) this.sprite.load();
		
		if (!sounds.isEmpty()) {
			var loadedSounds = new HashTable();
			var loader = Loader.getInstance();
			sounds.each(function (soundName, url){
				loadedSounds.addItem(soundName, loader.loadSound(url));
			});
			sounds = loadedSounds;
		}
	}
	
	this.step = function(timeElapsed) {	
		
		CollisionObject.prototype.step.call(this, timeElapsed);
	
		if (nextState != null) {
			currentState = nextState;
			nextState = null;
			this.sprite.frames = states.getItem(currentState);
        }
	
		this.drawX = this.x - this.sprite.width / 2;
		this.drawY = this.y - (this.sprite.height - this.baseOffset);
	
		if (this.sprite) this.sprite.step(timeElapsed);
	}
	
	this.draw = function(context, x, y) {
		x = typeof x !== 'undefined' ? x : this.x;
		y = typeof y !== 'undefined' ? y : this.y;
		if (this.sprite) this.sprite.draw(context, x, y);
	}	
	
	this.addState = function(state, frames) {
		states.addItem(state, frames);		
	}
	
	this.removeState = function(state) {
		states.removeItem(state);
	}
	
	this.getCurrentState = function() {
		return currentState;	
	}
	
	this.setNextState = function(state) {
		nextState = state;
    }
	
	this.setStartingState = function(state) {
		currentState = state;
		this.sprite.frames = states.getItem(currentState);
    }
	
	this.addSound = function(soundName, url) {
		sounds.addItem(soundName, url);
	}
	
	this.removeSound = function(soundName) {
		sounds.removeItem(soundName);
	}
	
	this.playSound = function(soundName){
		var sound = sounds.getItem(soundName);		
		if (sound) sound.play();		
	}
	
	this.pauseSound = function(soundName){
		var sound = sounds.getItem(soundName);		
		if (sound) sound.pause();
	}
	
	this.hitBox = function(p) {		
		return (
			(p.x >= this.x - width / 2 && p.x <= this.x + width / 2) &&
			(p.y >= this.y - (height - baseOffset) && p.y <= this.y)
		);
	}
}

EntityObject.prototype = Object.create(CollisionObject.prototype);

var Event = {
	ENTER_FRAME: 0,
	ON_COLLISION: 1,
	ON_MOUSE_CLICK: 2
}

function MappedTile(x, y, width, height, passable) {
	
	// move x and y for center of tile
	CollisionObject.call(this, x + width/2, y + height/2, width, height);
	
	// keep x and y as draw coordinate
	this.drawX = x;
	this.drawY = y;

	this.passable = passable !== 'undefined' ? Boolean(passable) : true;
}

MappedTile.prototype = Object.create(CollisionObject.prototype);

function Terrain(referenceId, x, y, width, height, passable, texture) {
	
	MappedTile.call(this, x, y, width, height, passable);	
	
	this.referenceId = referenceId;	
	this.texture = texture;
	
	this.draw = function(context, x, y) {
		x = typeof x !== 'undefined' ? x : this.drawX;
		y = typeof y !== 'undefined' ? y : this.drawY;		
		context.drawImage(this.texture,
			x,
			y,
			this.texture.width,
			this.texture.height
		);		
	}
}

Terrain.prototype = Object.create(MappedTile.prototype);

function Building(referenceId, x, y, width, height, tileWidth, tileHeight, sprite, passable) {
	
	MappedTile.call(this, x, y, width, height, passable);
	
	this.instanceId = AgeJS.getInstance().nextInstanceId();
	
	this.referenceId = referenceId;	

	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	
	this.drawX = x - ((sprite.width / 2) - (this.width/2));
	this.drawY = y - (sprite.height - height);
	
	this.sprite = sprite;	
}

Building.prototype = Object.create(MappedTile.prototype);

Building.prototype.draw = function(context, x, y) {
	x = typeof x !== 'undefined' ? x : this.drawX;
	y = typeof y !== 'undefined' ? y : this.drawY;
	this.sprite.draw(context, x, y);	
}

var BuildingPortion = function(buildingInstanceId, x, y, width, height, gridCol, gridRow, passable) {
	
	MappedTile.call(this, x, y, width, height, passable);
	
	this.buildingInstanceId = buildingInstanceId;
	this.gridCol = gridCol;
	this.gridRow = gridRow;
}

BuildingPortion.prototype = Object.create(MappedTile.prototype);

function Map(tileMap, tiles, tileWidth, tileHeight) {
		
	this.tileMap = tileMap;
	this.tiles = tiles;
	
	this.tileLayer = [];
	this.buildings = [];
	this.visibleBuildings = [];
	this.collisionLayer = [];	
	
	this.grid = new Grid(tileMap.length, tileMap[0].length);
	
	this.width = tileWidth * this.grid.rows;
	this.height = tileHeight * this.grid.cols;
	
	this.scroll = new Scroll(10, 0, 0);
	
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	
	this.halfTileWidth = tileWidth / 2;
	this.halfTileHeight = tileHeight / 2;
}

Map.prototype.load = function() {	
	for (var i = 0; i < this.tiles.length; i++) {
		var fileName = this.tiles[i].fileName;
		this.tiles[i].image = Loader.getInstance().loadImage(fileName);
	}
}
	
Map.prototype.loaded = function() {
	this.initializeMap();
}

Map.prototype.initializeMap = function() {
	var halfMapWidth = this.width / 2;
	for (var col = 0; col < this.grid.cols; col++) {
		this.tileLayer[col] = [];
		for (var row = 0; row < this.grid.rows; row++) {
			var tilePositionX = (row - col) * this.tileHeight;
			// Center the grid horizontally
			tilePositionX += (halfMapWidth - this.halfTileWidth);
				
			var tilePositionY = (row + col) * this.halfTileHeight;
				
			var referenceId = this.tileMap[col][row];
			
			var filteredTiles = this.tiles.filter(function(obj) {		
				if ('referenceId' in obj && obj.referenceId === referenceId) return true;
				else return false;
			});
								
			if (filteredTiles.length === 0)
				throw new Error('No matching with tile reference id ' + referenceId);
			else if (filteredTiles.length > 1)
				throw new Error('More than one matching with tile reference id ' + referenceId);
				
			var tile = filteredTiles[0];
			if (tile.type==='terrain') {
				this.tileLayer[col][row] = new Terrain(referenceId, tilePositionX, tilePositionY, this.tileWidth,
					this.tileHeight, tile.passable, tile.image);
			} else {
				var sprite = new Sprite(tile.fileName, tile.pixelWidth, tile.pixelHeight);
				sprite.frames = tile.frames;
				sprite.image = tile.image;
				var passable = tile.passableGrid[tile.tileHeight - 1][tile.tileWidth - 1];
				var building = new Building(tile.referenceId, tilePositionX, tilePositionY, this.tileWidth, this.tileHeight,
					tile.tileWidth, tile.tileHeight, sprite, passable);
				this.placeBuilding(building, row, col, tile.passableGrid);
			}
		}
	}
		
	for (var col = 0; col < this.grid.cols; col++) {			
		for (var row = 0; row < this.grid.rows; row++) {				
			var mappedTile = this.tileLayer[col][row];
			if (!mappedTile.passable)
				this.collisionLayer.push(mappedTile);				
		}
	}
}

Map.prototype.step = function(timeElapsed) {
			
	var mouse = AgeJS.getInstance().getMouse();
	var mousePos = mouse.getScreenPos();
	var worldPos = new Point(mousePos.x + this.scroll.x, mousePos.y + this.scroll.y);
	mouse.setWorldPos(worldPos);
	
	this.scroll.handlePanning();
}
	
Map.prototype.draw = function(context) {
	
	var engine = AgeJS.getInstance();
	
	var canvas = engine.getCanvas();
	var x = canvas.width;
	var y = 0;
	var mapPosition = this.screenToIso({x, y});		
	var topRightCorner = this.getGridCoordinate(mapPosition);
		
	x = 0;
	y = canvas.height;
	mapPosition = this.screenToIso({x, y});
	var bottomLeftCorner = this.getGridCoordinate(mapPosition);
		
	var startRow = topRightCorner.row - 1;
	var startCol = topRightCorner.col;		
	var colCount = bottomLeftCorner.col < this.grid.cols ? bottomLeftCorner.col + 1 : this.grid.cols;
				
	var rowCount = startRow + 3;
	this.visibleBuildings = [];
	for (var col = startCol; col < colCount; col++) {			
		for (var row = startRow; row < rowCount; row++) {
			if (col >= 0 && row >= 0) {					
				var mappedTile = this.tileLayer[col][row];
				if (mappedTile != null) {					
					
					if (mappedTile instanceof Terrain) {
						x = mappedTile.drawX - this.scroll.x;
						y = mappedTile.drawY - this.scroll.y;
						mappedTile.draw(context, x, y);						
					} else if (mappedTile instanceof Building)
						this.visibleBuildings.push(mappedTile);
					
					if (engine.drawWireFrame) {
						x = mappedTile.x - this.scroll.x;
						y = mappedTile.y - this.scroll.y;
						mappedTile.drawWireFrame(context, x, y);
					}
				}
			}
		}
		startRow--;
		rowCount++;
	}
}

Map.prototype.placeBuilding = function (building, row, col, passableGrid) {		
	var pcol = 0;		
	for (var i = col - (building.tileWidth - 1); i <= col; i++, pcol++) {
		var prow = 0;
		for (var j = row - (building.tileHeight - 1); j <= row; j++, prow++) {								
			if (i == col && j == row) {
				this.tileLayer[i][j] = building;
			} else {
				var passable = passableGrid[pcol][prow];
				var tile = this.tileLayer[i][j];
				// drawX and drawY because x and y is center of tile
				this.tileLayer[i][j] = new BuildingPortion(building.instanceId, tile.drawX, 
					tile.drawY, tile.width, tile.height, pcol, prow, passable);
			}
		}
	}
	this.buildings.push(building);
}

Map.prototype.twoDToIso = function(twoPosition) {
		
	var gridOffsetX = 0;
	var gridOffsetY = 0;

	// Take into account the offset on the X axis caused by centering the grid horizontally
	gridOffsetX += (this.width / 2) - this.halfTileWidth;
		
	var y = (twoPosition.y - gridOffsetY + this.halfTileHeight) * 2;		
		
	y = (((gridOffsetX + y) - twoPosition.x) / 2);		
					
	var x = ((twoPosition.x + y) - this.tileHeight) - gridOffsetX;
			
	return new Point(x, y);
}
	
Map.prototype.screenToIso = function(screenPosition) {
		
	var mapTwoDPosition = new Point(screenPosition.x + this.scroll.x, screenPosition.y + this.scroll.y);
			
	return this.twoDToIso(mapTwoDPosition);
}
	
Map.prototype.isoToTwoD = function(isoPosition) {
		
	var gridOffsetX = 0;
	var gridOffsetY = 0;

	// Take into account the offset on the X axis caused by centering the grid horizontally
	gridOffsetX += (this.width / 2) - this.halfTileWidth;
		
	var x = isoPosition.x + gridOffsetX + this.tileHeight - isoPosition.y;
		
	var y = (((isoPosition.y * 2) + x - gridOffsetX) / 2) - this.halfTileHeight + gridOffsetY;		
		
	return new Point(x, y);
}
	
Map.prototype.isoToScreen = function(isoPosition) {
	
	var mapTwoDPosition = this.IsoToTwoD(isoPosition);			
	return new Point(mapTwoDPosition.x - this.scroll.x, mapTwoDPosition.y - this.scroll.y);
}
	
Map.prototype.getGridCoordinate = function(isoPosition) {		
	row = Math.round((isoPosition.x - this.halfTileHeight) / this.tileHeight);
	col = Math.round((isoPosition.y - this.halfTileHeight) / this.tileHeight);

	return new Coordinate(col, row);
}

Map.prototype.isWalkable = function(p) {
	var isoPos = this.twoDToIso(p);		
	var coord = map.getGridCoordinate(isoPos);
	var tile = this.tileLayer[coord.col][coord.row];
	return tile.passable;
}

Map.prototype.hitTest = function(o, dx, dy) {
	var clone = o.cloneCollisionObject();
	clone.x += dx;
	clone.y += dy;
	for(var i = 0; i < this.collisionLayer.length; i++)
		if (clone.intersectsWith(this.collisionLayer[i])) return false;
	
	return true;
}

function Scroll(increment, x, y){
	this.increment = increment;
	this.x = x;
	this.y = y;
	this.panningThreshold = 50;
	this.follow = null;
}

Scroll.prototype.handlePanning = function() {
	
	var engine = AgeJS.getInstance();
	var canvas = engine.getCanvas();
	
	if (this.follow) {
		this.x = this.follow.x - canvas.width/2;
		this.y = this.follow.y - canvas.height/2;
	} else {
		var mouse = engine.getMouse();
		// do not pan if mouse leaves the canvas		
		if (!mouse.isInsideCanvas()){
			return;
		}		
		
		var canvas = engine.getCanvas();
		var map = engine.getCurrentScene().map;
		
		if (mouse.getX() <= this.panningThreshold) {
			this.x -= ((this.x - this.increment) >= 0) ? this.increment : 0;
		} else if (mouse.getX() >= canvas.width - this.panningThreshold) {
			this.x += (this.x <= (map.width - canvas.width - this.increment)) ? this.increment : 0;
		}
	
		if (mouse.getY() <= this.panningThreshold) {
			this.y -= ((this.y - this.increment) >= 0) ? this.increment : 0;
		} else if (mouse.getY() >= canvas.height - this.panningThreshold){
			this.y += (this.y <= (map.height - canvas.height - this.increment)) ? this.increment : 0;
		}
	}
}

function Point(x, y) {
	this.x = x;
	this.y = y;	
}

Point.prototype.equals = function (other) {
    return this.x === other.x && this.y === other.y;
};

function Grid(cols, rows) {
	this.cols = cols;
	this.rows = rows;
}

function Coordinate(col, row) {	
	this.col = col;
	this.row = row;
}