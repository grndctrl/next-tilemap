import { useEffect, useRef, useState } from 'react';
import { Vector2 } from 'three';

// type KeyControls = {
//   leftButton: boolean;
//   rightButton: boolean;
//   drag: Vector2;
// };

const useKeyPress = (key: string, fn: (isDown: boolean, event: KeyboardEvent) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => event.key === key && fn(true, event);
    const handleKeyUp = (event: KeyboardEvent) => event.key === key && fn(false, event);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
};

export const useKeyControls = () => {
  const [controls, setControls] = useState({ forward: false, backward: false, left: false, right: false, jump: false });

  useKeyPress('ArrowUp', (isDown) => {
    setControls((state) => ({ ...state, forward: isDown }));
  });

  useKeyPress('ArrowDown', (isDown) => {
    setControls((state) => ({ ...state, backward: isDown }));
  });

  useKeyPress('ArrowLeft', (isDown) => {
    setControls((state) => ({ ...state, left: isDown }));
  });

  useKeyPress('ArrowRight', (isDown) => {
    setControls((state) => ({ ...state, right: isDown }));
  });

  return controls;
};
