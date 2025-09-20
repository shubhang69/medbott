'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Brain(props: any) {
  const { scene } = useGLTF(
    'https://cdn.jsdelivr.net/gh/studio-bison/shared-assets/models/brain-simple-v2.glb'
  );
  const ref = useRef<THREE.Group>(null!);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += 0.1 * delta;
    }
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

export function BrainModel() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 50 }}
      className="h-full w-full"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#2EC1B1" />

      <Suspense fallback={null}>
        <Brain />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
