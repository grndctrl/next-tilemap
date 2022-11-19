import { GetBlock } from 'core/World';
import { BufferAttribute, BufferGeometry, Vector2, Vector3 } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { blockSize } from './constants';

export type BlockType = {
  id: number;
  index: number;
  parentChunk: number;
  isActive: boolean;
  localPosition: Vector3;
  worldPosition: Vector3;
  neighbours: number[];
  vertices: boolean[];
};

const blockVertexPositionTable = [
  new Vector3(-1, -1, -1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(1, -1, -1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(-1, -1, 1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(1, -1, 1).multiply(blockSize).multiplyScalar(0.5),

  new Vector3(-1, 1, -1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(1, 1, -1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(-1, 1, 1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(1, 1, 1).multiply(blockSize).multiplyScalar(0.5),

  new Vector3(-1, 0, 0).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(1, 0, 0).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(0, 0, -1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(0, 0, 1).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(0, -1, 0).multiply(blockSize).multiplyScalar(0.5),
  new Vector3(0, 1, 0).multiply(blockSize).multiplyScalar(0.5),
];

const topUvTable = [
  new Vector2(0, 0),
  new Vector2(1, 0),
  new Vector2(0, 1),
  new Vector2(1, 1),
  //
  new Vector2(0, 0),
  new Vector2(1, 0),
  new Vector2(0, 1),
  new Vector2(1, 1),
  //
  new Vector2(0, 0.5),
  new Vector2(1, 0.5),
  new Vector2(0.5, 0),
  new Vector2(0.5, 1),
  new Vector2(0.5, 0.5),
  new Vector2(0.5, 0.5),
];

const blockTriangleTable = [
  // full
  {
    index: 16383,
    triangles: [
      [4, 13, 5],
      [5, 13, 7],
      [7, 13, 6],
      [6, 13, 4],
    ],
    uv: [
      [
        [0, 0],
        [0.5, 0.5],
        [1, 0],
      ],
      [
        [1, 0],
        [0.5, 0.5],
        [1, 1],
      ],
      [
        [1, 1],
        [0.5, 0.5],
        [0, 1],
      ],
      [
        [0, 1],
        [0.5, 0.5],
        [0, 0],
      ],
    ],
  },

  // corner ramp
  {
    index: 16367,
    triangles: [
      [0, 8, 10],
      [10, 8, 13],
      [8, 6, 13],
      [10, 13, 5],
      [5, 13, 7],
      [7, 13, 6],
    ],
  },
  {
    index: 16351,
    triangles: [
      [1, 10, 9],
      [9, 10, 13],
      [10, 4, 13],
      [9, 13, 7],
      [6, 13, 4],
      [7, 13, 6],
    ],
  },
  {
    index: 16319,
    triangles: [
      [2, 11, 8],
      [8, 11, 13],
      [11, 7, 13],
      [8, 13, 4],
      [4, 13, 5],
      [5, 13, 7],
    ],
  },
  {
    index: 16255,
    triangles: [
      [3, 9, 11],
      [11, 9, 13],
      [9, 5, 13],
      [11, 13, 6],
      [6, 13, 4],
      [4, 13, 5],
    ],
  },

  // ramp
  {
    index: 7855,
    triangles: [
      [2, 11, 0],
      [0, 11, 10],
      [11, 7, 10],
      [5, 10, 7],
    ],
  },
  {
    index: 7519,
    triangles: [
      [1, 10, 3],
      [3, 10, 11],
      [4, 11, 10],
      [6, 11, 4],
    ],
  },
  {
    index: 7119,
    triangles: [
      [0, 8, 1],
      [1, 8, 9],
      [6, 7, 8],
      [7, 9, 8],
    ],
  },
  {
    index: 5951,
    triangles: [
      [3, 9, 2],
      [2, 9, 8],
      [9, 5, 8],
      [4, 8, 5],
    ],
  },

  // valley
  {
    index: 8095,
    triangles: [
      [1, 10, 12],
      [12, 10, 8],
      [2, 12, 8],
      [4, 8, 10],
      [2, 11, 12],
      [12, 11, 9],
      [1, 12, 9],
      [7, 9, 11],
    ],
  },
  {
    index: 8047,
    triangles: [
      [0, 8, 12],
      [12, 8, 11],
      [3, 12, 11],
      [6, 11, 8],

      [3, 9, 12],
      [12, 9, 10],
      [0, 12, 10],
      [5, 10, 9],
    ],
  },

  // ramp corner
  {
    index: 6798,
    triangles: [
      [2, 11, 12],
      [12, 11, 9],
      [1, 12, 9],
      [7, 9, 11],
    ],
  },
  {
    index: 6477,
    triangles: [
      [0, 8, 12],
      [12, 8, 11],
      [3, 12, 11],
      [6, 11, 8],
    ],
  },
  {
    index: 5675,
    triangles: [
      [3, 9, 12],
      [12, 9, 10],
      [0, 12, 10],
      [5, 10, 9],
    ],
  },
  {
    index: 5399,
    triangles: [
      [1, 10, 12],
      [12, 10, 8],
      [2, 12, 8],
      [4, 8, 10],
    ],
  },
];

//

const calcTableIndex = (vertices: boolean[]): number => {
  if (vertices.length === 0) {
    return -1;
  }

  return vertices
    .map((vertex, index) => (vertex ? Math.pow(2, index) : 0))
    .reduce((previous, current) => previous + current);
};

//

const calcNeighboursForWorldPosition = (worldPosition: Vector3, worldSize: Vector3) => {
  const minWorldSize = worldSize.clone().divideScalar(-2);
  const maxWorldSize = worldSize.clone().divideScalar(2);

  const leftPosition = worldPosition.clone().add(new Vector3(-blockSize.x, 0, 0));
  const rightPosition = worldPosition.clone().add(new Vector3(blockSize.x, 0, 0));
  const backPosition = worldPosition.clone().add(new Vector3(0, 0, -blockSize.z));
  const frontPosition = worldPosition.clone().add(new Vector3(0, 0, blockSize.z));
  const bottomPosition = worldPosition.clone().add(new Vector3(0, -blockSize.y, 0));
  const topPosition = worldPosition.clone().add(new Vector3(0, blockSize.y, 0));

  return [leftPosition, rightPosition, backPosition, frontPosition, bottomPosition, topPosition];
};

//

// const generateBlockGeometry = ({ index, neighbours, vertices }: BlockType) => {
//   const getBlock = worldStore.getState().getBlock;

//   const neighbourBlocks = neighbours.map((neighbour) => (neighbour ? getBlock(neighbour) : null));
//   const neighbourVertices: boolean[] = getNeighbourVerticesForNeighboursInBlocks(neighbourBlocks);

//   const topTriangles = getTopTriangles(vertices, [
//     neighbourVertices[25],
//     neighbourVertices[26],
//     neighbourVertices[27],
//     neighbourVertices[28],
//     neighbourVertices[29],
//   ]);

//   if (topTriangles) {
//     const leftTriangles = getSideTriangles(
//       [0, 2, 4, 6, 8],
//       [vertices[0], vertices[2], vertices[4], vertices[6], vertices[8]],
//       [neighbourVertices[0], neighbourVertices[1], neighbourVertices[2], neighbourVertices[3], neighbourVertices[4]]
//     );

//     const rightTriangles = getSideTriangles(
//       [3, 1, 7, 5, 9],
//       [vertices[3], vertices[1], vertices[7], vertices[5], vertices[9]],
//       [neighbourVertices[5], neighbourVertices[6], neighbourVertices[7], neighbourVertices[8], neighbourVertices[9]]
//     );

//     const backTriangles = getSideTriangles(
//       [1, 0, 5, 4, 10],
//       [vertices[1], vertices[0], vertices[5], vertices[4], vertices[10]],
//       [
//         neighbourVertices[10],
//         neighbourVertices[11],
//         neighbourVertices[12],
//         neighbourVertices[13],
//         neighbourVertices[14],
//       ]
//     );

//     const frontTriangles = getSideTriangles(
//       [2, 3, 6, 7, 11],
//       [vertices[2], vertices[3], vertices[6], vertices[7], vertices[11]],
//       [
//         neighbourVertices[15],
//         neighbourVertices[16],
//         neighbourVertices[17],
//         neighbourVertices[18],
//         neighbourVertices[19],
//       ]
//     );

//     const triangles = topTriangles
//       .concat(leftTriangles)
//       .concat(rightTriangles)
//       .concat(backTriangles)
//       .concat(frontTriangles);

//     if (triangles.length > 0) {
//       const blockGeometry = geometryFromTriangles(triangles);

//       if (blockGeometry) {
//         const indexArray = new Int32Array(
//           Array.from({ length: blockGeometry.getAttribute('position').array.length / 3 }).map(() => index)
//         );
//         const blockIndex = new BufferAttribute(indexArray, 1);
//         blockGeometry.setAttribute('blockIndex', blockIndex);

//         return blockGeometry;
//       }
//     }
//   }

//   return null;
// };

//

const getVerticesForTableIndex = (index: number): boolean[] => {
  const vertices = Array.from({ length: 14 }).map(() => false);

  switch (index) {
    // full
    case 16383:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[4] = true;
      vertices[5] = true;
      vertices[6] = true;
      vertices[7] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      vertices[13] = true;
      break;

    // corner ramp
    case 16367:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[5] = true;
      vertices[6] = true;
      vertices[7] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      vertices[13] = true;
      break;
    case 16351:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[4] = true;
      vertices[6] = true;
      vertices[7] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      vertices[13] = true;
      break;
    case 16319:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[4] = true;
      vertices[5] = true;
      vertices[7] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      vertices[13] = true;
      break;
    case 16255:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[4] = true;
      vertices[5] = true;
      vertices[6] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      vertices[13] = true;
      break;

    // valley
    case 8095:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[4] = true;
      vertices[7] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      break;
    case 8047:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[5] = true;
      vertices[6] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      break;

    // ramp
    case 7855:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[5] = true;
      vertices[7] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      break;
    case 7519:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[4] = true;
      vertices[6] = true;
      vertices[8] = true;
      vertices[10] = true;
      vertices[11] = true;
      vertices[12] = true;
      break;
    case 7119:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[6] = true;
      vertices[7] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[11] = true;
      vertices[12] = true;
      break;
    case 5951:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[4] = true;
      vertices[5] = true;
      vertices[8] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[12] = true;
      break;

    // ramp corner
    case 6798:
      vertices[1] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[7] = true;
      vertices[9] = true;
      vertices[11] = true;
      vertices[12] = true;
      break;
    case 6477:
      vertices[0] = true;
      vertices[2] = true;
      vertices[3] = true;
      vertices[6] = true;
      vertices[8] = true;
      vertices[11] = true;
      vertices[12] = true;
      break;
    case 5675:
      vertices[0] = true;
      vertices[1] = true;
      vertices[3] = true;
      vertices[5] = true;
      vertices[9] = true;
      vertices[10] = true;
      vertices[12] = true;
      break;
    case 5399:
      vertices[0] = true;
      vertices[1] = true;
      vertices[2] = true;
      vertices[4] = true;
      vertices[8] = true;
      vertices[10] = true;
      vertices[12] = true;
      break;
  }

  return vertices;
};

//

const getTopTriangles = (vertices: boolean[], neighbourVertices: boolean[]): number[][] | null => {
  const tableIndex = calcTableIndex(vertices);

  const topTriangles = blockTriangleTable.find((table) => table.index === tableIndex)?.triangles;

  if (!topTriangles) {
    return null;
  }

  if (tableIndex === 16383) {
    return getSideTriangles(
      [6, 7, 4, 5, 13],
      [vertices[6], vertices[7], vertices[4], vertices[5], vertices[13]],
      neighbourVertices,
    );
  } else if (tableIndex === 16367 || tableIndex === 16351 || tableIndex === 16319 || tableIndex === 16255) {
    const calcTriangleIndex = (indices: number[]) =>
      indices.map((index) => Math.pow(2, index)).reduce((previous, current) => previous + current);

    const topSideTriangleIndices = [
      calcTriangleIndex([6, 7, 13]),
      calcTriangleIndex([7, 5, 13]),
      calcTriangleIndex([5, 4, 13]),
      calcTriangleIndex([4, 6, 13]),
    ];

    const rampTriangles = topTriangles.filter((triangle) => {
      return !topSideTriangleIndices.includes(calcTriangleIndex(triangle));
    });

    return [
      ...getSideTriangles(
        [6, 7, 4, 5, 13],
        [vertices[6], vertices[7], vertices[4], vertices[5], vertices[13]],
        neighbourVertices,
      ),
      ...rampTriangles,
    ];
  }

  return topTriangles;
};

//

// TODO: Use arrays, instead of Vector3/Vector2
const createBufferGeometry = (positions: Vector3[], uvs: Vector2[]) => {
  const positionArray = new Float32Array(positions.map((position) => position.toArray()).flat());

  const uvArray = new Float32Array(uvs.map((uv) => uv.toArray()).flat());

  const positionAttribute = new BufferAttribute(positionArray, 3);
  const uvAttribute = new BufferAttribute(uvArray, 2);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('uv', uvAttribute);
  geometry.computeVertexNormals();

  return geometry;
};

const getTopGeometry = (vertices: boolean[], neighbourVertices: boolean[]): BufferGeometry | null => {
  const tableIndex = calcTableIndex(vertices);
  const tableEntry = blockTriangleTable.find((table) => table.index === tableIndex);

  if (!tableEntry) return null;

  const indices = [6, 7, 4, 5, 13];

  const calcTriangleIndex = (indices: number[]) =>
    indices.map((index) => Math.pow(2, index)).reduce((previous, current) => previous + current);

  const topSideTriangleIndices = [
    calcTriangleIndex([6, 7, 13]),
    calcTriangleIndex([7, 5, 13]),
    calcTriangleIndex([5, 4, 13]),
    calcTriangleIndex([4, 6, 13]),
  ];

  const rampTriangles = tableEntry.triangles.filter((triangle) => {
    return !topSideTriangleIndices.includes(calcTriangleIndex(triangle));
  });

  const visibleTriangles = getVisibleTriangles(
    [vertices[6], vertices[7], vertices[4], vertices[5], vertices[13]],
    neighbourVertices,
  )
    .map((triangle) => [indices[triangle[0]], indices[triangle[1]], indices[triangle[2]]])
    .concat(rampTriangles);

  const positions = visibleTriangles
    .map((triangle) => [
      blockVertexPositionTable[triangle[0]],
      blockVertexPositionTable[triangle[1]],
      blockVertexPositionTable[triangle[2]],
    ])
    .flat();

  const uvs = visibleTriangles
    .concat(rampTriangles)
    .map((triangle) => [topUvTable[triangle[0]], topUvTable[triangle[1]], topUvTable[triangle[2]]])
    .flat();

  const geometry = createBufferGeometry(positions, uvs);

  return geometry;
};

/**
 * Get triangle vertices for a wall.
 * @example indices[]:
 * 2 - - - 3
 * | \   / |
 * |   4   |
 * | /   \ |
 * 0 - - - 1
 *
 * @param {number[]} indices
 * @param {boolean[]} vertices
 * @param {boolean[]} neighbourVertices
 * @return {*}  {number[][]}
 */
const getSideTriangles = (indices: number[], vertices: boolean[], neighbourVertices: boolean[]): number[][] => {
  const triangleTable = [
    [0, 1, 4],
    [1, 3, 4],
    [2, 0, 4],
    [3, 2, 4],
  ];

  const triangles = triangleTable
    .filter((vertexIndices) => {
      // filter triangles where all vertices are true
      return vertices[vertexIndices[0]] && vertices[vertexIndices[1]] && vertices[vertexIndices[2]];
    })
    .filter((vertexIndices) => {
      // filter triangles if there is a neighbour triangle missing, so when one member of neighbourVertices equals false
      return !(
        neighbourVertices[vertexIndices[0]] &&
        neighbourVertices[vertexIndices[1]] &&
        neighbourVertices[vertexIndices[2]]
      );
    })
    .map((tableIndices) => {
      return [indices[tableIndices[0]], indices[tableIndices[1]], indices[tableIndices[2]]];
    });

  return triangles;
};

const getVisibleTriangles = (vertices: boolean[], neighbourVertices: boolean[]): number[][] => {
  const triangleTable = [
    [0, 1, 4],
    [1, 3, 4],
    [2, 0, 4],
    [3, 2, 4],
  ];

  const triangles = triangleTable
    .filter((vertexIndices) => {
      // filter triangles where all vertices are true
      return vertices[vertexIndices[0]] && vertices[vertexIndices[1]] && vertices[vertexIndices[2]];
    })
    .filter((vertexIndices) => {
      // filter triangles if there is a neighbour triangle missing, so when one member of neighbourVertices equals false
      return !(
        neighbourVertices[vertexIndices[0]] &&
        neighbourVertices[vertexIndices[1]] &&
        neighbourVertices[vertexIndices[2]]
      );
    });

  return triangles;
};

/**
 * Get triangle vertices for a wall.
 * @example
 * indices[]:
 * 2 - - - 3
 * | \   / |
 * |   4   |
 * | /   \ |
 * 0 - - - 1
 *
 * @param {number[]} indices
 * @param {boolean[]} vertices
 * @param {boolean[]} neighbourVertices
 * @return {*}  {number[][]}
 */
const getSideGeometry = (
  indices: number[],
  vertices: boolean[],
  neighbourVertices: boolean[],
): BufferGeometry | null => {
  const uvTable = [new Vector2(0, 1), new Vector2(1, 1), new Vector2(0, 0), new Vector2(1, 0), new Vector2(0.5, 0.5)];

  const visibleTriangles = getVisibleTriangles(vertices, neighbourVertices);

  if (visibleTriangles.length > 0) {
    const positions = visibleTriangles
      .map((triangle) => [
        blockVertexPositionTable[indices[triangle[0]]],
        blockVertexPositionTable[indices[triangle[1]]],
        blockVertexPositionTable[indices[triangle[2]]],
      ])
      .flat();

    const uvs = visibleTriangles
      .map((triangle) => [uvTable[triangle[0]], uvTable[triangle[1]], uvTable[triangle[2]]])
      .flat();

    console.log('before', visibleTriangles);

    const geometry = createBufferGeometry(positions, uvs);

    return geometry;
  }

  return null;
};

const getNeighbourVerticesForNeighboursInBlocks = (neighbours: (BlockType | null)[]): boolean[] => {
  const currentNeighbourVertices: boolean[] = [];

  // left 0 2 4 6 8
  if (neighbours[0]) {
    currentNeighbourVertices.push(
      neighbours[0].vertices[1],
      neighbours[0].vertices[3],
      neighbours[0].vertices[5],
      neighbours[0].vertices[7],
      neighbours[0].vertices[9],
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // right 3 1 7 5 9
  if (neighbours[1]) {
    currentNeighbourVertices.push(
      neighbours[1].vertices[2],
      neighbours[1].vertices[0],
      neighbours[1].vertices[6],
      neighbours[1].vertices[4],
      neighbours[1].vertices[8],
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // back 1 0 5 4 10
  if (neighbours[2]) {
    currentNeighbourVertices.push(
      neighbours[2].vertices[3],
      neighbours[2].vertices[2],
      neighbours[2].vertices[7],
      neighbours[2].vertices[6],
      neighbours[2].vertices[11],
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // front 2 3 6 7 11
  if (neighbours[3]) {
    currentNeighbourVertices.push(
      neighbours[3].vertices[0],
      neighbours[3].vertices[1],
      neighbours[3].vertices[4],
      neighbours[3].vertices[5],
      neighbours[3].vertices[10],
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // bottom 2 3 0 1 12
  if (neighbours[4]) {
    currentNeighbourVertices.push(
      neighbours[4].vertices[6],
      neighbours[4].vertices[7],
      neighbours[4].vertices[4],
      neighbours[4].vertices[5],
      neighbours[4].vertices[13],
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  // top 6 7 4 5 13
  if (neighbours[5]) {
    currentNeighbourVertices.push(
      neighbours[5].vertices[2],
      neighbours[5].vertices[3],
      neighbours[5].vertices[0],
      neighbours[5].vertices[1],
      neighbours[5].vertices[12],
    );
  } else {
    currentNeighbourVertices.push(false, false, false, false, false);
  }

  return currentNeighbourVertices;
};

const geometryFromTriangles = (triangles: number[][]) => {
  const vertexPosition = blockSize.clone().multiplyScalar(0.5);

  const vertexTable = [
    [-vertexPosition.x, -vertexPosition.y, -vertexPosition.z],
    [vertexPosition.x, -vertexPosition.y, -vertexPosition.z],
    [-vertexPosition.x, -vertexPosition.y, vertexPosition.z],
    [vertexPosition.x, -vertexPosition.y, vertexPosition.z],

    [-vertexPosition.x, vertexPosition.y, -vertexPosition.z],
    [vertexPosition.x, vertexPosition.y, -vertexPosition.z],
    [-vertexPosition.x, vertexPosition.y, vertexPosition.z],
    [vertexPosition.x, vertexPosition.y, vertexPosition.z],

    [-vertexPosition.x, 0, 0],
    [vertexPosition.x, 0, 0],
    [0, 0, -vertexPosition.z],
    [0, 0, vertexPosition.z],
    [0, -vertexPosition.y, 0],
    [0, vertexPosition.y, 0],
  ];

  const triangleGeometries: BufferGeometry[] = triangles.map((vertices) => {
    const position = new Float32Array(
      vertices
        .map((index) => {
          return [vertexTable[index][0], vertexTable[index][1], vertexTable[index][2]];
        })
        .flat(),
    );

    const attribute = new BufferAttribute(position, 3);
    const geometry = new BufferGeometry();

    geometry.setAttribute('position', attribute);
    geometry.computeVertexNormals();

    return geometry;
  });

  return mergeBufferGeometries(triangleGeometries);
};

const generateBlockGeometry = (getBlock: GetBlock, { id, neighbours, vertices }: BlockType) => {
  const neighbourBlocks = neighbours.map((neighbour) => (neighbour > -1 ? getBlock(neighbour) : null));
  const neighbourVertices: boolean[] = getNeighbourVerticesForNeighboursInBlocks(neighbourBlocks);

  let hoverGeometry: BufferGeometry | null = null;
  let blockGeometry: BufferGeometry | null = null;

  const topTriangles = getTopTriangles(vertices, [
    neighbourVertices[25],
    neighbourVertices[26],
    neighbourVertices[27],
    neighbourVertices[28],
    neighbourVertices[29],
  ]);

  const topGeometry = getTopGeometry(vertices, [
    neighbourVertices[25],
    neighbourVertices[26],
    neighbourVertices[27],
    neighbourVertices[28],
    neighbourVertices[29],
  ]);

  if (topGeometry) {
    const geometries: BufferGeometry[] = [topGeometry];

    const leftGeometry = getSideGeometry(
      [0, 2, 4, 6, 8],
      [vertices[0], vertices[2], vertices[4], vertices[6], vertices[8]],
      [neighbourVertices[0], neighbourVertices[1], neighbourVertices[2], neighbourVertices[3], neighbourVertices[4]],
    );
    if (leftGeometry) {
      geometries.push(leftGeometry);
    }

    const rightGeometry = getSideGeometry(
      [3, 1, 7, 5, 9],
      [vertices[3], vertices[1], vertices[7], vertices[5], vertices[9]],
      [neighbourVertices[5], neighbourVertices[6], neighbourVertices[7], neighbourVertices[8], neighbourVertices[9]],
    );
    if (rightGeometry) {
      geometries.push(rightGeometry);
    }

    const backGeometry = getSideGeometry(
      [1, 0, 5, 4, 10],
      [vertices[1], vertices[0], vertices[5], vertices[4], vertices[10]],
      [
        neighbourVertices[10],
        neighbourVertices[11],
        neighbourVertices[12],
        neighbourVertices[13],
        neighbourVertices[14],
      ],
    );
    if (backGeometry) {
      geometries.push(backGeometry);
    }

    const frontGeometry = getSideGeometry(
      [2, 3, 6, 7, 11],
      [vertices[2], vertices[3], vertices[6], vertices[7], vertices[11]],
      [
        neighbourVertices[15],
        neighbourVertices[16],
        neighbourVertices[17],
        neighbourVertices[18],
        neighbourVertices[19],
      ],
    );
    if (frontGeometry) {
      geometries.push(frontGeometry);
    }

    blockGeometry = mergeBufferGeometries(geometries);

    if (blockGeometry) {
      let idArray;
      let idAttribute;

      hoverGeometry = topGeometry;
      idArray = new Int32Array(
        Array.from({
          length: hoverGeometry.getAttribute('position').array.length / 3,
        }).map(() => id),
      );
      idAttribute = new BufferAttribute(idArray, 1);
      hoverGeometry.setAttribute('id', idAttribute);

      idArray = new Int32Array(
        Array.from({
          length: blockGeometry.getAttribute('position').array.length / 3,
        }).map(() => id),
      );
      idAttribute = new BufferAttribute(idArray, 1);
      blockGeometry.setAttribute('id', idAttribute);
    }
  }

  //   if (topTriangles) {
  //     const leftTriangles = getSideTriangles(
  //       [0, 2, 4, 6, 8],
  //       [vertices[0], vertices[2], vertices[4], vertices[6], vertices[8]],
  //       [neighbourVertices[0], neighbourVertices[1], neighbourVertices[2], neighbourVertices[3], neighbourVertices[4]],
  //     );
  //
  //     const rightTriangles = getSideTriangles(
  //       [3, 1, 7, 5, 9],
  //       [vertices[3], vertices[1], vertices[7], vertices[5], vertices[9]],
  //       [neighbourVertices[5], neighbourVertices[6], neighbourVertices[7], neighbourVertices[8], neighbourVertices[9]],
  //     );
  //
  //     const backTriangles = getSideTriangles(
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
  //
  //     const frontTriangles = getSideTriangles(
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
  //
  //     const triangles = topTriangles
  //       .concat(leftTriangles)
  //       .concat(rightTriangles)
  //       .concat(backTriangles)
  //       .concat(frontTriangles);
  //
  //     if (topTriangles.length > 0) {
  //       hoverGeometry = geometryFromTriangles(topTriangles);
  //
  //       if (hoverGeometry) {
  //         // TODO: does this need to be that long / every position?
  //         const idArray = new Int32Array(
  //           Array.from({
  //             length: hoverGeometry.getAttribute('position').array.length / 3,
  //           }).map(() => id),
  //         );
  //
  //         const idAttribute = new BufferAttribute(idArray, 1);
  //         hoverGeometry.setAttribute('id', idAttribute);
  //       }
  //     }
  //
  //     if (triangles.length > 0) {
  //       blockGeometry = geometryFromTriangles(triangles);
  //
  //       if (blockGeometry) {
  //         // TODO: does this need to be that long / every position?
  //         const idArray = new Int32Array(
  //           Array.from({
  //             length: blockGeometry.getAttribute('position').array.length / 3,
  //           }).map(() => id),
  //         );
  //
  //         const idAttribute = new BufferAttribute(idArray, 1);
  //         blockGeometry.setAttribute('id', idAttribute);
  //       }
  //     }
  //   }

  return { hoverGeometry, blockGeometry };
};

export {
  blockVertexPositionTable as blockVertexTable,
  calcNeighboursForWorldPosition,
  calcTableIndex,
  getVerticesForTableIndex,
  getTopGeometry,
  // blockTriangleTable,
  // calcRampVertices,
  geometryFromTriangles,
  // getAdditionMutation,
  getNeighbourVerticesForNeighboursInBlocks,
  getSideTriangles,
  getSideGeometry,
  getTopTriangles,
  generateBlockGeometry,
};
