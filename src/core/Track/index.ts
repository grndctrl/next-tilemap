import { Vector3 } from 'three';
import TrackStore from './TrackStore';

export enum TrackDirection {
  NORTH,
  WEST,
  SOUTH,
  EAST,
}

export enum TrackAngle {
  STRAIGHT,
  UP,
  DOWN,
}

export enum TrackVariation {
  EMPTY,
  FORWARD,
  TURN_LEFT,
  TURN_RIGHT,
}

export type TrackDirectionType = {
  from: TrackDirection;
  to: TrackDirection;
  angle: TrackAngle;
};

export type TrackType = {
  variation: TrackVariation;
  isPartial: boolean;
};

export type TrackBlockType = { id: number; worldPosition: Vector3; direction: TrackDirectionType; track: TrackType };

class Track {
  private store: TrackStore;

  constructor() {
    this.store = new TrackStore();
  }

  public init(maxLength: number) {
    this.store.init(maxLength);
  }

  public getBlock(query: number | Vector3) {
    return this.store.getBlock(query);
  }

  public setBlock(block: TrackBlockType) {
    return this.store.setBlock(block);
  }

  public exportJSON() {
    return this.store.exportJSON();
  }
}

const track = new Track();
track.init(512);

export { track };
