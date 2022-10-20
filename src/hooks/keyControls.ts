import { useEffect, useState } from 'react';

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
  });

  return null;
};

type KeyControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

const useKeyControls = () => {
  const [controls, setControls] = useState<KeyControls>({ forward: false, backward: false, left: false, right: false });

  useKeyPress('w', (isDown, event) => {
    if ((isDown && !controls.forward) || !isDown) {
      setControls((state) => ({ ...state, forward: isDown }));
    }
  });
  useKeyPress('s', (isDown, event) => {
    if ((isDown && !controls.backward) || !isDown) {
      setControls((state) => ({ ...state, backward: isDown }));
    }
  });
  useKeyPress('a', (isDown, event) => {
    if ((isDown && !controls.left) || !isDown) {
      setControls((state) => ({ ...state, left: isDown }));
    }
  });
  useKeyPress('d', (isDown, event) => {
    if ((isDown && !controls.right) || !isDown) {
      setControls((state) => ({ ...state, right: isDown }));
    }
  });

  return controls;
};

export { useKeyControls };
