import { Vector3 } from 'three';
import createStore, { Schema, Store } from 'utils/typedArrayStore';

import { WorldMeasurements } from './';

//

const localPositionSchema: Schema = {
  x: 'Float32',
  y: 'Float32',
  z: 'Float32',
};

const worldPositionSchema: Schema = {
  x: 'Float32',
  y: 'Float32',
  z: 'Float32',
};

const verticesSchema: Schema = {
  '0': 'Uint8',
  '1': 'Uint8',
  '2': 'Uint8',
  '3': 'Uint8',
  '4': 'Uint8',
  '5': 'Uint8',
  '6': 'Uint8',
  '7': 'Uint8',
  '8': 'Uint8',
  '9': 'Uint8',
  '10': 'Uint8',
  '11': 'Uint8',
  '12': 'Uint8',
  '13': 'Uint8',
};

const neighboursSchema: Schema = {
  left: 'Int32',
  right: 'Int32',
  back: 'Int32',
  front: 'Int32',
  bottom: 'Int32',
  top: 'Int32',
};

//

class WorldStore {
  private localPosition: Store;
  private worldPosition: Store;
  private vertices: Store;
  private neighbours: Store;
  private measurements: WorldMeasurements;

  constructor(measurements: WorldMeasurements) {
    this.measurements = measurements;
    this.localPosition = {};
    this.worldPosition = {};
    this.vertices = {};
    this.neighbours = {};
  }

  public init(measurements: WorldMeasurements) {
    this.measurements = measurements;
    this.localPosition = createStore(localPositionSchema, this.measurements.totalBlocksInWorld);
    this.worldPosition = createStore(worldPositionSchema, this.measurements.totalBlocksInWorld);
    this.vertices = createStore(verticesSchema, this.measurements.totalBlocksInWorld);
    this.neighbours = createStore(neighboursSchema, this.measurements.totalBlocksInWorld);
  }

  //

  private isBlockActive(id: number) {
    return this.getVertices(id).findIndex((value) => value === true) > -1;
  }

  private getLocalPosition(id: number) {
    return new Vector3(this.localPosition.x[id], this.localPosition.y[id], this.localPosition.z[id]);
  }

  private getWorldPosition(id: number) {
    return new Vector3(this.worldPosition.x[id], this.worldPosition.y[id], this.worldPosition.z[id]);
  }

  private getNeighbours(id: number) {
    return [
      this.neighbours.left[id],
      this.neighbours.right[id],
      this.neighbours.back[id],
      this.neighbours.front[id],
      this.neighbours.bottom[id],
      this.neighbours.top[id],
    ];
  }

  private getVertices(id: number) {
    const vertices = [];

    for (let i = 0; i < 14; i++) {
      vertices.push(this.vertices[i][id] === 1);
    }

    return vertices;
  }

  private getBlockId(worldPosition: Vector3): number {
    const tempVector = new Vector3();

    for (let i = 0; i < this.measurements.totalBlocksInWorld; i++) {
      tempVector.set(this.worldPosition.x[i], this.worldPosition.y[i], this.worldPosition.z[i]);

      if (tempVector.equals(worldPosition)) {
        return i;
      }
    }

    return -1;
  }

  public getBlock(query: number | Vector3) {
    let id = -1;

    if (typeof query !== 'number') {
      id = this.getBlockId(query);
    } else {
      id = query;
    }

    if (id >= 0 && id < this.measurements.totalBlocksInWorld) {
      return {
        id: id,
        index: id % this.measurements.totalBlocksInChunk,
        parentChunk: Math.floor(id / this.measurements.totalBlocksInChunk),
        isActive: this.isBlockActive(id),
        localPosition: this.getLocalPosition(id),
        worldPosition: this.getWorldPosition(id),
        neighbours: this.getNeighbours(id),
        vertices: this.getVertices(id),
      };
    }

    return null;
  }

  //

  private setLocalPosition(id: number, _localPosition: Vector3) {
    this.localPosition.x[id] = _localPosition.x;
    this.localPosition.y[id] = _localPosition.y;
    this.localPosition.z[id] = _localPosition.z;
  }

  private setWorldPosition(id: number, worldPosition: Vector3) {
    this.worldPosition.x[id] = worldPosition.x;
    this.worldPosition.y[id] = worldPosition.y;
    this.worldPosition.z[id] = worldPosition.z;
  }

  private setNeighbours(id: number, neighbours: number[]) {
    this.neighbours.left[id] = neighbours[0];
    this.neighbours.right[id] = neighbours[1];
    this.neighbours.back[id] = neighbours[2];
    this.neighbours.front[id] = neighbours[3];
    this.neighbours.bottom[id] = neighbours[4];
    this.neighbours.top[id] = neighbours[5];
  }

  private setVertices(id: number, vertices: boolean[]) {
    for (let i = 0; i < 14; i++) {
      this.vertices[i][id] = vertices[i] ? 1 : 0;
    }
  }

  public setBlock({
    id,
    localPosition,
    worldPosition,
    neighbours,
    vertices,
  }: {
    id: number;
    localPosition: Vector3;
    worldPosition: Vector3;
    neighbours: number[];
    vertices: boolean[];
  }) {
    this.setLocalPosition(id, localPosition);
    this.setWorldPosition(id, worldPosition);
    this.setNeighbours(id, neighbours);
    this.setVertices(id, vertices);
  }

  //

  // public exportJSON() {
  //   const totalBlocksInChunk = this.totalBlocksInChunk;
  //   const totalChunksInWorld = this.totalChunksInWorld;
  //   const totalBlocksInWorld = this.totalBlocksInWorld;

  //   const localPosition = this.localPosition;
  //   const worldPosition = this.worldPosition;
  //   const vertices = this.vertices;
  //   const neighbours = this.neighbours;
  //   const chunks = this.chunks;

  //   const json = JSON.stringify({
  //     totalBlocksInChunk,
  //     totalChunksInWorld,
  //     totalBlocksInWorld,
  //     localPosition,
  //     worldPosition,
  //     vertices,
  //     neighbours,
  //     chunks,
  //   });

  //   return json;
  // }
}

export default WorldStore;
