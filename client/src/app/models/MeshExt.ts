import * as THREE from 'three';
import { MeshStandardMaterial } from 'three';

export class MeshExt extends THREE.Mesh {
    isSelected: boolean;
    isMouseHovered: boolean;
    material: MeshStandardMaterial;
}