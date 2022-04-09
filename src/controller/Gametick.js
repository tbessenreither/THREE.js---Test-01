import * as THREE from 'three';

import Subscribers from '../classes/Subscribers.ts';

class GameTick {
	targetFps = 60;
	targetFrameTime = Math.round(1000 / this.targetFps);
	doGameTick = true;

	scene = null;

	currentGameTick = 0;
	onGameTickDividerClocks = {};
	internalOnGameTickSubscriberId = null;

	lastLongestGameTick = 0;
	longestGameTick = 0;
	statistics = {};

	constructor(scene, options) {
		this.scene = scene;

		this.onGameTick = this.onGameTick.bind(this);

		this._init();
	}

	_init() { 
		for (let key of [1, 2, 5, 10, 20, 50, 100]) {
			this.onGameTickDividerClocks[key] = new THREE.Clock();
		}

		setInterval(()=>{
			this.analyticsTick();
		}, 1000);
	}

	logStatistic(name, value) {
		if (!this.scene.doLogging) return;

		if (value === undefined) value = 1;
		if (this.statistics[name] === undefined) {
			this.statistics[name] = 0;
		}
		this.statistics[name] += value;
	}

	analyticsTick() {
		if (this.targetFrameTime < this.longestGameTick) {
			if (this.scene.doLogging) console.log('GameTick took ' + this.longestGameTick + 'ms, but should have taken ' + this.targetFrameTime + 'ms');
		}

		this.statistics.longestGameTick = this.longestGameTick;

		if (this.scene.doLogging && Object.keys(this.statistics).length > 0) console.table(this.statistics);

		this.lastLongestGameTick = this.longestGameTick;
		this.longestGameTick = 0;
		this.statistics = {};
	}

	getFrameTimePercentageForClock(key) {
		return this.onGameTickDividerClocks[key].getDelta() / 1; //this is based on secons not on frame time.
	}

	onGameTick() {
		if (!this.doGameTick) return false;

		this.performGameTick();
	}

	performGameTick() {
		const tickStart = new Date().getTime();
		const delta1 = this.getFrameTimePercentageForClock(1);

		this.scene.triggerEvent('gameTick', delta1);
		if (this.currentGameTick % 2 === 0) {
			this.scene.triggerEvent('gameTick2', this.getFrameTimePercentageForClock(2));
		}
		if (this.currentGameTick % 5 === 0) {
			this.scene.triggerEvent('gameTick5', this.getFrameTimePercentageForClock(5));
		}
		if (this.currentGameTick % 10 === 0) {
			this.scene.triggerEvent('gameTick10', this.getFrameTimePercentageForClock(10));
		}
		if (this.currentGameTick % 20 === 0) {
			this.scene.triggerEvent('gameTick20', this.getFrameTimePercentageForClock(20));
		}
		if (this.currentGameTick % 50 === 0) {
			this.scene.triggerEvent('gameTick50', this.getFrameTimePercentageForClock(50));
		}
		if (this.currentGameTick % 100 === 0) {
			this.scene.triggerEvent('gameTick100', this.getFrameTimePercentageForClock(100));
		}

		this.currentGameTick++;
		if(this.currentGameTick >= 10000) {
			this.currentGameTick = 0;
		}

		const tickDuration = new Date().getTime() - tickStart;
		if (tickDuration > this.longestGameTick) this.longestGameTick = tickDuration;
	}
}

export default GameTick;