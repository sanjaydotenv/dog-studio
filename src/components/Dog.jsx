import React, { useEffect } from "react";
import * as THREE from "three";
import {
  useGLTF,
  OrbitControls,
  useTexture,
  useAnimations,
} from "@react-three/drei";
import dogModel from "../models/dog.drc.glb";
import { useThree } from "@react-three/fiber";

const Dog = () => {
  const model = useGLTF(dogModel);

  useThree(({ camera, scene, gl }) => {
    camera.position.z = 1.6;
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  });

  const { actions } = useAnimations(model.animations, model.scene);

  useEffect(() => {
    actions["Take 001"].play();
  }, [actions]);

  // const textures = useTexture(
  //   {
  //     normalMap: "/dog_normals.jpg",
  //     something: "/matcap/mat-2.png",
  //   }
  // );

  const [normalMap, matcap, branchMap, branchNormalMap] = useTexture([
    "/dog_normals.jpg",
    "/matcap/mat-2.png",
    "branches_diffuse.jpg",
    "branches_normals.jpg",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const dogMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap,
  });

  const branchMaterial = new THREE.MeshMatcapMaterial({
    normalMap: branchNormalMap,
    map: branchMap,
  });

  model.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = dogMaterial;
    } else {
      child.material = branchMaterial;
    }
  });

  return (
    <>
      <primitive
        object={model.scene}
        position={[0.25, -0.5, 1]}
        rotation={[0, 0.8, 0]}
      />
      <directionalLight position={[1, 2, 1]} intensity={10} />
    </>
  );
};

export default Dog;
