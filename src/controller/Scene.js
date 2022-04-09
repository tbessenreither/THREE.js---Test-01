import * as THREE from 'three';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';

import Subscribers from '../classes/Subscribers.ts';
import ObjectStorage from '../classes/ObjectStorage.ts';

import Time from './Time';
import Sky from './Sky';
import GameTick from './Gametick';
import Physics from './Physics';
import Labels from './Labels';

class Scene {
	doLogging = false;
	eventListeners = {};
	objects = new ObjectStorage(this);


	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1500 );
	renderer = new THREE.WebGLRenderer();
	controls = new OrbitControls( this.camera, this.renderer.domElement );

	gameTick = null;
	time = null;
	sky = null;
	physics = null;
	labels = null;

	//raycaster thing
	raycaster = new THREE.Raycaster();
	pointer = new THREE.Vector2();
	pointedObject = null;

	constructor() {
		this.startRender = this.startRender.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.addEventListener = this.addEventListener.bind(this);
		this.removeEventListener = this.removeEventListener.bind(this);
		this.triggerEvent = this.triggerEvent.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);


		this.gameTick = new GameTick(this);
		this.time = new Time(this);
		this.sky = new Sky(this, {
			skyboxDiameter: 1000,
		});
		this.physics = new Physics(this);
		this.labels = new Labels(this);

		this._init();
	}

	_init() {
		this.onWindowResize();
		document.getElementById('stage').appendChild( this.renderer.domElement );

		window.addEventListener( 'resize', this.onWindowResize.bind(this) )
		window.addEventListener( 'pointermove', this.onPointerMove.bind(this) );
		window.addEventListener( 'click', this.onClick.bind(this) );

		this.addPlane();
		this.addControls();

		this.sky.addSkybox();
		this.time.addLighting();

		this.camera.position.x = 2;
		this.camera.position.y = 4;
		this.camera.position.z = 20;

		this.animate = this.animate.bind(this);

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

	onWindowResize() {

		const width = window.innerWidth - 20;
		const height = window.innerHeight - 20;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( width, height );
	}


	onPointerMove(event) {
		this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	onClick(event){
		if (this.pointedObject === null) return null;

		if (this.pointedObject.properties.clickable !== false) this.pointedObject.properties.clickable(event);

		return this.pointedObject;
	}

	updateRaycaster() {
		this.raycaster.setFromCamera( this.pointer, this.camera );

		const intersects = this.raycaster.intersectObjects( this.scene.children );
		
		let pointableFound = null;
		for (let intersection of intersects) {
			try {
				if (intersection.object.properties.pointable === true) {
					pointableFound = intersection.object;
					break;
				}
			} catch (e) {
				console.error('intersecter error', e);
			}
		}
		if (this.pointedObject !== pointableFound) {
			if (this.pointedObject !== null) this.triggerEvent('pointingEnd', this.pointedObject);

			if (pointableFound === null) {
				this.pointedObject = null;
			} else {
				this.pointedObject = pointableFound;
				this.triggerEvent('pointingStart', this.pointedObject);
			}
		}
	}

	startRender() {
		this.triggerEvent('onStartRender');
		this.objects.call('onStartRender');
		this.animate();
	}

	addOne(key, object) {
		let objects = {};
		objects[key] = object;
		this.add(objects);
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

		this.updateRaycaster();

		this.gameTick.onGameTick();

		this.renderer.render( this.scene, this.camera );
	}


	addPlane() {
		const planeGeometry = new THREE.PlaneGeometry( this.sky.options.skyboxDiameter, this.sky.options.skyboxDiameter, Math.round(this.sky.options.skyboxDiameter / 200), Math.round(this.sky.options.skyboxDiameter / 200) );
		const planeMaterial = new THREE.MeshStandardMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );
		const plane = new THREE.Mesh( planeGeometry, planeMaterial );
		plane.properties = {
			colidable: true,
		};
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