import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useInterfaceStore } from "../utils/interfaceStore";
import { colors } from "../utils/tailwindDefaults";

const Controls = () => {
  const { blockMutated, currUISelection } = useInterfaceStore();
  const { camera } = useThree();

  const angle = -15 * (Math.PI / 180);

  return (
    <>
      <OrbitControls
        makeDefault
        enabled={currUISelection === null}
        // enablePan={false}
        // minPolarAngle={Math.PI / 3}
        // maxPolarAngle={Math.PI / 3}
      />

      <GizmoHelper>
        <GizmoViewport
          axisColors={[colors.rose[500], colors.emerald[500], colors.sky[500]]}
          labelColor={colors.slate[700]}
        />
      </GizmoHelper>
    </>
  );
};

export default Controls;
