
class ObjectStorage {
	objects = {};

	registerObjects(objects) {
		for (let key in objects) {
			this.register(key, objects[key]);
		}
	}

	register(key, object) {
		this.objects[key] = object;
		return object;
	}

	unregister(key) {
		delete this.objects[key];
	}

	get(key) {
		if (this.objects[key] !== undefined) {
			return this.objects[key];
		} else {
			return null;
		}
	}
}

export default ObjectStorage;