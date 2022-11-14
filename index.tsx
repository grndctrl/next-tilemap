import Generator from 'components/Generator';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useInterfaceStore } from 'utils/interfaceStore';
import Scene from 'components/Scene';
import UserInterface from 'components/UserInterface';
import Button from 'ui/Button';
import Progress from 'ui/Progress';

const Home: NextPage = () => {
  const isGeneratingWorld = useInterfaceStore((state) => state.isGeneratingWorld);
  const toggleGeneratingWorld = useInterfaceStore((state) => state.toggleGeneratingWorld);

  useEffect(() => {
    toggleGeneratingWorld(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black">
      {isGeneratingWorld && <Generator />}
      {!isGeneratingWorld && (
        <>
          <UserInterface />
          <Scene />
        </>
      )}
    </div>
  );
};

export default Home;
