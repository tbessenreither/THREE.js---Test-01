
import * as THREE from 'three';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';


const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

export function loadGlbAsync(path) {
	return new Promise((resolve, reject) => {
		dracoLoader.setDecoderPath( 'js/libs/draco/gltf/' );
		loader.setDRACOLoader( dracoLoader );
		loader.load( 'models/house.glb', (gltf)=>{

			gltf.scene.castShadow = ()=>{
				gltf.scene.traverse( function( node ) {
					if ( node.isMesh ) {
						node.castShadow = true;
					}
				});
			};
			gltf.scene.receiveShadow = ()=>{
				gltf.scene.traverse( function( node ) {
					if ( node.isMesh ) {
						node.receiveShadow = true;
					}
				});
			};

			return resolve(gltf.scene);
		}, undefined, function ( e ) {
			return reject(e);
		} );/** */
	});
}