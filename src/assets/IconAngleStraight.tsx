const IconAngleStraight = (props: JSX.IntrinsicElements['span']) => {
  return (
    <span {...props}>
      <svg className="w-full h-auto fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" fillRule="evenodd" transform="translate(0.0, 12.0)">
          <polygon id="Fill-1" points="28 0 0 0 0 8 28 8 32 4"></polygon>
          <polygon id="Fill-2" points="0 16 28 16 28 12 0 12"></polygon>
        </g>
      </svg>
    </span>
  );
};

export default IconAngleStraight;
