import * as THREE from 'three';

function addVelocity(vector) {
	if (!this.isMovable()) return false;

	this.velocity = this.velocity.add(vector);
	return true;
}

export default class Physics {
	scene = null;

	gravity = 0.981;
	gravityVector = new THREE.Vector3(0, -this.gravity, 0);

	minVelocity = 0.02;

	movableObjects = {};
	colidableObjects = {};

	constructor(scene) {
		this.scene = scene;

		this.scene.addEventListener('objectAdded', this.onObjectAdded.bind(this));
		this.scene.addEventListener('objectRemoved', this.onObjectRemoved.bind(this));
		this.scene.addEventListener('gameTick', this.tick.bind(this));

	}

	onObjectAdded(object) {
		if (object.geometry === undefined) return;

		if (object.properties.renderBoundingBox === undefined)  object.properties.renderBoundingBox = false;
		if (object.properties.damping === undefined)  object.properties.damping = 0.6;

		if (object.properties.movable === undefined)  object.properties.movable = false;
		object.isMovable = () => object.properties.movable;

		if (object.properties.colidable === undefined)  object.properties.colidable = false;
		object.isColidable = () => object.properties.colidable;

		if (object.isMovable()) this.movableObjects[object.properties.id] = object;
		if (object.isColidable()) this.colidableObjects[object.properties.id] = object;

		object.velocity = new THREE.Vector3(0, 0, 0);
		object.addVelocity = addVelocity.bind(object);

		object.geometry.computeBoundingBox();

		if (object.properties.renderBoundingBox && !object.properties.isBoundingBox) {
			object.boundingBox = new THREE.BoxHelper( object, 0xffff00 );
			this.scene.scene.add( object.boundingBox );
		}
		return object;
	}

	onObjectRemoved(object) {
		if (object.isMovable()) delete this.movableObjects[object.properties.id];
		if (object.isColidable()) delete this.colidableObjects[object.properties.id];
	}
	
	tick(delta) {
		this.calculateVelocities(delta);
		this.handleCollisions();
		this.moveObjects(delta);
	}

	calculateVelocities(delta) {
		Object.values(this.movableObjects).forEach((object) => {
			object.velocity.add(this.gravityVector.clone().multiplyScalar(delta));
		});
	}

	handleCollisions() {
		Object.values(this.movableObjects).forEach((object1) => {
			Object.values(this.colidableObjects).forEach((object2) => {
				this.doIntercectionCalculations(object1, object2);
			});
		});

		Object.values(this.movableObjects).forEach((object1) => {
			this.doCollisionCalculations(object1, Object.values(this.colidableObjects));
		});
	}

	doIntercectionCalculations(object1, object2) {
		try {
			if (object1 === object2) return;

			if (object1.geometry.boundingSphere.intersectsSphere(object2.geometry.boundingSphere)) {
				//cheap intersection detection finished, now check for real collision

				object1.updateMatrixWorld();
				let object1BoundingBox = object1.geometry.boundingBox.clone().applyMatrix4(object1.matrixWorld);

				object2.updateMatrixWorld();
				let object2BoundingBox = object2.geometry.boundingBox.clone().applyMatrix4(object2.matrixWorld);

				if (object1BoundingBox.intersectsBox(object2BoundingBox)) {
					// intersection detected
					const collisionVector = object1.position.clone().sub(object2.position).normalize();
					const totalDamping = object1.properties.damping * object2.properties.damping;

					object1.addVelocity(collisionVector.clone().multiplyScalar(1 * 0.01));
					if (object2.isMovable()) object2.addVelocity(collisionVector.clone().multiplyScalar(-1 * 0.01));
				}
			}
		} catch(err) {
			console.log('error in intersection calculation of', object1.name, object2.name, err);
		}
	}
	
	doCollisionCalculations(source, objects) {
		try {
			const ray = new THREE.Raycaster(source.position, source.velocity, 0, source.velocity.length());
			const intersects = ray.intersectObjects(objects);
			if (intersects.length > 0) {
				let target = intersects[0];

				//console.log(source.name, 'will colide with', target.object.name, 'at speed', source.velocity.length(), {source, target});

				const dampingTotal = source.properties.damping * target.object.properties.damping;
				const moveVector = source.velocity.clone();

				source.velocity = source.velocity.clone().sub(target.object.velocity).multiplyScalar(-1 * dampingTotal);

			}
		} catch(err) {
			console.log('error in collision calculation of', source.name, err);
		}
	}

	moveObjects(delta) {
		Object.values(this.movableObjects).forEach((object) => {
			
			if (Math.abs(object.velocity.x) < this.minVelocity) object.velocity.x = 0;
			if (Math.abs(object.velocity.y) < this.minVelocity) object.velocity.y = 0;
			if (Math.abs(object.velocity.z) < this.minVelocity) object.velocity.z = 0;

			object.position.add(object.velocity.clone());

			if (object.properties.renderBoundingBox) object.boundingBox.update();
		});
	}


}