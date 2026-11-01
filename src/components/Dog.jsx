import React from "react";
import * as THREE from "three";
import { useGLTF, OrbitControls, useTexture } from "@react-three/drei";
import dogModel from "../models/dog.drc.glb";
import { useThree } from "@react-three/fiber";

const Dog = () => {
  const { scene } = useGLTF(dogModel);

  useThree(({ camera, scene, gl }) => {
    camera.position.z = 1.6;
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  });

  // const textures = useTexture(
  //   {
  //     normalMap: "/dog_normals.jpg",
  //     something: "/matcap/mat-2.png",
  //   }
  // );

  const [normalMap, matcap] = useTexture([
    "/dog_normals.jpg",
    "/matcap/mat-2.png",
  ]).map((texture) => {
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });

  const dogMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap,
  });

  scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = dogMaterial;
    }
  });

  return (
    <>
      <primitive
        object={scene}
        position={[0.25, -0.5, 1]}
        rotation={[0, 0.8, 0]}
      />
      <directionalLight position={[1, 2, 1]} intensity={10} />
      <OrbitControls />
    </>
  );
};

export default Dog;
