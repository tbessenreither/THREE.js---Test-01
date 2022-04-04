import * as THREE from 'three';

class CubeTextures {
	

	loadCubeTextures(baseFilename, fileType) {
		const sides = ["rt", "lf", "up", "dn", "ft", "bk"];
		
		//const sides = ["bk", "ft", "up", "dn", "rt", "lf"];
		const pathStrings = sides.map(side => {
			return baseFilename+"_"+side+'.'+fileType;
		});

		let textures = [];
		for (let id in pathStrings) {
			let texture = new THREE.TextureLoader().load(pathStrings[id]);
			let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true, opacity: 1 });
			textures.push(material);
		}
		
		return textures;

	}
}

export default new CubeTextures();