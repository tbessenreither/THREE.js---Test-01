import * as THREE from 'three';
import Subscribers from '../classes/Subscribers.ts';
import ObjectStorage from '../classes/ObjectStorage.ts';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';


class Scene {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer();
	controls = new OrbitControls( this.camera, this.renderer.domElement );
	
	frameTime = 100 / 60;

	defaultSunPosition = 80;
	sunDistance = 400;

	objects = new ObjectStorage();

	currentGameTick = 0;
	onGameTick = new Subscribers();
	onGameTickDivider = {
		1: this.onGameTick,
		2: new Subscribers(),
		5: new Subscribers(),
		10: new Subscribers(),
		20: new Subscribers(),
		50: new Subscribers(),
		100: new Subscribers(),
	};
	onGameTickDividerClocks = {};
	internalOnGameTickSubscriberId = null;


	constructor() {
		this._init();
	}

	_init() {

		this.renderer.setSize( window.innerWidth - 20, window.innerHeight - 20 );
		document.getElementById('stage').appendChild( this.renderer.domElement );

		for (let key of Object.keys(this.onGameTickDivider)) {
			this.onGameTickDividerClocks[key] = new THREE.Clock();
		}
		
		this.addSkybox();
		this.addPlane();
		this.addLighting();
		this.addControls();

		this.camera.position.x = 0;
		this.camera.position.y = 1;
		this.camera.position.z = 9;

		this.animate = this.animate.bind(this);
	}

	startRender() {
		this.animate();
	}

	add(objects) {
		for (let key in objects) {
			this.objects.register(key, objects[key]);
			this.scene.add(objects[key]);
		}
	}

	animate() {
		requestAnimationFrame( this.animate );

		this.doGameTick();

		this.renderer.render( this.scene, this.camera );
	}

	getFrameTimePercentageForClock(key) {
		return this.onGameTickDividerClocks[key].getDelta() / 1; //this is based on secons not on frame time.
	}

	doGameTick() {

		this.onGameTickDivider[1].call(this.getFrameTimePercentageForClock(1));
		if (this.currentGameTick % 2 === 0) {
			this.onGameTickDivider[2].call(this.getFrameTimePercentageForClock(2));
		}
		if (this.currentGameTick % 5 === 0) {
			this.onGameTickDivider[5].call(this.getFrameTimePercentageForClock(5));
		}
		if (this.currentGameTick % 10 === 0) {
			this.onGameTickDivider[10].call(this.getFrameTimePercentageForClock(10));
		}
		if (this.currentGameTick % 20 === 0) {
			this.onGameTickDivider[20].call(this.getFrameTimePercentageForClock(20));
		}
		if (this.currentGameTick % 50 === 0) {
			this.onGameTickDivider[50].call(this.getFrameTimePercentageForClock(50));
		}
		if (this.currentGameTick % 100 === 0) {
			this.onGameTickDivider[100].call(this.getFrameTimePercentageForClock(100));
		}

		this.currentGameTick++;
		if(this.currentGameTick >= 10000) {
			this.currentGameTick = 0;
		}
	}

	setSunPosition(position) {
		let sun = this.objects.get('sunLight');
		sun.position.set(...this.calculateSunPosition(position));

		let sunSphere = this.objects.get('sunSphere');
		sunSphere.position.set(...this.calculateSunPosition(position).map(x => x * 1.1));
	}

	loadCubeTextures(baseFilename, fileType) {
		const sides = ["rt", "lf", "up", "dn", "ft", "bk"];
		
		//const sides = ["bk", "ft", "up", "dn", "rt", "lf"];
		const pathStrings = sides.map(side => {
			return baseFilename+"_"+side+'.'+fileType;
		});

		let textures = [];
		for (let id in pathStrings) {
			let texture = new THREE.TextureLoader().load(pathStrings[id]);
			textures.push(new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));
		}
		
		return textures;

	}

	addSkybox() {

		const skyboxTextures = this.loadCubeTextures('./textures/skybox/sky/Daylight_Box', 'bmp');

		const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
		const skybox = new THREE.Mesh(skyboxGeometry, skyboxTextures);

		skybox.position.set(0, 0, 0);

		this.add({skybox});
	}

	addPlane() {
		const geometry = new THREE.PlaneGeometry( 1000, 1000, 320, 320 );
		const material = new THREE.MeshStandardMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );
		const plane = new THREE.Mesh( geometry, material );
		plane.rotation.x = Math.PI / 2;

		plane.receiveShadow = true;
		plane.castShadow = false;


		this.add({plane});

	}

	calculateSunPosition(position) {
		let x = this.sunDistance * Math.cos(position * Math.PI / 180);
		let y = this.sunDistance * Math.sin(position * Math.PI / 180);
		let z = 100 * Math.sin((position) * Math.PI / 180);


		return [x, y, z];
	}

	addLighting() {
		let sunSphereGeometry = new THREE.SphereGeometry( 50, 32, 32 );
		let sunMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		let sunSphere = new THREE.Mesh( sunSphereGeometry, sunMaterial );
		sunSphere.position.set(...this.calculateSunPosition(this.defaultSunPosition).map(x => x * 1.1));

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

		const sunLight = new THREE.DirectionalLight( 0xffffff, 1, 100 );
		sunLight.castShadow = true;

		sunLight.shadow.mapSize.width = 512;
		sunLight.shadow.mapSize.height = 512;
		sunLight.shadow.camera.near = 0.5;
		sunLight.shadow.camera.far = 500;
	


		const ambientLight = new THREE.AmbientLight( 0x404040, 0.4 ); // soft white light
		this.add({sunSphere, sunLight, ambientLight});


		
		this.setSunPosition(this.defaultSunPosition);
	}

	addControls() {
		this.controls.target.set( 0, 0.5, 0 );
		this.controls.update();
		this.controls.enablePan = false;
		this.controls.enableDamping = true;
	}
}

export default Scene;