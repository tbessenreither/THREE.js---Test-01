import * as THREE from 'three';

import CubeTextures from '../classes/CubeTextures';


class Sky {
	scene = null;
	options = {
		skyboxDiameter: 1000,
	};
	

	constructor(scene, options) {
		this.scene = scene;

		for (let key of Object.keys(this.options)) {
			if (options[key] !== undefined) this.options[key] = options[key];
		}

		this._init();
	}

	_init() {
		
		this.scene.gameTick.onGameTickDivider[10].register(this.calculateSkyboxOpacity.bind(this));
	}

	calculateSkyboxOpacity() {
		let skybox = this.scene.objects.get('skyboxNight');
		
		if (skybox) {
			
			for (let item of skybox.material) {
				
				item.opacity = Math.sin(((this.scene.time.currentSunPosition + 180) % 360) * Math.PI / 180);
				console.log();
			};/** */
			//skybox.material.materials[0].opacity = this.scene.time.currentSunIntensity;
		}
	}

	addSkybox() {

		let nightSkyboxInflation = 2;
		const skyboxDayTextures = CubeTextures.loadCubeTextures('./textures/skybox/sky/Daylight_Box', 'png');
		const skyboxDayGeometry = new THREE.BoxGeometry(this.options.skyboxDiameter + nightSkyboxInflation, this.options.skyboxDiameter + nightSkyboxInflation, this.options.skyboxDiameter + nightSkyboxInflation);
		const skyboxDay = new THREE.Mesh(skyboxDayGeometry, skyboxDayTextures);
		
		const skyboxNightTextures = CubeTextures.loadCubeTextures('./textures/skybox/galaxy/galaxy', 'jpg');
		const skyboxNightGeometry = new THREE.BoxGeometry(this.options.skyboxDiameter, this.options.skyboxDiameter, this.options.skyboxDiameter);
		const skyboxNight = new THREE.Mesh(skyboxNightGeometry, skyboxNightTextures);

		this.scene.add({skyboxDay, skyboxNight});
	}

}

export default Sky;