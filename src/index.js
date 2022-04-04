import "./style.scss";

import * as THREE from 'three';
import Scene from './controller/Scene.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';


let scene = new Scene();
window.scene = scene;

scene.time.globalTimeMultiplicator = 2;

scene.time.onNewDay.register((day)=>{
	console.log('a new day', day);
});

scene.time.onNewHour.register((hour, day)=>{
	console.log('Hour', hour, 'of day', day)
});

scene.time.onSunrise.register((hour, day)=>{
	console.log('Sunrise Hour', hour, 'of day', day)
});

scene.time.onSunset.register((hour, day)=>{
	console.log('Sunset Hour', hour, 'of day', day)
});



const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'js/libs/draco/gltf/' );
loader.setDRACOLoader( dracoLoader );
loader.load( 'models/house.glb', function ( gltf ) {

	let scale = 1;
	const house = gltf.scene;
	house.position.set( 0, 0.3, 0 );
	house.scale.set(scale, scale, scale);
	house.rotation.y = 1.8;

	gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) {
			node.castShadow = true;
		}
    } );


	scene.add({house});

	//mixer = new THREE.AnimationMixer( model );
	//mixer.clipAction( gltf.animations[ 0 ] ).play();


}, undefined, function ( e ) {

	console.error( e );

} );/** */

const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0x0ffff0, transparent: true } );
const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
cube.position.set( 0, 2, 5);
cube.castShadow = true;
cube.receiveShadow = true;

//scene.add({cube});



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
