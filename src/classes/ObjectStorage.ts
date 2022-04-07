
class ObjectStorage {
	objects = {};
	physicsObjects = {};
	physicsObjectsArray = [];

	constructor() {
	}

	_physicsObjectsUpdated() {
		 this.physicsObjectsArray = Object.values(this.physicsObjects);
	}

	registerObjects(objects) {
		for (let key in objects) {
			this.register(key, objects[key]);
		}
	}

	register(key, object) {
		this.objects[key] = object;

		if (object.constructor.name === "PhysicsObject") {
			object._isPhysicsObject = true;
			this.physicsObjects[key] = object;
			this._physicsObjectsUpdated();
		}

		object.key = key;

		return object;
	}

	unregister(key) {
		if (this.objects[key] === undefined) return true;

		if (this.objects[key]._isPhysicsObject) {
			delete this.physicsObjects[key];
			this._physicsObjectsUpdated();
		}
		delete this.objects[key];
	}

	get(key) {
		if (this.objects[key] !== undefined) {
			return this.objects[key];
		} else {
			return null;
		}
	}

	call(method, ...args) {
		for (let key in this.objects) {
			if (this.objects[key][method] !== undefined) {
				this.objects[key][method](...args);
			}
		}
	}
	
	getPhysicsObjects() {
		return this.physicsObjects;
	}
	
	getPhysicsObjectsAsArray() {
		return this.physicsObjectsArray;
	}
}

export default ObjectStorage;