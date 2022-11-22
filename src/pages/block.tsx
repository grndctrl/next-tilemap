import { GizmoHelper, GizmoViewport, Html, OrbitControls, useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { BoxGeometry, BufferAttribute, BufferGeometry, OrthographicCamera, Vector3 } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import {
  BlockType,
  blockVertexTable,
  calcTableIndex,
  generateBlockGeometry,
  getSideGeometry,
  getTopGeometry,
  getTopTriangles,
} from '../utils/blockUtils';
import { blockSize } from '../utils/constants';
import { colors } from '../utils/tailwindDefaults';

const levaTheme = {
  elevation1: colors.slate[200],
  elevation2: colors.slate[300],
  elevation3: colors.slate[400],
  accent1: colors.slate[500],
  accent2: colors.slate[100],
  accent3: colors.slate[100],
  highlight1: colors.slate[600],
  highlight2: colors.slate[700],
  highlight3: colors.slate[900],
  vivid1: colors.teal[600],
  folderWidgetColor: colors.slate[500],
  folderTextColor: colors.slate[500],
  toolTipBackground: colors.slate[900],
  toolTipText: colors.slate[500],
};

const neighbourVertexTable = [
  {
    index: 1,
    position: blockVertexTable[1].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 3,
    position: blockVertexTable[3].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 5,
    position: blockVertexTable[5].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 7,
    position: blockVertexTable[7].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 9,
    position: blockVertexTable[9].clone().multiply(new Vector3(-1.5, 1, 1)),
  },

  {
    index: 2,
    position: blockVertexTable[2].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 0,
    position: blockVertexTable[0].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 6,
    position: blockVertexTable[6].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 4,
    position: blockVertexTable[4].clone().multiply(new Vector3(-1.5, 1, 1)),
  },
  {
    index: 8,
    position: blockVertexTable[8].clone().multiply(new Vector3(-1.5, 1, 1)),
  },

  {
    index: 3,
    position: blockVertexTable[3].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 2,
    position: blockVertexTable[2].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 7,
    position: blockVertexTable[7].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 6,
    position: blockVertexTable[6].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 11,
    position: blockVertexTable[11].clone().multiply(new Vector3(1, 1, -1.5)),
  },

  {
    index: 0,
    position: blockVertexTable[0].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 1,
    position: blockVertexTable[1].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 4,
    position: blockVertexTable[4].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 5,
    position: blockVertexTable[5].clone().multiply(new Vector3(1, 1, -1.5)),
  },
  {
    index: 10,
    position: blockVertexTable[10].clone().multiply(new Vector3(1, 1, -1.5)),
  },

  {
    index: 6,
    position: blockVertexTable[6].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 7,
    position: blockVertexTable[7].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 4,
    position: blockVertexTable[4].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 5,
    position: blockVertexTable[5].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 13,
    position: blockVertexTable[13].clone().multiply(new Vector3(1, -2, 1)),
  },

  {
    index: 2,
    position: blockVertexTable[2].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 3,
    position: blockVertexTable[3].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 0,
    position: blockVertexTable[0].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 1,
    position: blockVertexTable[1].clone().multiply(new Vector3(1, -2, 1)),
  },
  {
    index: 12,
    position: blockVertexTable[12].clone().multiply(new Vector3(1, -2, 1)),
  },
];

type VertexLabelType = {
  index: number;
  color: string;
  background: string;
  isActive: boolean;
  position: Vector3;
  onClick: (index: number) => void;
};

const VertexLabel = ({ isActive, index, position, color, background, onClick }: VertexLabelType) => {
  const styles = useSpring({
    background: isActive ? background : colors.slate[300],
    color: isActive ? color : colors.slate[500],
  });

  return (
    <Html position={position}>
      <animated.div
        onClick={() => onClick(index)}
        className="flex items-center justify-center w-6 h-6 -mt-3 -ml-3 rounded-full cursor-pointer "
        style={styles}>
        {index}
      </animated.div>
    </Html>
  );
};

const block: BlockType = {
  id: 0,
  index: 0,
  parentChunk: 0,
  isActive: true,
  localPosition: new Vector3(),
  worldPosition: new Vector3(),
  neighbours: [],
  vertices: Array.from({ length: 14 }).map(() => true),
};

// const generateBlockGeometry = (id: number, vertices: boolean[], neighbourVertices: boolean[]) => {
//   let hoverGeometry = null;
//   let blockGeometry = null;

//   const topGeometry = getTopGeometry(vertices, [
//     neighbourVertices[25],
//     neighbourVertices[26],
//     neighbourVertices[27],
//     neighbourVertices[28],
//     neighbourVertices[29],
//   ]);

//   if (topGeometry) {
//     const geometries: BufferGeometry[] = [topGeometry];

//     const leftGeometry = getSideGeometry(
//       [0, 2, 4, 6, 8],
//       [vertices[0], vertices[2], vertices[4], vertices[6], vertices[8]],
//       [neighbourVertices[0], neighbourVertices[1], neighbourVertices[2], neighbourVertices[3], neighbourVertices[4]],
//     );
//     if (leftGeometry) {
//       geometries.push(leftGeometry);
//     }

//     const rightGeometry = getSideGeometry(
//       [3, 1, 7, 5, 9],
//       [vertices[3], vertices[1], vertices[7], vertices[5], vertices[9]],
//       [neighbourVertices[5], neighbourVertices[6], neighbourVertices[7], neighbourVertices[8], neighbourVertices[9]],
//     );
//     if (rightGeometry) {
//       geometries.push(rightGeometry);
//     }

//     const backGeometry = getSideGeometry(
//       [1, 0, 5, 4, 10],
//       [vertices[1], vertices[0], vertices[5], vertices[4], vertices[10]],
//       [
//         neighbourVertices[10],
//         neighbourVertices[11],
//         neighbourVertices[12],
//         neighbourVertices[13],
//         neighbourVertices[14],
//       ],
//     );
//     if (backGeometry) {
//       geometries.push(backGeometry);
//     }

//     const frontGeometry = getSideGeometry(
//       [2, 3, 6, 7, 11],
//       [vertices[2], vertices[3], vertices[6], vertices[7], vertices[11]],
//       [
//         neighbourVertices[15],
//         neighbourVertices[16],
//         neighbourVertices[17],
//         neighbourVertices[18],
//         neighbourVertices[19],
//       ],
//     );
//     if (frontGeometry) {
//       geometries.push(frontGeometry);
//     }

//     blockGeometry = mergeBufferGeometries(geometries);

//     if (blockGeometry) {
//       console.log(blockGeometry);

//       const idArray = new Int32Array(
//         Array.from({
//           length: blockGeometry.getAttribute('position').array.length / 3,
//         }).map(() => id),
//       );

//       const idAttribute = new BufferAttribute(idArray, 1);
//       blockGeometry.setAttribute('id', idAttribute);
//     }
//   }

//   return { hoverGeometry, blockGeometry };
// };

const Block = () => {
  const [neighbourVertices, setNeighbourVertices] = useState<boolean[]>(Array.from({ length: 30 }).map(() => false));
  const [vertices, setVertices] = useState<boolean[]>(Array.from({ length: 14 }).map(() => true));
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [geometries, setGeometries] = useState<BufferGeometry[] | null>(null);
  const uvMap = useTexture('uv.jpg');

  const styles = useSpring({
    background: geometry ? colors.slate[200] : colors.rose[500],
    color: geometry ? colors.slate[600] : colors.rose[900],
  });

  const { showVertices, showNeighbours, showUv } = useControls('Toggle', {
    showVertices: false,
    showNeighbours: false,
    showUv: false,
  });

  const edges = new BoxGeometry(blockSize.x, blockSize.y, blockSize.z);

  const handleVertexClick = (index: number) => {
    console.log(index, vertices[index]);

    const currVertices = vertices.slice();
    currVertices[index] = !currVertices[index];
    setVertices(currVertices);
  };

  const handleNeighbourClick = (index: number) => {
    console.log(index, vertices[index]);

    const currVertices = neighbourVertices.slice();
    currVertices[index] = !currVertices[index];
    setNeighbourVertices(currVertices);
  };

  useEffect(() => {
    const { blockGeometry, geometries: blockGeometries } = generateBlockGeometry(0, vertices, neighbourVertices);
    setGeometry(blockGeometry);
    setGeometries(blockGeometries);
    // console.log('🚀 ~ file: block.tsx ~ line 325 ~ blockGeometry', blockGeometry);
    // console.log('🚀 ~ file: block.tsx ~ line 326 ~ blockGeometries', blockGeometries);
  }, [neighbourVertices, vertices]);

  return (
    <group>
      <lineSegments>
        <edgesGeometry args={[edges]} />
        <lineBasicMaterial color={colors.violet[500]} linewidth={2} />
      </lineSegments>

      <Html position={[0, -2 * blockSize.y, 0]}>
        <animated.div className="px-4 py-2 rounded-full" style={styles}>
          {calcTableIndex(vertices)}
        </animated.div>
      </Html>

      {showVertices &&
        vertices.map((isActive, index) => (
          <VertexLabel
            onClick={handleVertexClick}
            key={`v-${index}`}
            color={colors.amber[800]}
            background={colors.amber[400]}
            isActive={isActive}
            position={blockVertexTable[index]}
            index={index}
          />
        ))}

      {showNeighbours &&
        neighbourVertices.map((isActive, neighbourIndex) => {
          const { index, position } = neighbourVertexTable[neighbourIndex];
          return (
            <VertexLabel
              onClick={handleNeighbourClick}
              key={`n-${neighbourIndex}`}
              color={colors.teal[800]}
              background={colors.teal[400]}
              isActive={isActive}
              position={position}
              index={neighbourIndex}
            />
          );
        })}

      {geometry && (
        <mesh geometry={geometry}>
          {showUv && <meshBasicMaterial map={uvMap} />}
          {!showUv && <meshNormalMaterial />}
        </mesh>
      )}
      {/* <>
        {geometries &&
          geometries.map((geom, index) => (
            <mesh key={'geom' + index} geometry={geom}>
              {showUv && <meshBasicMaterial map={uvMap} />}
              {!showUv && <meshNormalMaterial />}
            </mesh>
          ))}
      </> */}
    </group>
  );
};

const Page: NextPage = () => {
  const camera = new OrthographicCamera();

  camera.position.set(-100, 100, 100);
  camera.zoom = 24;
  camera.rotation.set(-30 * (Math.PI / 180), -Math.PI / 4, 0, 'YXZ');
  camera.near = 0.1;
  camera.far = 1000;

  return (
    <div className="fixed w-full h-screen bg-amber-50">
      <Leva theme={{ colors: levaTheme }} />
      <Canvas camera={camera} dpr={1}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[-2, 3, -1]} intensity={1} />
        <Block />
        <GizmoHelper>
          <GizmoViewport
            axisColors={[colors.rose[500], colors.emerald[500], colors.sky[500]]}
            labelColor={colors.slate[700]}
          />
        </GizmoHelper>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
};

export default Page;
