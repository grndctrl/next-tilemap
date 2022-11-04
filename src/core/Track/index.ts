import { Vector3 } from 'three';
import TrackStore from './TrackStore';

enum TrackDirection {
  NORTH,
  WEST,
  SOUTH,
  EAST,
}

enum TrackAngle {
  STRAIGHT,
  UP,
  DOWN,
}

enum TrackVariation {
  FORWARD_STRAIGHT,
  FORWARD_UP,
  FORWARD_DOWN,
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

  public setBlock(block: { id: number; worldPosition: Vector3; direction: TrackDirectionType; track: TrackType }) {
    return this.store.setBlock(block);
  }
}

const track = new Track();

export { track };
