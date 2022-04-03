import "./style.scss";

import * as THREE from 'three';
import Scene from './controller/Scene.ts';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';


(async function() {

	let scene = new Scene();


	const loader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( 'js/libs/draco/gltf/' );
	loader.setDRACOLoader( dracoLoader );
	loader.load( 'models/house.glb', function ( gltf ) {

		let scale = 0.3;
		const house = gltf.scene;
		house.position.set( 0, 0.3, 0 );
		house.scale.set(scale, scale, scale);
		house.rotation.y = 1.8;

		scene.add({house});

		//mixer = new THREE.AnimationMixer( model );
		//mixer.clipAction( gltf.animations[ 0 ] ).play();


	}, undefined, function ( e ) {

		console.error( e );

	} );/** */

	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshStandardMaterial( { color: 0x0ffff0 } );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.y = 0;
	cube.castShadow = true;
	cube.receiveShadow = true;

	//scene.add({cube1: cube});

	let sunPosition = 30;


	scene.onGameTickDivider[2].register((delta)=>{
		
		let increment = 20 * delta;

		sunPosition = Math.max(0, sunPosition + increment) % 180;
		//sunPosition = (sunPosition + increment) % 360;
		//console.log({sunPosition});
		scene.setSunPosition(sunPosition);
	});/** */

	/*
	scene.onGameTickDivider[1].register((delta)=>{
		cube.rotation.x += 90 * delta;
		//cube.rotation.y += 2 * delta;
		//cube.rotation.z += 3 * delta;
	});/** */

	scene.startRender();

}());