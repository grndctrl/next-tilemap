const Lighting = (props: JSX.IntrinsicElements['group']) => {
  return (
    <group {...props}>
      <ambientLight />
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -5]} />
    </group>
  );
};

export default Lighting;
