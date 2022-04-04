
class Subscribers {
	subscribers = [];
	subscriberNextId = 0;

	sendOldData = false;
	lastData = null;

	constructor(sendOldData = false) {
		this.sendOldData = sendOldData;
	}

	register(callback) {
		let id = this.subscriberNextId++;
		this.subscribers[id] = callback;

		if (this.sendOldData && this.lastData) {
			callback(...this.lastData);
		}

		return id;
	}

	unregister(key) {
		delete this.subscribers[key];
	}
	
	call(...args) {
		if (this.sendOldData) {
			this.lastData = args;
		}
		for (let key in this.subscribers) {
			this.subscribers[key](...args);
		}
	}
}

export default Subscribers;