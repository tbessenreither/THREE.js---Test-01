
import * as THREE from 'three';


export default class PhysicsObject extends THREE.Mesh {
	key = null;

	movable = true;
	calculateGravity = true;
	gravity = 0.0981;
	minimumVelocity = 0.0015;

	damping = 0.05;
	density = 1;
	weight = 1;

	velocity = new THREE.Vector3(0, 0, 0);

	scene = null;

	calculatedColissions = {};

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

	onAdd(scene) {
		this.scene = scene;
	}

	onRemove() {
		console.log('im gone now');
	}

	onPreGameTick() {
		this.calculatedColissions = {};
	}

	onGameTick(delta) {
		
	}

	onCalculateVelocity(delta) {
		if (this.calculateGravity) {
			this.velocity = this.velocity.add(new THREE.Vector3(0, -this.gravity * delta, 0));

			if (Math.abs(this.velocity.y) < this.minimumVelocity) this.velocity.y = 0;
			if (Math.abs(this.velocity.x) < this.minimumVelocity) this.velocity.x = 0;
			if (Math.abs(this.velocity.z) < this.minimumVelocity) this.velocity.z = 0;
		}
	}

	addVelocity(vector) {
		if (!this.movable) return false;

		if (vector.length() < 0.001) return false;
		
		this.velocity = this.velocity.add(vector);
		return true;
	}

	// calculate collisions with other objects in scene.objects.getPhysicsObjects()
	onCalculateCollisions(delta) {
		const physicsObjects = this.scene?.objects.getPhysicsObjectsAsArray();
		if (!physicsObjects) return;

		for (let physicsObject of physicsObjects) {
			if (physicsObject.key === this.key) continue;
			if (this.calculatedColissions[physicsObject.key]) continue;


			const boundingBoxPosition = new THREE.Box3().setFromObject(this);
			const boundingBoxPosition2 = new THREE.Box3().setFromObject(physicsObject);

			boundingBoxPosition.translate(this.velocity);
			boundingBoxPosition2.translate(physicsObject.velocity);

			if (boundingBoxPosition.intersectsBox(boundingBoxPosition2)) {

				const collisionVector = this.velocity.clone().sub(physicsObject.velocity);
				const totalDamping = this.damping * physicsObject.damping;

				const myWeightRatio = this.weight / (this.weight + physicsObject.weight);
				const otherWeightRatio = 1 - myWeightRatio;

				this.velocity.y = 0;
				this.velocity.x = 0;
				this.velocity.z = 0;
				physicsObject.velocity.y = 0;
				physicsObject.velocity.x = 0;
				physicsObject.velocity.z = 0;
				
				this.addVelocity(collisionVector.clone().multiplyScalar(myWeightRatio * totalDamping));
				physicsObject.addVelocity(collisionVector.clone().multiplyScalar(otherWeightRatio * totalDamping));
			}

			// mark calculations as done
			this.calculatedColissions[physicsObject.key] = true;
			physicsObject.calculatedColissions[this.key] = true;
		}
	}

	onCalculatePosition(delta) {
		if (this.movable === false) {
			this.velocity.set(0, 0, 0);
			return;
		};

		this.position.add(this.velocity);
	}

}