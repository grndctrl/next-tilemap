const Lighting = (props: JSX.IntrinsicElements['group']) => {
  return (
    <group {...props}>
      <ambientLight intensity={0.25} color="#ede9fe" />
      <directionalLight position={[3, 4, 2]} intensity={0.75} color="#fef9c3" />
    </group>
  );
};

export default Lighting;
