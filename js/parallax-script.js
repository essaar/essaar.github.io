//Get reference to Canvas
var canvas = document.getElementById('canvas');

//Get reference to Canvas Context
var context = canvas.getContext('2d');

var load_counter = 0;

//Initialize images for layers
var background = new Image();
var stars1 = new Image();
var stars2 = new Image();
var planet1 = new Image();
var planet2 = new Image();
var planet3 = new Image();
var shadow = new Image();
var mask = new Image();

//Create a list of layer objects
var layer_list = [
	{
		'image': background,
		'src': './images/parallax/background.png',
		'z_index': -3,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': stars1,
		'src': './images/parallax/stars1.png',
		'z_index': -2.5,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': stars2,
		'src': './images/parallax/stars2.png',
		'z_index': -2,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': planet1,
		'src': './images/parallax/planet1.png',
		'z_index': -1.5,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	{
		'image': planet2,
		'src': './images/parallax/planet2.png',
		'z_index': -1,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
    },
	{
		'image': planet3,
		'src': './images/parallax/planet3.png',
		'z_index': -0.5,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	},
	// {
	// 	'image': shadow,
	// 	'src': './images/parallax/shadow.png',
	// 	'z_index': 0,
	// 	'position': {x: 0, y: 0},
	// 	'blend': 'multiply',
	// 	'opacity': 1
	// },
	{
		'image': mask,
		'src': './images/parallax/mask.png',
		'z_index': 1,
		'position': {x: 0, y: 0},
		'blend': null,
		'opacity': 1
	}
];


//Go through the list of layer objects and load images from source
layer_list.forEach(function(layer, index) {
	layer.image.onload = function() {
		load_counter += 1;
		if (load_counter >= layer_list.length) {
			//Start the render Loop
			requestAnimationFrame(drawCanvas);
		}
	}
	layer.image.src = layer.src;
});


//Draw layers in Canvas
function drawCanvas() {		
	//Erase canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    TWEEN.update();
    
    //Canvas rotate
    var rotate_x = (pointer.y * -0.1) + (motion.y * -1.2);
    var rotate_y = (pointer.x * 0.1) + (motion.x * 1.2);
    canvas.style.transform = "rotateX(" + rotate_x + "deg) rotateY(" + rotate_y + "deg)";
    
	//Loop through each layer in the list and draw it to the canvas
	layer_list.forEach(function(layer, index) {
        
        layer.position = getOffset(layer);
        
		if (layer.blend) {
			context.globalCompositeOperation = layer.blend;
		} else {
			context.globalCompositeOperation = 'normal';
		}
		context.globalAlpha = layer.opacity;
		
		context.drawImage(layer.image, layer.position.x, layer.position.y);
	});
	
	//Draw to the canvas at 60 frames per second
	requestAnimationFrame(drawCanvas);
}

function getOffset(layer){
    var touch_offset_factor = 0.3;
    var touch_offset_x = pointer.x * layer.z_index * touch_offset_factor;
    var touch_offset_y = pointer.y * layer.z_index * touch_offset_factor;

    var motion_offset_factor = 2.5;
    var motion_offset_x = motion.x * layer.z_index * motion_offset_factor;
    var motion_offset_y = motion.x * layer.z_index * motion_offset_factor;

    var offset = {
        x: touch_offset_x + motion_offset_x,
        y: touch_offset_y + motion_offset_y
    }

    return offset;
}

////Parallax Controls////

var moving = false;

//Coordinate variables
var pointer_initial = {
    x: 0,
    y: 0
}
var pointer = {
    x: 0,
    y: 0
}

canvas.addEventListener('touchstart', pointerStart);
canvas.addEventListener('mousedown', pointerStart);

function pointerStart(event){
    moving = true;

    if(event.type === 'touchstart'){
        pointer_initial.x = event.touches[0].clientX;
        pointer_initial.y = event.touches[0].clientY;
    } else if(event.type === 'mousedown'){
        pointer_initial.x = event.clientX;
        pointer_initial.y = event.clientY;
    }
}

window.addEventListener('touchmove', pointerMove);
window.addEventListener('mousemove', pointerMove);

function pointerMove(event){
    event.preventDefault();

    if(moving === true){
        var current_x = 0;
        var current_y = 0;

        if(event.type === 'touchmove'){
            current_x = event.touches[0].clientX;
            current_y = event.touches[0].clientY;
        } else if(event.type === 'mousemove'){
            current_x = event.clientX;
            current_y = event.clientY;
        }
        
        pointer.x = current_x - pointer_initial.x;
        pointer.y = current_y - pointer_initial.y;
    }
}

canvas.addEventListener('touchmove', function(event){
    event.preventDefault();
});
canvas.addEventListener('mousemove', function(event){
    event.preventDefault();
});

window.addEventListener('touchend', function(event){
    stopMotion();
});
window.addEventListener('mouseup', function(event){
    stopMotion();
});

function stopMotion(event){
    moving = false;
    
    TWEEN.removeAll();
    var pointer_tween = new TWEEN.Tween(pointer).to({x: 0, y: 0}, 500).easing(TWEEN.Easing.Back.Out).start();
}

////Motion Controls////

var motion_initial = {
    x: null,
    y: null
}
var motion= {
    x: 0,
    y: 0
}

window.addEventListener('deviceorientation', function(event){
    if(!motion_initial.x && !motion_initial.y){
        motion_initial.x = event.beta;
        motion_initial.y = event.gamma;
    }

    //Portrait
    if(window.orientation === 0){
        motion.x = event.gamma - motion_initial.y;
        motion.y = event.beta - motion_initial.x;
    }
    //Landscape left
    if(window.orientation === 90){
        motion.x = event.beta - motion_initial.x;
        motion.y = -event.gamma + motion_initial.y;
    }
    //Landscape right
    if(window.orientation === -90){
        motion.x = -event.beta + motion_initial.x;
        motion.y = event.gamma - motion_initial.y;
    }
    //Upside down
    else{
        motion.x = -event.gamma + motion_initial.y;
        motion.y = -event.beta + motion_initial.x;
    }
});

window.addEventListener('orientationchange', function(event){
    motion_initial.x = 0;
    motion_initial.y = 0;
});

window.addEventListener('touchend', function enableMotion(){
    if(window.DeviceOrientationEvent){
        DeviceOrientationEvent.requestPermission();
    }
});
