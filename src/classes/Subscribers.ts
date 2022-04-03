
class Subscribers {
	subscribers = [];
	subscriberNextId = 0;


	register(callback) {
		let id = this.subscriberNextId++;
		this.subscribers[id] = callback;
		return id;
	}

	unregister(key) {
		delete this.subscribers[key];
	}
	
	call(...args) {
		for (let key in this.subscribers) {
			this.subscribers[key](...args);
		}
	}
}

export default Subscribers;