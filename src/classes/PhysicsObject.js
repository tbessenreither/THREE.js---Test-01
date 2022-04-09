
import * as THREE from 'three';


export default class PhysicsObject extends THREE.Mesh {
	key = null;

	movable = true;
	calculateGravity = true;
	maxItterations = 10;

	pointable = true;

	gravity = 0.981;
	minimumVelocity = 0.011;
	wiggle = 0.1;
	damping = 0.9;

	density = 1;
	weight = null;

	velocity = new THREE.Vector3(0, 0, 0);

	showProjection = false;
	scene = null;

	// flags to be cleared bevor next tick
	calculatedColissions = {};
	tickImmovable = false;

	projectedCube = null;

	constructor(...args) {
		super(...args);

		this.setDensity = this.setDensity.bind(this);

		this.setDensity(1);
	}

	setDensity(density) {
		this.density = density;

		this.weight = this.density * this.geometry.parameters.width * this.geometry.parameters.height;
		if (this.geometry.parameters.depth) {
			this.weight *= this.geometry.parameters.depth;
		} else {
			this.weight *= 0.01;
		}
	}

	isMovable() {
		return this.movable && !this.tickImmovable;
	}

	handleClick(e) {
		if (this.onClick) {
			this.onClick(e);
		}
	}

	onAdd(scene) {
		this.scene = scene;

		if (this.showProjection) {
			const cubeGeometry = new THREE.BoxGeometry();
			const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000, transparent: true, opacity: 0.3 } );
	
			this.projectedCube = new THREE.Mesh( cubeGeometry, cubeMaterial );
			this.projectedCube.position.copy(this.position);
			let object = {};
			object[this.key+'_projection'] = this.projectedCube;
			this.scene.add(object);
		}
	}

	onRemove() {
		console.log('im gone now');
	}

	addVelocity(vector) {
		if (!this.isMovable()) return false;
		
		this.velocity = this.velocity.add(vector);
		return true;
	}

	getProjectedPosition() {
		return new THREE.Vector3(this.position.x, this.position.y, this.position.z).add(this.velocity);
	}

	updateProjection() {
		if (this.showProjection) {
			const projectedPosition = this.getProjectedPosition();
			this.projectedCube.position.set(projectedPosition.x, projectedPosition.y, projectedPosition.z);
		}
	}

	onPreGameTick() {
		this.calculatedColissions = {};
		this.tickImmovable = false;
	}

	onCalculateVelocity(delta) {
		delta = 0.05;
		if (this.calculateGravity) {
			this.addVelocity(new THREE.Vector3(0, -this.gravity * delta, 0));
		}
	}

	onCalculateCollisions() {
		const THREE.Meshs = this.scene?.objects.getTHREE.MeshsAsArray();
		if (!THREE.Meshs) return;

		for (let collisionObject of THREE.Meshs) {
			if (collisionObject.key === this.key) continue;
			if (this.calculatedColissions[collisionObject.key]) {
				this.scene.gameTick.logStatistic('skipped collision done');
				continue;
			}
			if (!this.movable && !collisionObject.movable) {
				this.scene.gameTick.logStatistic('skipped collision immovable');
				continue;
			}
			this.scene.gameTick.logStatistic('collision calculation');

			var projectedBoundingBoxPosition = new THREE.Box3().setFromObject(this).translate(this.velocity);
			var projectedBoundingBoxPosition2 = new THREE.Box3().setFromObject(collisionObject).translate(collisionObject.velocity);

			if (projectedBoundingBoxPosition.intersectsBox(projectedBoundingBoxPosition2)) {
				this.handleCollision(collisionObject);
			}
				
				
				/*
				if (this.movable || collisionObject.movable) {
					projectedBoundingBoxPosition = new THREE.Box3().setFromObject(this).translate(this.velocity);
					projectedBoundingBoxPosition2 = new THREE.Box3().setFromObject(collisionObject).translate(collisionObject.velocity);
					if (projectedBoundingBoxPosition.intersectsBox(projectedBoundingBoxPosition2)) {
						this.pushObjectsAwayFromEachOther(collisionObject);
					}
				}/** */

			// mark calculations as done
			this.calculatedColissions[collisionObject.key] = true;
			collisionObject.calculatedColissions[this.key] = true;
		}
	}

	handleCollision(collisionObject) {
		const totalDamping = this.damping * collisionObject.damping;

		const myVelocity = this.velocity.clone();
		const otherVelocity = collisionObject.velocity.clone();
		
		this.addVelocity(otherVelocity.multiplyScalar(totalDamping * -1));
		collisionObject.addVelocity(myVelocity.multiplyScalar(totalDamping * -1));
	}

	pushObjectsAwayFromEachOther(collisionObject) {
		const distance = this.position.distanceTo(collisionObject.position);
		const direction = this.position.clone().sub(collisionObject.position);
		direction.normalize();

		this.addVelocity(distance * direction);
		collisionObject.addVelocity(distance * direction.multiplyScalar(-1));
	}

	onCalculatePosition() {
		this.handleMovement();
	}

	handleMovement() {
		
		if (!this.isMovable()) {
			this.velocity.set(0, 0, 0);
			return;
		}/** */

		
		if (Math.abs(this.velocity.y) < this.minimumVelocity) this.velocity.y = 0;
		if (Math.abs(this.velocity.x) < this.minimumVelocity) this.velocity.x = 0;
		if (Math.abs(this.velocity.z) < this.minimumVelocity) this.velocity.z = 0;
		this.scene.gameTick.logStatistic('movement');
		this.position.add(this.velocity);

		this.updateProjection();
	}

}