
class ObjectStorage {
	scene = null;

	objectKeyLookup = {};
	objects = [];

	objectCounter = 0;

	constructor(scene) {
		this.scene = scene;
	}

	registerObjects(objects) {
		for (let key in objects) {
			this.register(key, objects[key]);
		}
	}

	initObject(key, object) {
		const uniqueObjectId = this.objectCounter++;

		if (object.properties === undefined) object.properties = {};
		object.properties.id = uniqueObjectId;
		object.properties.key = key;
		if (object.name === "") object.name = key;
		if (object.properties.clickable === undefined) {
			object.properties.clickable = false;
		} else {
			object.properties.clickable = object.properties.clickable.bind(object);
		}

		return uniqueObjectId;
	}

	register(key, object) {
		const uniqueObjectId = this.initObject(key, object);
		
		this.objects[uniqueObjectId] = object;
		this.objectKeyLookup[key] = uniqueObjectId;
		
		this.scene.triggerEvent('objectAdded', object);
		return object;
	}

	unregister(key) {
		const objectId = this.objectKeyLookup[key];
		
		this.scene.triggerEvent('objectRemoved', this.objects[objectId]);

		delete this.objects[objectId];
		delete this.objectKeyLookup[key];
	}

	get(key) {
		return this.objects[this.objectKeyLookup[key]] || null;
	}

	call(method, ...args) {
		for (let object of this.objects) {
			if (object[method] !== undefined) object[method](...args);
		}
	}
}

export default ObjectStorage;