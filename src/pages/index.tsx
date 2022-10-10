import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { NextPage } from 'next';
import { Suspense } from 'react';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';

const Home: NextPage = () => {
  return (
    <div className="fixed w-full h-screen">
      <UserInterface />
      <Scene />
    </div>
  );
};

export default Home;
