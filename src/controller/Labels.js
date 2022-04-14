import spriteGenerator from '../classes/SpriteGenerator';

export default class Labels {
	scene = null;

	labels = {};

	constructor(scene) {
		this.scene = scene;

		this.scene.addEventListener('objectAdded', this.onObjectAdded.bind(this));
		this.scene.addEventListener('objectRemoved', this.onObjectRemoved.bind(this));
		this.scene.addEventListener('gameTick2', this.tick.bind(this));
		this.scene.addEventListener('pointingStart', this.pointingStart.bind(this));
		this.scene.addEventListener('pointingEnd', this.pointingEnd.bind(this));
	}

	initObject(object) {
		if (object.properties.label === undefined) {
			object.properties.label = false;
		} else {
			object.properties.pointable = true;
			if (typeof object.properties.label === "string") {
				object.properties.label = {
					text: object.properties.label,
				};
			}

			//if (object.properties.label.text === undefined) object.properties.label.text = "";
			if (object.properties.label.visible === undefined) object.properties.label.visible = "pointing";
			
			if (object.properties.label.onTop === undefined) {
				if (object.properties.label.visible === "pointing") {
					object.properties.label.onTop = true;
				} else {
					object.properties.label.onTop = false;
				}
			}
			if (object.properties.label.fontSize === undefined) object.properties.label.fontSize = 0.5;
			
		}


		return object;
	}

	onObjectAdded(object) {
		this.initObject(object);

		if (object.properties.label === false) return;

		/*
		const sprite = new TextSprite({
			alignment: 'center',
			color: 'black',
			fontFamily: 'Verdana',
			backgroundColor: 'rgba(255,255,255,0.5)',
			fontSize: object.properties.label.fontSize,
			text: object.properties.label.text,
		});/** */


		const sprite = spriteGenerator.fromText(object.properties.label.text);
		object.properties.label.object = sprite;
		object.properties.label.parent = object;

		sprite.material.depthTest = !object.properties.label.onTop;
		sprite.material.depthWrite = !object.properties.label.onTop;

		this.labels[object.properties.label.object.uuid] = object.properties.label;

		this.scene.addOne(object.properties.label.object.uuid, object.properties.label.object);

		this.pointingEnd(object);
		this.updateLabelPosition(object.properties.label);
		
	}

	onObjectRemoved(object) {
		if (object.properties.label === false) return;

		delete this.labels[object.properties.label.object.uuid];

	}

	pointingStart(object) {
		if (object.properties.label === false) return;

		if (object.properties.label.visible === "pointing") {
			object.properties.label.object.visible = true;
		}
	}

	pointingEnd(object) {
		if (object.properties.label === false) return;

		if (object.properties.label.visible === "pointing") {
			object.properties.label.object.visible = false;
		}
	}

	tick(delta) {
		for (let label of Object.values(this.labels)) {
			this.updateLabelPosition(label);
		}
	}

	updateLabelPosition(label) {
		label.object.position.copy(label.parent.position);
		label.object.position.y += label.parent.geometry.boundingBox.max.y;
	}


}