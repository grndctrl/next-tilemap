import { Effects } from '@react-three/drei';
import { extend, ReactThreeFiber, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Vector2 } from 'three';
// import { RenderPixelatedPass } from '../utils/RenderPixelatedPass';

// extend({ RenderPixelatedPass });

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       renderPixelatedPass: ReactThreeFiber.Node<RenderPixelatedPass, typeof RenderPixelatedPass>;
//     }
//   }
// }

const PostProcessing = () => {
  const { size, scene, camera, gl } = useThree();
  const resolution = useMemo(() => new Vector2(size.width, size.height), [size]);
  // const renderPixelatedPass = useRef<RenderPixelatedPass | null>(null);

  useEffect(() => {}, []);

  return (
    <>
      {camera.type === 'OrthographicCamera' && (
        <Effects>
          {/* <renderPixelatedPass
            normalEdgeStrength={0.5}
            depthEdgeStrength={0.75}
            ref={renderPixelatedPass}
            args={[resolution, 4, scene, camera]}
          /> */}
        </Effects>
      )}
    </>
  );
};

export default PostProcessing;
