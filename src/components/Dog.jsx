import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useGLTF, useTexture, useAnimations } from "@react-three/drei";

import { useThree } from "@react-three/fiber";

import dogModelAsset from "../models/dog.drc.glb";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins outside component
gsap.registerPlugin(useGSAP, ScrollTrigger);

const Dog = () => {
  // Load model
  const model = useGLTF(dogModelAsset);

  const modelRef = useRef(null);

  // Three.js settings
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.z = 0.55;

    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [camera, gl]);

  // Animation
  const { actions } = useAnimations(model.animations, model.scene);

  useEffect(() => {
    const action = actions["Take 001"];

    action?.reset().play();

    return () => {
      action?.stop();
    };
  }, [actions]);

  // Dog normal map
  const [normalMap] = useTexture(["/dog_normals.jpg"]);

  // Branch textures
  const [branchMap, branchNormalMap] = useTexture([
    "/branches_diffuse.jpg",
    "/branches_normals.jpg",
  ]);

  // All 20 Matcaps
  const [
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
    mat7,
    mat8,
    mat9,
    mat10,
    mat11,
    mat12,
    mat13,
    mat14,
    mat15,
    mat16,
    mat17,
    mat18,
    mat19,
    mat20,
  ] = useTexture(
    Array.from({ length: 20 }, (_, index) => `/matcap/mat-${index + 1}.png`),
  );

  // Texture configuration
  useMemo(() => {
    const colorTextures = [
      branchMap,
      mat1,
      mat2,
      mat3,
      mat4,
      mat5,
      mat6,
      mat7,
      mat8,
      mat9,
      mat10,
      mat11,
      mat12,
      mat13,
      mat14,
      mat15,
      mat16,
      mat17,
      mat18,
      mat19,
      mat20,
    ];
    colorTextures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
    });

    [normalMap, branchNormalMap].forEach((texture) => {
      texture.colorSpace = THREE.NoColorSpace;
      texture.flipY = false;
    });
  }, [
    normalMap,
    branchMap,
    branchNormalMap,
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
    mat7,
    mat8,
    mat9,
    mat10,
    mat11,
    mat12,
    mat13,
    mat14,
    mat15,
    mat16,
    mat17,
    mat18,
    mat19,
    mat20,
  ]);

  // Shader uniforms
  const material = useRef({
    uMatcap1: { value: mat19 },
    uMatcap2: { value: mat2 },
    uProgress: { value: 1.0 },
  });

  // Dog material
  const dogMaterial = useMemo(() => {
    const mat = new THREE.MeshMatcapMaterial({
      normalMap,
      matcap: mat2,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uMatcapTexture1 = material.current.uMatcap1;

      shader.uniforms.uMatcapTexture2 = material.current.uMatcap2;

      shader.uniforms.uProgress = material.current.uProgress;

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
      uniform sampler2D uMatcapTexture1;
      uniform sampler2D uMatcapTexture2;
      uniform float uProgress;

      void main() {
    `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "vec4 matcapColor = texture2D( matcap, uv );",
        `
      vec4 matcapColor1 = texture2D(
        uMatcapTexture1,
        uv
      );

      vec4 matcapColor2 = texture2D(
        uMatcapTexture2,
        uv
      );

      float transitionFactor = 0.2;

      float progress = smoothstep(
        uProgress - transitionFactor,
        uProgress,
        (vViewPosition.x + vViewPosition.y) * 0.5 + 0.5
      );

      vec4 matcapColor = mix(
        matcapColor2,
        matcapColor1,
        progress
      );
    `,
      );
    };

    return mat;
  }, [normalMap, mat2]);

  // Branch material
  const branchMaterial = useMemo(() => {
    return new THREE.MeshMatcapMaterial({
      normalMap: branchNormalMap,
      map: branchMap,
    });
  }, [branchNormalMap, branchMap]);

  // Assign materials
  useEffect(() => {
    model.scene.traverse((child) => {
      if (!child.isMesh) return;

      if (child.name.includes("DOG")) {
        child.material = dogMaterial;
      } else {
        child.material = branchMaterial;
      }
    });
  }, [model.scene, dogMaterial, branchMaterial]);

  // GSAP scroll animation
  useGSAP(
    () => {
      const dog = modelRef.current;

      if (!dog) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#section-1",
          endTrigger: "#section-3",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      tl.to(dog.position, {
        z: "-=0.75",
        y: "+=0.1",
      })
        .to(dog.rotation, {
          x: `+=${Math.PI / 15}`,
        })
        .to(
          dog.rotation,
          {
            y: `-=${Math.PI}`,
          },
          "third",
        )
        .to(
          dog.position,
          {
            x: "-=0.5",
            z: "+=0.6",
            y: "-=0.05",
          },
          "third",
        );
    },
    {
      dependencies: [model.scene],
    },
  );

  // Matcap transition function
  const changeMatcap = (newMatcap) => {
    const uniforms = material.current;

    gsap.killTweensOf(uniforms.uProgress);

    uniforms.uMatcap1.value = newMatcap;

    gsap.to(uniforms.uProgress, {
      value: 0,
      duration: 0.3,

      onComplete: () => {
        uniforms.uMatcap2.value = uniforms.uMatcap1.value;

        uniforms.uProgress.value = 1;
      },
    });
  };

  // Hover events
  useEffect(() => {
    const hoverElements = [
      ["tomorrowland", mat19],
      ["navy-pier", mat8],
      ["msi-chicago", mat9],
      ["phone", mat12],
      ["kikk", mat10],
      ["kennedy", mat8],
      ["opera", mat13],
    ];

    const listeners = [];

    hoverElements.forEach(([title, matcap]) => {
      const element = document.querySelector(`#title[img-title="${title}"]`);

      if (!element) return;

      const handler = () => changeMatcap(matcap);

      element.addEventListener("mouseenter", handler);

      listeners.push({
        element,
        event: "mouseenter",
        handler,
      });
    });

    const titles = document.querySelector("#leave-div");

    const leaveHandler = () => changeMatcap(mat2);

    if (titles) {
      titles.addEventListener("mouseleave", leaveHandler);

      listeners.push({
        element: titles,
        event: "mouseleave",
        handler: leaveHandler,
      });
    }

    return () => {
      listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });

      gsap.killTweensOf(material.current.uProgress);
    };
  }, [mat2, mat8, mat9, mat10, mat12, mat13, mat19]);

  return (
    <>
      <primitive
        ref={modelRef}
        object={model.scene}
        position={[0.25, -0.55, 0]}
        rotation={[0, Math.PI / 3.9, 0]}
      />

      <directionalLight position={[0, 5, 5]} color={0xffffff} intensity={10} />
    </>
  );
};

export default Dog;

useGLTF.preload(dogModelAsset);
