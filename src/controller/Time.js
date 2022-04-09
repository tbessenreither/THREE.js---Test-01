import * as THREE from 'three';

import Subscribers from '../classes/Subscribers.ts';


class Time {
	scene = null;
	currentHour = 0;

	onNewDay = new Subscribers(true);
	onNewHour = new Subscribers(true);
	onSunrise = new Subscribers();
	onSunset = new Subscribers();

	defaultSunPosition = 0;
	sunRadius = 20;
	sunDistance = 450;
	sunSphereDistance = 450;
	currentSunPosition = this.defaultSunPosition;
	passedDays = 0;
	
	timePassing = true;

	globalTimeMultiplicator = 1;
	timeAcceleration = {
		0: 5, 
		5: 5,
		6: 1,
		8: 5,
		16: 1,
		20: 5,
	};
	currentTimeIncrement = 1;
	currentSunIntensity = 1;

	
	degreePerHour = Math.round(365 / 24);

	constructor(scene) {
		this.scene = scene;
		scene.addEventListener('onInit', this.onInit.bind(this));
		this._init();
	}

	_init() {
		this.checkHour();
		this.newHourHandler();
	}

	setTime(hour, day) {
		this.currentSunPosition = (hour * this.degreePerHour) - 90 % 360;
		this.setSunPosition(this.currentSunPosition);
		if (day !== undefined) this.passedDays = day;
	}

	onInit() {
		this.setSunPosition(this.currentSunPosition);
	}

	addLighting() {
		let sunSphereGeometry = new THREE.SphereGeometry( this.sunRadius, 32, 32 );
		let sunSphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		let sunSphere = new THREE.Mesh( sunSphereGeometry, sunSphereMaterial );
		sunSphere.position.set(...this.calculateSunPosition(this.defaultSunPosition, this.sunSphereDistance));
		sunSphere.castShadow = false;
		sunSphere.receiveShadow = false;

		this.scene.renderer.shadowMap.enabled = true;
		this.scene.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 

		const sunLight = new THREE.DirectionalLight( 0xffffff, 1, 1 );
		sunLight.castShadow = true;

		sunLight.shadow.mapSize.width = 512;
		sunLight.shadow.mapSize.height = 512;
		sunLight.shadow.camera.near = 0.5;
		sunLight.shadow.camera.far = 500;

		const ambientLight = new THREE.AmbientLight( 0x404040, 0.3 ); // soft white light
		this.scene.add({sunLight, sunSphere, ambientLight});

		
		this.setSunPosition(this.defaultSunPosition);

		this.scene.addEventListener('gameTick2', this.doTimeTick.bind(this));
		this.scene.addEventListener('gameTick10', this.calculateSunIntensity.bind(this));
		this.scene.addEventListener('gameTick20', this.checkHour.bind(this));
	}

	checkHour() {
		let hour = Math.floor((this.currentSunPosition / this.degreePerHour) + 6.5) ;
		if (hour >= 24) hour = hour % 24;

		if (hour !== this.currentHour) {
			this.currentHour = hour;
			this.newHourHandler();
		}
	}

	newHourHandler() {
		this.currentTimeIncrement = 1;
		for (let hour of Object.keys(this.timeAcceleration)) {
			if (parseInt(hour) <= this.currentHour) this.currentTimeIncrement = this.timeAcceleration[hour];
		}

		this.onNewHour.call(this.currentHour, this.passedDays);
		if(this.currentHour === 0) {
			this.passedDays++;
			this.onNewDay.call(this.currentHour, this.passedDays);
		} else if(this.currentHour === 7) {
			this.onSunrise.call(this.currentHour, this.passedDays);
		} else if(this.currentHour === 19) {
			this.onSunset.call(this.currentHour, this.passedDays);
		}
	}

	doTimeTick(delta) {
		if (this.timePassing === false) return false;
		let timeIncrement = this.currentTimeIncrement * this.globalTimeMultiplicator;

		let increment = timeIncrement * delta;
		
		this.currentSunPosition = (this.currentSunPosition + increment);;
		if (this.currentSunPosition > 360) {
			this.currentSunPosition = this.currentSunPosition % 360;
		}
		this.setSunPosition(this.currentSunPosition);
	}
	
	calculateSunPosition(position, distance) {
		if (distance === undefined) distance = this.sunDistance;
		let x = distance * Math.cos(position * Math.PI / 180);
		let y = distance * Math.sin(position * Math.PI / 180);
		let z = 100 * Math.sin((position) * Math.PI / 180);

		return [x, y, z];
	}

	calculateSunIntensity() {
		this.currentSunIntensity = Math.min(1, Math.max(0, (Math.sin(this.currentSunPosition * Math.PI / 180) + 0.3)));
		let sunLight = this.scene.objects?.get('sunLight');
		if (sunLight) sunLight.intensity = this.currentSunIntensity;
	}

	setSunPosition(position) {
		let sunLight = this.scene.objects.get('sunLight');
		if (sunLight) sunLight.position.set(...this.calculateSunPosition(position));

		let sunSphere = this.scene.objects.get('sunSphere');
		if (sunSphere) sunSphere.position.set(...this.calculateSunPosition(position, this.sunSphereDistance));
	}
}

export default Time;