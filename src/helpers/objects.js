import * as THREE from 'three';

import { colorMaterials } from "./materials";


export function getCube(size, position, color, name, properties={}) {
	let geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
	let material = colorMaterials.get(color);
	let cube = new THREE.Mesh(geometry, material);
	cube.name = name;
	cube.position.set(position[0], position[1], position[2]);
	cube.properties = properties;

	let returnData = {};
	returnData[name] = cube;
	return returnData;
}

export function directionCubes(x=0, y=3, z=0) {
	let cubes = {};
	
	const cubeOffset = 2;
	const logFunction = function(){console.log(this)};

	const cubeGeometry = new THREE.BoxGeometry();
	const cubeMiddle = new THREE.Mesh( cubeGeometry, colorMaterials.black );
	cubeMiddle.position.set( x, y, z );
	cubeMiddle.castShadow = false;
	cubeMiddle.receiveShadow = false;
	cubeMiddle.properties = {
		clickable: logFunction,
		label: {
			text: 'middle',
			onTop: true,
		},
		colidable: true,
	};

	const cubeBack = cubeMiddle.clone();
	cubeBack.position.z -= cubeOffset;
	cubeBack.material = colorMaterials.red;
	cubeBack.properties = {
		clickable: logFunction,
		label: {
			text: 'back -z',
			showCondition: 'pointing',
		},
		colidable: true,
	};

	const cubeFront = cubeMiddle.clone();
	cubeFront.position.z += cubeOffset;
	cubeFront.material = colorMaterials.green;
	cubeFront.properties = {
		clickable: logFunction,
		label: {
			text: 'front +z',
			showCondition: 'pointing',
		},
		colidable: true,
	};

	const cubeLeft = cubeMiddle.clone();
	cubeLeft.position.x -= cubeOffset;
	cubeLeft.material = colorMaterials.blue;
	cubeLeft.properties = {
		clickable: logFunction,
		label: {
			text: 'left -x',
			showCondition: 'pointing',
		},
		colidable: true,
	};

	const cubeRight = cubeMiddle.clone();
	cubeRight.position.x += cubeOffset;
	cubeRight.material = colorMaterials.yellow;
	cubeRight.properties = {
		clickable: logFunction,
		label: {
			text: 'right +x',
			showCondition: 'pointing',
		},
		colidable: true,
	};

	const cubeUp = cubeMiddle.clone();
	cubeUp.position.y += cubeOffset;
	cubeUp.material = colorMaterials.magenta;
	cubeUp.properties = {
		clickable: logFunction,
		label: {
			text: 'up +y',
			showCondition: 'pointing',
		},
		colidable: true,
	};

	const cubeDown = cubeMiddle.clone();
	cubeDown.position.y -= 2;
	cubeDown.material = colorMaterials.cyan;
	cubeDown.properties = {
		clickable: logFunction,
		label: {
			text: 'down -y',
			showCondition: 'pointing',
		},
		colidable: true,
	};


	cubes[`directionCubeMiddle`] = cubeMiddle;
	cubes[`directionCubeBack`] = cubeBack;
	cubes[`directionCubeFront`] = cubeFront;
	cubes[`directionCubeLeft`] = cubeLeft;
	cubes[`directionCubeRight`] = cubeRight;
	cubes[`directionCubeUp`] = cubeUp;
	cubes[`directionCubeDown`] = cubeDown;

	return cubes;
}