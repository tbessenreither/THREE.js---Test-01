import * as THREE from 'three';

class SpriteGenerator {
	roundRect(ctx, x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	fromText(message, parameters) {
		if (parameters === undefined) parameters = {};
		var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
		var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 50;
		var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
		var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };
		var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 0.8 };
		var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');

		context.font = "Bold " + fontsize + "px " + fontface;
		var metrics = context.measureText(message);
		var textWidth = metrics.width;

		context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
		context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

		context.lineWidth = borderThickness;
		let borderHeight = fontsize * 1.4 + borderThickness;
		let borderWidth = canvas.width - borderThickness;
		let startPosition = canvas.height - borderHeight;
		this.roundRect(context, borderThickness / 2, startPosition, borderWidth, borderHeight, 8);

		let spaceAroundText = canvas.width - (textWidth + borderThickness + borderThickness);
		let spaceLeft = (spaceAroundText / 2);

		context.fillStyle = "rgba(" + textColor.r + ", " + textColor.g + ", " + textColor.b + ", 1.0)";
		context.fillText(message, spaceLeft, canvas.height - ((fontsize - borderThickness) / 2), canvas.width);

		var texture = new THREE.Texture(canvas)
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
		var sprite = new THREE.Sprite(spriteMaterial);
		let scaleFactor = 0.015;
		sprite.scale.set(scaleFactor * canvas.width, scaleFactor * canvas.height);
		sprite.center.set(0.5, 0);
		
		return sprite;
	}
}

export default new SpriteGenerator();