import { DirectionalLightShadow } from 'three';

const Lighting = (props: JSX.IntrinsicElements['group']) => {
  return (
    <group {...props}>
      <ambientLight intensity={0.25} color="#ede9fe" />
      <directionalLight castShadow position={[100, 100, 10]} intensity={0.75} color="#fef9c3" />
      {/* <pointLight castShadow position={[0, 1, 0]} intensity={0.25} color="#fef9c3" /> */}
    </group>
  );
};

export default Lighting;
