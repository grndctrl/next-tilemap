import { useEffect } from "react";

import { world, track } from "../../public/data.json";

const useDecompressor = () => {
  const init = () => {
    console.log(world);
  };

  return { init };
};

export { useDecompressor };
