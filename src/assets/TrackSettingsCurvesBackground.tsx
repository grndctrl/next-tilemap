type TrackSettingsCurvesProps = JSX.IntrinsicElements['span'] & {
  variation: 'horizontal' | 'vertical' | 'curve' | 'background';
};

const TrackSettingsCurves = ({ variation, ...props }: TrackSettingsCurvesProps) => {
  return (
    <span {...props}>
      {variation === 'background' && (
        <svg viewBox="0 0 144 40" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="Page-1" stroke="none" fill-rule="evenodd">
            <path
              d="M0,0 L16,0 L16.0117,0.0459 C16.2535,0.9828 20.2496,16 28,16 L52,16 C60,16 64,0 64,0 L80,0 L80.0117,0.0459 C80.2535,0.9828 84.2496,16 92,16 L116,16 C124,16 128,0 128,0 L144,0 L144,40 L128,40 C128,40 124,24 116,24 L92,24 C84.2496,24 80.2535,39.0172 80.0117,39.9541 L80,40 L64,40 L63.9883,39.9541 C63.7465,39.0172 59.7504,24 52,24 L28,24 C20.2496,24 16.2535,39.0172 16.0117,39.9541 L16,40 L0,40 L0,0 Z"
              id="Fill-1"
            ></path>
          </g>
        </svg>
      )}
      {variation === 'curve' && (
        <svg viewBox="0 0 64 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="Page-1" stroke="none" fill-rule="evenodd">
            <g id="Group-6">
              <path d="M24,4 C24,4 32,28 44,28 L62,28 L62,20 L52,20 C44,20 40,4 40,4 L24,4 Z"></path>
            </g>
          </g>
        </svg>
      )}
      {variation === 'vertical' && (
        <svg viewBox="0 0 64 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="Page-1" stroke="none" stroke-width="1" fill-rule="evenodd">
            <g id="Group-6-Copy-2">
              <polygon id="Fill-4" points="24 22 40 22 40 4 24 4"></polygon>
              <polygon id="Fill-5" points="24 44 40 44 40 26 24 26"></polygon>
            </g>
          </g>
        </svg>
      )}

      {variation === 'horizontal' && (
        <svg viewBox="0 0 64 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="Page-1" stroke="none" stroke-width="1" fill-rule="evenodd">
            <g id="Group-3">
              <polygon id="Fill-2" points="2 28 62 28 62 20 2 20"></polygon>
            </g>
          </g>
        </svg>
      )}
    </span>
  );
};

export default TrackSettingsCurves;
