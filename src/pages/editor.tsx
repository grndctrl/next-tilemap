import type { NextPage } from "next";
import { useEffect } from "react";
import Scene from "../components/Scene";
import UserInterface from "../components/UserInterface";

const Editor: NextPage = () => {
  useEffect(() => {}, []);

  return (
    <div className="fixed w-full h-screen bg-slate-900">
      <UserInterface />
      {/* <Scene /> */}
    </div>
  );
};

export default Editor;
