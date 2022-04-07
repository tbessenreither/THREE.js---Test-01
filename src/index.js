import "./style.scss";

import * as THREE from 'three';
import { loadGlbAsync } from "./classes/helpers";
import Scene from './controller/Scene.js';
import PhysicsObject from './classes/PhysicsObject.js';


let scene = new Scene();
window.scene = scene;

scene.time.timePassing = false;
scene.time.setTime(12, 4);


scene.time.onNewHour.register((hour, day)=>{
	document.querySelector('#ui .time .day .value').innerHTML = day;
	document.querySelector('#ui .time .hour .value').innerHTML = hour;
});


(async ()=>{
	/*
	let house = await loadGlbAsync('models/house.glb');
	scene.add({house});/** */



})();





let cubes = {};

for (let i = 0; i < 10; i++) {
	
	const cubeGeometry = new THREE.BoxGeometry();
	const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0x0fff00 } );
	const cube = new PhysicsObject( cubeGeometry, cubeMaterial );
	cube.position.set( 0+ (0.3*i), 10 + (5*i), 10 );
	cube.castShadow = true;
	cube.receiveShadow = false;

	cubes[`cube_${i}`] = cube;
}

scene.add(cubes);



setTimeout(()=>{
	scene.remove('cube_2');
}, 3000);

setTimeout(()=>{
	scene.remove('cube_3');
}, 6000);

setTimeout(()=>{
	scene.remove('cube_4');
}, 9000);

/*
scene.gameTick.onGameTickDivider[1].register((delta)=>{
	cube.rotation.x += 90 * delta;
	cube.rotation.x = cube.rotation.x % 360;
	cube.material.opacity = Math.sin(cube.rotation.x / 90);

	let skyboxDay = scene.objects.get('skyboxNight');
	if (skyboxDay) {
		for (let material of skyboxDay.material) {
			material.opacity = cube.material.opacity;
		}
	}
	//cube.rotation.y += 2 * delta;
	//cube.rotation.z += 3 * delta;
});/** */

scene.startRender();
