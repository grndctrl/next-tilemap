import type { NextPage } from 'next';
import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls, Torus } from '@react-three/drei';
import { Debug, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useEffect } from 'react';
import { Car } from '../components/Car';

const Page: NextPage = () => {
  useEffect(() => {
    window.addEventListener('keydown', (event) => {
      console.log(event.key);
    });
  }, []);

  return (
    <div className="fixed w-full h-screen">
      <Canvas shadows>
        <OrbitControls />
        <directionalLight position={[2, 2, 2]} castShadow />
        <Suspense>
          <Physics>
            {/* <Debug /> */}
            <Car />

            {/* <RigidBody colliders={'hull'} restitution={1}>
              <Torus castShadow receiveShadow>
                <meshStandardMaterial />
              </Torus>
            </RigidBody> */}

            <RigidBody colliders={'hull'} position={[0, -2, 0]} type="kinematicPosition">
              <Box args={[200, 0.5, 200]} castShadow receiveShadow>
                <meshStandardMaterial />
              </Box>
            </RigidBody>
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Page;
