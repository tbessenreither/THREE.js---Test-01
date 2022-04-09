import * as THREE from 'three';

let directions = {
	front: {
		axis: 'z',
		direction: 1,
	},
	back: {
		axis: 'z',
		direction: -1,
	},
	left: {
		axis: 'x',
		direction: -1,
	},
	right: {
		axis: 'x',
		direction: 1,
	},
	up: {
		axis: 'y',
		direction: 1,
	},
	down: {
		axis: 'y',
		direction: -1,
	},
};


function addVelocity(vector) {
	if (!this.isMovable()) return false;

	this.velocity = this.velocity.add(vector);
	return true;
}

function calculateMass() {
	return this.properties.density;
}

export default class Physics {
	scene = null;

	gravity = 0.981;
	gravityVector = new THREE.Vector3(0, -this.gravity, 0);

	minVelocity = 0.01;

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
		if (object.properties.damping === undefined)  object.properties.damping = 0.9;
		if (object.properties.density === undefined)  object.properties.density = 1;
		object.getMass = calculateMass.bind(object);

		if (object.properties.movable === undefined)  object.properties.movable = false;
		object.isMovable = () => object.properties.movable;

		if (object.properties.colidable === undefined)  object.properties.colidable = false;
		object.isColidable = () => object.properties.colidable;

		if (object.isMovable()) this.movableObjects[object.properties.id] = object;
		if (object.isColidable()) this.colidableObjects[object.properties.id] = object;

		object.colissionForce = new THREE.Vector3(0, 0, 0);

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

					const split = 0.01;

					object1.addVelocity(collisionVector.clone().multiplyScalar(1 * split));
					if (object2.isMovable()) object2.addVelocity(collisionVector.clone().multiplyScalar(-1 * split));
				}
			}
		} catch(err) {
			console.log('error in intersection calculation of', object1.name, object2.name, err);
		}
	}
	
	doCollisionCalculations(source, objects) {
		try {
			source.updateMatrixWorld();
			let sourceBoundingBox = source.geometry.boundingBox.clone().applyMatrix4(source.matrixWorld);

			let pointsToCheck = {
				topBackLeft: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.min.x, sourceBoundingBox.max.y, sourceBoundingBox.min.z),
				},
				topBackRight: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.max.x, sourceBoundingBox.max.y, sourceBoundingBox.min.z),
				},
				topFrontLeft: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.min.x, sourceBoundingBox.max.y, sourceBoundingBox.max.z),
				},
				topFrontRight: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.max.x, sourceBoundingBox.max.y, sourceBoundingBox.max.z),
				},
				bottomBackLeft: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.min.x, sourceBoundingBox.min.y, sourceBoundingBox.min.z),
				},
				bottomBackRight: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.max.x, sourceBoundingBox.min.y, sourceBoundingBox.min.z),
				},
				bottomFrontLeft: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.min.x, sourceBoundingBox.min.y, sourceBoundingBox.max.z),
				},
				bottomFrontRight: {
					check: false,
					point: new THREE.Vector3(sourceBoundingBox.max.x, sourceBoundingBox.min.y, sourceBoundingBox.max.z),
				},
			};

			if (source.velocity.x < 0) {
				pointsToCheck.topBackLeft.check = true;
				pointsToCheck.topFrontLeft.check = true;
				pointsToCheck.bottomBackLeft.check = true;
				pointsToCheck.bottomFrontLeft.check = true;
			} else if (source.velocity.x > 0) {
				pointsToCheck.topBackRight.check = true;
				pointsToCheck.topFrontRight.check = true;
				pointsToCheck.bottomBackRight.check = true;
				pointsToCheck.bottomFrontRight.check = true;
			}
			if (source.velocity.y < 0) {
				pointsToCheck.bottomBackLeft.check = true;
				pointsToCheck.bottomBackRight.check = true;
				pointsToCheck.bottomFrontLeft.check = true;
				pointsToCheck.bottomFrontRight.check = true;
			} else if (source.velocity.y > 0) {
				pointsToCheck.topBackLeft.check = true;
				pointsToCheck.topBackRight.check = true;
				pointsToCheck.topFrontLeft.check = true;
				pointsToCheck.topFrontRight.check = true;
			}
			if (source.velocity.z < 0) {
				pointsToCheck.topBackLeft.check = true;
				pointsToCheck.topBackRight.check = true;
				pointsToCheck.bottomBackLeft.check = true;
				pointsToCheck.bottomBackRight.check = true;
			} else if (source.velocity.z > 0) {
				pointsToCheck.topFrontLeft.check = true;
				pointsToCheck.topFrontRight.check = true;
				pointsToCheck.bottomFrontLeft.check = true;
				pointsToCheck.bottomFrontRight.check = true;
			}

			let shortestVector = null;

			for (let key in pointsToCheck) {
				let check = pointsToCheck[key];
				if (!check.check) continue;
				
				const ray = new THREE.Raycaster(check.point, source.velocity, 0, source.velocity.length());
				const intersects = ray.intersectObjects(objects);
				for (let intersection of intersects) {
					if (intersection.object === source) continue;
					if (shortestVector === null || intersection.distance < shortestVector.distance) {
						shortestVector = intersection;
					}
				}
			}

			if (shortestVector !== null) {
				//console.log(source.name, 'will colide in', shortestVector.distance, 'with', shortestVector.object.name, 'at speed', source.velocity.length(), {source, shortestVector});

				const totalDamping = source.properties.damping * shortestVector.object.properties.damping;

				const distanceCorrection = shortestVector.distance / source.velocity.length();
				source.velocity.multiplyScalar(distanceCorrection).add(source.velocity.clone().multiplyScalar(-0.5));
				const newCollisionForce = source.velocity.clone().multiplyScalar(-1).multiplyScalar(1+(1-totalDamping));
				

				//calculate relations between forces
				const totalMass = source.getMass() + shortestVector.object.getMass();
				const myForcePart = source.getMass() / totalMass;
				const otherForcePart = 1 - myForcePart;
				
				source.colissionForce.add(newCollisionForce.clone().multiplyScalar(myForcePart));
				shortestVector.object.addVelocity(newCollisionForce.clone().multiplyScalar(otherForcePart));

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
			
			object.velocity.add(object.colissionForce);
			object.colissionForce.set(0,0,0);

			if (object.properties.renderBoundingBox) object.boundingBox.update();
		});
	}


}