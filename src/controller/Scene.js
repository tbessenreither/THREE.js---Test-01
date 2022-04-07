import * as THREE from 'three';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';

import PhysicsObject from '../classes/PhysicsObject.js';
import Subscribers from '../classes/Subscribers.ts';
import ObjectStorage from '../classes/ObjectStorage.ts';

import Time from './Time.js';
import Sky from './Sky.js';
import GameTick from './Gametick';

class Scene {
	eventListeners = {};
	objects = new ObjectStorage();


	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1500 );
	renderer = new THREE.WebGLRenderer();
	controls = new OrbitControls( this.camera, this.renderer.domElement );


	gameTick = null;
	time = null;
	sky = null;


	constructor() {
		this.startRender = this.startRender.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.addEventListener = this.addEventListener.bind(this);
		this.removeEventListener = this.removeEventListener.bind(this);
		this.triggerEvent = this.triggerEvent.bind(this);


		this.gameTick = new GameTick(this);
		this.time = new Time(this);
		this.sky = new Sky(this, {
			skyboxDiameter: 1000,
		});

		this._init();

		this.triggerEvent('onInit');
	}

	addEventListener(event, callback) {
		if (this.eventListeners[event] === undefined) {
			this.eventListeners[event] = {
				idCounter: 0,
				callbacks: {},
			};
		}

		const eventId = this.eventListeners[event].idCounter++;
		this.eventListeners[event].callbacks[eventId] = callback;

		return eventId;
	}

	removeEventListener(event, eventId) {
		if (this.eventListeners[event] === undefined) {
			return;
		}

		return delete this.eventListeners[event].callbacks[eventId];
	}

	triggerEvent(event, payload) {
		if (this.eventListeners[event] === undefined) {
			return;
		}

		for (let key in this.eventListeners[event].callbacks) {
			this.eventListeners[event].callbacks[key](payload);
		}

		return true;
	}

	_init() {

		this.onWindowResize();
		document.getElementById('stage').appendChild( this.renderer.domElement );
		window.addEventListener( 'resize', this.onWindowResize )

		
		
		this.addPlane();
		this.addControls();

		this.sky.addSkybox();
		this.time.addLighting();

		this.camera.position.x = 2;
		this.camera.position.y = 4;
		this.camera.position.z = 20;

		this.animate = this.animate.bind(this);
	}

	onWindowResize() {

		const width = window.innerWidth - 20;
		const height = window.innerHeight - 20;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( width, height );

	}

	startRender() {
		this.triggerEvent('onStartRender');
		this.objects.call('onStartRender');
		this.animate();
	}

	add(objects) {
		for (let key in objects) {
			this.objects.register(key, objects[key]);

			this.scene.add(objects[key]);
			if (objects[key].onAdd !== undefined) {
				objects[key].onAdd(this);
			}
		}
	}

	remove(key) {
		
		let object = this.objects.get(key);
		if (object !== null) {
			if (object.onRemove !== undefined) object.onRemove();

			this.scene.remove(object);
			this.objects.unregister(key);
		}
	}

	animate() {
		requestAnimationFrame( this.animate );

		this.gameTick.doGameTick();

		this.renderer.render( this.scene, this.camera );
	}


	addPlane() {
		const planeGeometry = new THREE.PlaneGeometry( this.sky.options.skyboxDiameter, this.sky.options.skyboxDiameter, Math.round(this.sky.options.skyboxDiameter / 200), Math.round(this.sky.options.skyboxDiameter / 200) );
		const planeMaterial = new THREE.MeshStandardMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );
		const plane = new PhysicsObject( planeGeometry, planeMaterial );
		plane.calculateGravity = false;
		plane.movable = false;
		plane.rotation.x = Math.PI / 2;

		plane.receiveShadow = true;
		plane.castShadow = false;

		const shadowplaneMaterial = new THREE.MeshStandardMaterial( {color: 0x000000, side: THREE.DoubleSide} );
		const shadowplane = new THREE.Mesh( planeGeometry, shadowplaneMaterial );
		shadowplane.rotation.x = Math.PI / 2;
		shadowplane.position.y = -0.5;

		shadowplane.receiveShadow = false;
		shadowplane.castShadow = true;

		this.add({plane});
	}


	addControls() {
		this.controls.target.set( 0, 0, 0 );
		this.controls.enablePan = true;
		this.controls.enableDamping = true;
		//this.controls.minDistance = 20;
		this.controls.maxDistance = this.time.sunSphereDistance - this.time.sunRadius - 5;
		this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
		
		this.controls.update();
	}
}

export default Scene;