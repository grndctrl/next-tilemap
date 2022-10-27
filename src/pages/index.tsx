import type { NextPage } from 'next';
import Scene from '../components/Scene';
import UserInterface from '../components/UserInterface';

const Home: NextPage = () => {
  return (
    <div className="fixed w-full h-screen bg-slate-900">
      <UserInterface />
      <Scene />
    </div>
  );
};

export default Home;
