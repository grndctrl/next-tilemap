import { useEffect, useRef, useState } from 'react';
import { Vector2 } from 'three';

type MouseControls = {
  leftButton: boolean;
  rightButton: boolean;
  drag: Vector2;
};

const useMousePress = (button: number, fn: (isDown: boolean, event: MouseEvent) => void) => {
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => event.button === button && fn(true, event);
    const handleMouseUp = (event: MouseEvent) => event.button === button && fn(false, event);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
};

const useMouseMove = (fn: (x: number, y: number) => void) => {
  useEffect(() => {
    const handleMouseMove = ({ x, y }: MouseEvent) => {
      fn(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
};

export const useMouseControls = () => {
  const startPos = useRef<Vector2>(new Vector2(-1, -1));
  const currPos = useRef<Vector2>(new Vector2(0, 0));

  const [controls, setControls] = useState<MouseControls>({
    leftButton: false,
    rightButton: false,
    drag: new Vector2(),
  });

  useMousePress(0, (isDown, { x, y }) => {
    const { drag } = controls;

    if (isDown) {
      startPos.current.setX(x);
      startPos.current.setY(y);
    } else {
      startPos.current.setX(-1);
      startPos.current.setY(-1);
      drag.setX(0);
      drag.setY(0);
    }

    setControls((controls) => ({ ...controls, leftButton: isDown, drag }));
  });
  useMousePress(1, (isDown) => setControls((controls) => ({ ...controls, rightButton: isDown })));
  useMouseMove((x, y) => {
    currPos.current.setX(x);
    currPos.current.setY(y);

    const drag = currPos.current.clone().sub(startPos.current);

    setControls((controls) => {
      if (controls.leftButton) {
        return { ...controls, drag };
      }
      return { ...controls };
    });
  });

  return controls;
};
