import "./style.scss";

import * as THREE from 'three';
import { loadGlbAsync } from "./classes/helpers";
import Scene from './controller/Scene.js';
import { colorMaterials } from './helpers/materials.js';
import { directionCubes, getCube } from './helpers/objects.js';




let scene = new Scene();
window.scene = scene;

scene.time.timePassing = true;
scene.time.set(4, 10);
scene.gameTick.doGameTick = true;
scene.doLogging = false;

window.manualTick = false;


setInterval(()=>{
	let time = scene.time.getTimePassed();
	document.querySelector('#ui .time .year').innerHTML = time.years;
	document.querySelector('#ui .time .day').innerHTML = time.days;
	document.querySelector('#ui .time .clock').innerHTML = time.hours.toString().padStart(2, '0')+':'+time.minutes.toString().padStart(2, '0')+':'+time.seconds.toString().padStart(2, '0');
	document.querySelector('#ui .time .currentAcceleration .value').innerHTML = time.timeBased+' * '+time.globalTimeMultiplicator+' = '+time.timeAcceleration;
}, 1000);

scene.addEventListener('gameTick10', ()=>{
	document.querySelector('#ui .pointedObject .value').innerHTML = scene.pointedObject ? scene.pointedObject.name : 'none';
	document.querySelector('#ui .frametime .value').innerHTML = scene.gameTick.lastLongestGameTick+'ms / '+Math.round(1000 / scene.gameTick.lastLongestGameTick)+' fps';
});


document.querySelector('#ui .launch').addEventListener('click', ()=>{
	let randomCubeNumer = Math.floor(Math.random() * cubeCount);
	let cube = scene.objects.get('cube_'+randomCubeNumer);
	cube.velocity.y = 2;
});
document.querySelector('#ui .tick').addEventListener('click', ()=>{
	scene.gameTick.performGameTick();
});
document.querySelector('#ui .timeReset').addEventListener('click', ()=>{
	scene.time.set();
});

const spawnButtons = document.querySelectorAll('#ui .spawn');
for (let spawnButton of spawnButtons) {
	spawnButton.addEventListener('click', (e)=>{
		let cubeCount = parseInt(e.target.value);
		spawnCubes(cubeCount)
	});
}
const timeButtons = document.querySelectorAll('#ui .timeAcceleration');
for (let timeButton of timeButtons) {
	timeButton.addEventListener('click', (e)=>{
		let acceleration = parseInt(e.target.value);
		scene.time.globalTimeMultiplicator = acceleration;
	});
}

(async ()=>{
	/*
	let house = await loadGlbAsync('models/house.glb');
	scene.add({house});/** */



})();


scene.time.globalTimeMultiplicator = 10;
//oscilating cube
scene.add(getCube([2,2,2], [0, 1, -10], 'white', 'oscilatingCube', {
	colidable: true,
	label: {
		text: 'timecube',
		visible: 'always',
		onTop: true,
	},
}));
let oscilatingCube = scene.objects.get('oscilatingCube');
oscilatingCube.castShadow = true;
oscilatingCube.receiveShadow = true;

scene.addEventListener('gameTick2', ()=>{
	let downscale = scene.time.passedTimeInSeconds / 60;
	oscilatingCube.position.y = Math.sin(downscale * Math.PI) * 2 + 3;
	oscilatingCube.position.x = Math.cos(downscale * Math.PI) * 2;
});

//direction cubes
scene.add(directionCubes(5, 5, 0));





let totalCubes = 0;
function spawnCubes(cubeCount) {

	let spread = 10;
	let cubes = {};
	for (let i = 0; i < cubeCount; i++) {
	
		const cubeGeometry = new THREE.BoxGeometry();
		const cube = new THREE.Mesh( cubeGeometry, colorMaterials.white );
		cube.position.set( -spread / 2 + Math.random() * spread, 20 + Math.random() * 10, -spread / 2 + Math.random() * spread );
		cube.castShadow = true;
		cube.receiveShadow = true;
		
		cube.properties = {
			clickable: function() {
				console.log(this);
				this.addVelocity(new THREE.Vector3(0, 1, 0));
			},
			onPointStart: ()=> {
				console.log('onPointStart', this.name);
			},
			label: {
				text: 'cube_'+i,
				visible: 'pointing',
			},
			movable: true,
			colidable: true,
		};
	
		cubes[`cube_${i}`] = cube;
	}
	
	scene.add(cubes);

	totalCubes += cubeCount;
	document.querySelector('#ui .time .cubes .value').innerHTML = totalCubes;
}



setTimeout(()=>{
	//scene.gameTick.doGameTick = false;
}, 10000);



scene.startRender();


setInterval(()=>{
	if (window.manualTick) scene.gameTick.performGameTick();
}, 1000);/** */
