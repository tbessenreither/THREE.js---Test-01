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

	checkedIntercections = {};

	asArray = {};

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
		this.asArray.movable = Object.values(this.movableObjects);
		this.asArray.colidable = Object.values(this.colidableObjects);

		this.calculateVelocities(delta);
		this.handleCollisions();
		this.moveObjects(delta);
	}

	calculateVelocities(delta) {
		let gravityDelta = this.gravityVector.clone().multiplyScalar(delta);
		for (let object1 of this.asArray.movable) {
			object1.velocity.add(gravityDelta);
		};
	}

	handleCollisions() {
		this.checkedIntercections = {};
		let generatedBoundingBoxes = {};
		for (let object1 of this.asArray.movable) {
			if (!generatedBoundingBoxes[object1.uuid]) {
				object1.updateMatrixWorld();
				object1.translatedBoundingBox = object1.geometry.boundingBox.clone().applyMatrix4(object1.matrixWorld);
				generatedBoundingBoxes[object1.uuid] = true;
			}

			for (let object2 of this.asArray.colidable) {
				if (!generatedBoundingBoxes[object2.uuid]) {
					object2.updateMatrixWorld();
					object2.translatedBoundingBox = object2.geometry.boundingBox.clone().applyMatrix4(object2.matrixWorld);
					generatedBoundingBoxes[object2.uuid] = true;
				}
				
				this.doIntercectionCalculations(object1, object2);
			};
		};

		for (let object1 of this.asArray.movable) {
			this.doCollisionCalculations(object1, this.asArray.colidable);
		};
	}

	doIntercectionCalculations(object1, object2) {
		try {
			if (object1.uuid === object2.uuid) return;

			if (object1.geometry.boundingSphere.intersectsSphere(object2.geometry.boundingSphere)) {
				//cheap intersection detection finished, now check for real collision
				if (object1.translatedBoundingBox.intersectsBox(object2.translatedBoundingBox)) {
					// intersection detected
					const collisionVector = object1.position.clone().sub(object2.position).normalize();

					const split = 0.02;

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
			let pointsToCheck = {
				topBackLeft: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.min.x, source.translatedBoundingBox.max.y, source.translatedBoundingBox.min.z),
				},
				topBackRight: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.max.x, source.translatedBoundingBox.max.y, source.translatedBoundingBox.min.z),
				},
				topFrontLeft: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.min.x, source.translatedBoundingBox.max.y, source.translatedBoundingBox.max.z),
				},
				topFrontRight: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.max.x, source.translatedBoundingBox.max.y, source.translatedBoundingBox.max.z),
				},
				bottomBackLeft: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.min.x, source.translatedBoundingBox.min.y, source.translatedBoundingBox.min.z),
				},
				bottomBackRight: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.max.x, source.translatedBoundingBox.min.y, source.translatedBoundingBox.min.z),
				},
				bottomFrontLeft: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.min.x, source.translatedBoundingBox.min.y, source.translatedBoundingBox.max.z),
				},
				bottomFrontRight: {
					check: false,
					point: new THREE.Vector3(source.translatedBoundingBox.max.x, source.translatedBoundingBox.min.y, source.translatedBoundingBox.max.z),
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

				const ray = new THREE.Raycaster(check.point, source.velocity.clone().normalize(), 0, source.velocity.length());
				const intersects = ray.intersectObjects(objects);
				//console.log('checking', {key, point: check.point, direction: source.velocity.clone().normalize(), near: 0, far: source.velocity.length()});
				for (let intersection of intersects) {
					if (intersection.object.uuid === source.uuid) continue;
					if (shortestVector === null || intersection.distance < shortestVector.distance) {
						shortestVector = intersection;
					}
				}
			}

			if (shortestVector !== null) {
				//console.log(source.name, 'will colide in', shortestVector.distance, 'with', shortestVector.object.name, 'at speed', source.velocity.length(), {source, shortestVector});

				const totalDamping = source.properties.damping * shortestVector.object.properties.damping;

				const distanceCorrection = shortestVector.distance / source.velocity.length();
				source.velocity.multiplyScalar(distanceCorrection).multiplyScalar(shortestVector.distance * 0.5);
				const newCollisionForce = source.velocity.clone().multiplyScalar(-1 * totalDamping);
				

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
		for (let object of this.asArray.movable) {

			if (Math.abs(object.velocity.x) < this.minVelocity) object.velocity.x = 0;
			if (Math.abs(object.velocity.y) < this.minVelocity) object.velocity.y = 0;
			if (Math.abs(object.velocity.z) < this.minVelocity) object.velocity.z = 0;

			object.position.add(object.velocity.clone());

			object.velocity.add(object.colissionForce);
			object.colissionForce.set(0,0,0);

			if (object.properties.renderBoundingBox) object.boundingBox.update();
		};
	}


}