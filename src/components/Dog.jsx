import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  useGLTF,
  OrbitControls,
  useTexture,
  useAnimations,
} from "@react-three/drei";
import dogModel from "../models/dog.drc.glb";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Dog = () => {
  gsap.registerPlugin(useGSAP);
  gsap.registerPlugin(ScrollTrigger);

  const model = useGLTF(dogModel);

  useThree(({ camera, scene, gl }) => {
    camera.position.z = 1.5;
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  });

  const { actions } = useAnimations(model.animations, model.scene);

  useEffect(() => {
    actions["Take 001"].play();
  }, [actions]);

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

  const modelRef = useRef(model);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-1",
        endTrigger: "#section-3",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(modelRef.current.scene.position, {
      z: "-=0.4",
      y: "+=0.1"
    }).to(modelRef.current.scene.rotation , {
      x: `+=${Math.PI / 17.5}`
    }).to(modelRef.current.scene.rotation , {
      y: `-=${Math.PI + 0.1}`
    }, "third").to(modelRef.current.scene.position , {
      x: "-=0.5",
      z: "+=0.3",
      y: "-=0.1"
      
    }, "third")
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
