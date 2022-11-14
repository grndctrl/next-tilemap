import PlayScene from "components/PlayScene";
import UserInterface from "components/UserInterface";
import { useImporter } from "hooks/generator";
import type { NextPage } from "next";
import Progress from "ui/Progress";
import { useEffect } from "react";
import { useInterfaceStore } from "utils/interfaceStore";
import { WorldGeneratorState } from "core/World/hooks";

const Home: NextPage = () => {
  const { init, progress, isLoading } = useImporter();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black">
      {isLoading && (
        <div className="w-1/2">
          <Progress value={progress.current} />
        </div>
      )}
      {!isLoading && (
        <>
          <PlayScene />
        </>
      )}
    </div>
  );
};

export default Home;
