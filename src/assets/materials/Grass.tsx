import { useTexture } from '@react-three/drei';
import { useControls } from 'leva';

const GrassMaterial = () => {
  const [albedoMap, aoMap, displacementMap, metalnessMap, normalMap, roughnessMap] = useTexture([
    'materials/grass/albedo.png',
    'materials/grass/ao.png',
    'materials/grass/displacement.png',
    'materials/grass/metalness.png',
    'materials/grass/normal.png',
    'materials/grass/roughness.png',
  ]);
  const { materialColor, emissive, roughness, metalness, reflectivity, clearcoat, clearcoatRoughness } = useControls(
    'grass',
    {
      materialColor: '#ffffd7',
      emissive: '#0a0b0d',
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
        value: 0.05,
        min: 0,
        max: 1,
      },
      clearcoatRoughness: {
        value: 1,
        min: 0,
        max: 1,
      },
    },
  );

  return (
    <meshPhysicalMaterial
      color={materialColor}
      emissive={emissive}
      reflectivity={reflectivity}
      clearcoat={clearcoat}
      clearcoatRoughness={clearcoatRoughness}
      map={albedoMap}
      metalnessMap={metalnessMap}
      roughnessMap={roughnessMap}
      bumpMap={displacementMap}
    />
  );
};

export default GrassMaterial;
