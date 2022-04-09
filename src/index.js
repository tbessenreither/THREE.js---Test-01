import "./style.scss";

import * as THREE from 'three';
import { loadGlbAsync } from "./classes/helpers";
import Scene from './controller/Scene.js';



let scene = new Scene();
window.scene = scene;

scene.time.timePassing = false;
scene.time.setTime(16, 4);
scene.camera.position.z = 20;
scene.camera.position.y = 5;
scene.gameTick.doGameTick = true;
scene.doLogging = true;

window.manualTick = false;



scene.time.onNewHour.register((hour, day)=>{
	document.querySelector('#ui .time .day .value').innerHTML = day;
	document.querySelector('#ui .time .hour .value').innerHTML = hour;
});

scene.addEventListener('gameTick', ()=>{
	document.querySelector('#ui .pointedObject .value').innerHTML = scene.pointedObject ? scene.pointedObject.name : 'none';
});


document.querySelector('#ui .launch').addEventListener('click', ()=>{
	let randomCubeNumer = Math.floor(Math.random() * cubeCount);
	let cube = scene.objects.get('cube_'+randomCubeNumer);
	cube.velocity.y = 2;
});
document.querySelector('#ui .tick').addEventListener('click', ()=>{
	scene.gameTick.performGameTick();
});

(async ()=>{
	/*
	let house = await loadGlbAsync('models/house.glb');
	scene.add({house});/** */



})();





let cubes = {};


const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0xffff00 } );

const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
cube.position.set( 10, 50, 0 );
cube.castShadow = false;
cube.receiveShadow = false;

//cubes[`cube_back_1`] = cube;

let cubeCount = 200;
let spread = 20;
for (let i = 0; i < cubeCount; i++) {
	
	const cubeGeometry = new THREE.SphereGeometry();
	const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
	cube.position.set( -spread / 2 + Math.random() * spread, 20 + Math.random() * 10, -spread / 2 + Math.random() * spread );
	cube.castShadow = true;
	cube.receiveShadow = true;
	
	cube.properties = {
		clickable: function() {
			console.log(this);
			this.addVelocity(new THREE.Vector3(0, 2, 0));
		},
		movable: true,
		colidable: true,
		showProjection: true,
	};

	cubes[`cube_${i}`] = cube;
}

scene.add(cubes);



setTimeout(()=>{
	//scene.gameTick.doGameTick = false;
}, 10000);



scene.startRender();


setInterval(()=>{
	if (window.manualTick) scene.gameTick.performGameTick();
}, 1000);/** */
