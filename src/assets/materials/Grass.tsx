import { useTexture } from '@react-three/drei';
import { useControls } from 'leva';

const GrassMaterial = () => {
  const uvMap = useTexture('uv.jpg');
  const { materialColor, emissive, roughness, metalness, reflectivity, clearcoat, clearcoatRoughness } = useControls({
    materialColor: '#007580',
    emissive: '#609300',
    roughness: {
      value: 1,
      min: 0,
      max: 1,
    },
    metalness: {
      value: 0,
      min: 0,
      max: 1,
    },
    reflectivity: {
      value: 0,
      min: 0,
      max: 1,
    },
    clearcoat: {
      value: 0.5,
      min: 0,
      max: 1,
    },
    clearcoatRoughness: {
      value: 1,
      min: 0,
      max: 1,
    },
  });

  return <meshBasicMaterial map={uvMap} />;
};

export default GrassMaterial;

{
  /* <meshPhysicalMaterial
  color={materialColor}
  {...{
    emissive,
    roughness,
    metalness,
    reflectivity,
    clearcoat,
    clearcoatRoughness,
  }}
/> */
}
