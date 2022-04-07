import * as THREE from 'three';

import Subscribers from '../classes/Subscribers.ts';

class GameTick {
	scene = null;

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


	constructor(scene, options) {
		this.scene = scene;

		this._init();
	}

	_init() {
		for (let key of Object.keys(this.onGameTickDivider)) {
			this.onGameTickDividerClocks[key] = new THREE.Clock();
		}
	}

	getFrameTimePercentageForClock(key) {
		return this.onGameTickDividerClocks[key].getDelta() / 1; //this is based on secons not on frame time.
	}

	doGameTick() {
		const delta1 = this.getFrameTimePercentageForClock(1);
		this.scene.objects.call('onPreGameTick');
		this.scene.objects.call('onGameTick', delta1);
		this.scene.objects.call('onCalculateVelocity', delta1);
		this.scene.objects.call('onCalculateCollisions', delta1);
		this.scene.objects.call('onCalculatePosition', delta1);

		this.onGameTickDivider[1].call(delta1);
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
}

export default GameTick;