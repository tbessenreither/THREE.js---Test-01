import * as THREE from 'three';

export const colorMaterials = {
	get(color) {
		if (colorMaterials[color]) {
			return colorMaterials[color];
		} else {
			return colorMaterials.black;
		}
	},
	black: new THREE.MeshStandardMaterial( { color: 0x000000 } ),
	white: new THREE.MeshStandardMaterial( { color: 0xffffff } ),
	red: new THREE.MeshStandardMaterial( { color: 0xff0000 } ),
	green: new THREE.MeshStandardMaterial( { color: 0x00ff00 } ),
	blue: new THREE.MeshStandardMaterial( { color: 0x0000ff } ),
	yellow: new THREE.MeshStandardMaterial( { color: 0xffff00 } ),
	magenta: new THREE.MeshStandardMaterial( { color: 0xff00ff } ),
	cyan: new THREE.MeshStandardMaterial( { color: 0x00ffff } ),
};
