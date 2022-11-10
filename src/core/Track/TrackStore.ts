import { Vector3 } from 'three';
import createStore, { Schema, Store } from 'utils/typedArrayStore';
import { TrackBlockType, TrackDirectionType, TrackType } from './';

const worldPositionSchema: Schema = {
  x: 'Float32',
  y: 'Float32',
  z: 'Float32',
};

const directionSchema: Schema = {
  from: 'Int8',
  to: 'Int8',
  angle: 'Int8',
};

const trackSchema: Schema = {
  variation: 'Int8',
  isPartial: 'Uint8',
};

//

class TrackStore {
  private worldPosition: Store;
  private direction: Store;
  private track: Store;
  private maxLength: number;

  constructor() {
    this.worldPosition = {};
    this.direction = {};
    this.track = {};
    this.maxLength = 0;
  }

  init(maxLength: number) {
    this.worldPosition = createStore(worldPositionSchema, maxLength);
    this.direction = createStore(directionSchema, maxLength);
    this.track = createStore(trackSchema, maxLength);
    this.maxLength = maxLength;
  }

  private getWorldPosition(id: number) {
    return new Vector3(this.worldPosition.x[id], this.worldPosition.y[id], this.worldPosition.z[id]);
  }

  private getDirection(id: number) {
    return {
      from: this.direction.from[id],
      to: this.direction.to[id],
      angle: this.direction.angle[id],
    };
  }

  private getTrack(id: number) {
    return {
      variation: this.track.variation[id],
      isPartial: this.track.isPartial[id] === 1,
    };
  }

  private getBlockId(worldPosition: Vector3): number {
    const tempVector = new Vector3();

    for (let i = 0; i < this.maxLength; i++) {
      tempVector.set(this.worldPosition.x[i], this.worldPosition.y[i], this.worldPosition.z[i]);

      if (tempVector.equals(worldPosition)) {
        return i;
      }
    }

    return -1;
  }

  public getBlock(query: number | Vector3): TrackBlockType | null {
    let id = -1;

    if (typeof query !== 'number') {
      id = this.getBlockId(query);
    } else {
      id = query;
    }

    if (id >= 0 && id < this.maxLength) {
      return {
        id: id,
        worldPosition: this.getWorldPosition(id),
        direction: this.getDirection(id),
        track: this.getTrack(id),
      };
    }

    return null;
  }

  //

  private setWorldPosition(id: number, worldPosition: Vector3) {
    this.worldPosition.x[id] = worldPosition.x;
    this.worldPosition.y[id] = worldPosition.y;
    this.worldPosition.z[id] = worldPosition.z;
  }

  private setDirection(id: number, direction: TrackDirectionType) {
    this.direction.from[id] = direction.from;
    this.direction.to[id] = direction.to;
    this.direction.angle[id] = direction.angle;
  }

  private setTrack(id: number, track: TrackType) {
    this.track.variation[id] = track.variation;
    this.track.isPartial[id] = Number(track.isPartial);
  }

  public setBlock({
    id,
    worldPosition,
    direction,
    track,
  }: {
    id: number;
    worldPosition: Vector3;
    direction: TrackDirectionType;
    track: TrackType;
  }) {
    this.setWorldPosition(id, worldPosition);
    this.setDirection(id, direction);
    this.setTrack(id, track);
  }
}

export default TrackStore;
