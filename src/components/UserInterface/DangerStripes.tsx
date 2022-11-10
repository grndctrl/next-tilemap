type DangerStripesProps = {
  colors?: {
    default: string;
    glow: string;
  };
};

const DangerStripes = ({ colors = { default: ' #FF1B63', glow: '#FF1B2B' } }: DangerStripesProps) => {
  return (
    <div className="flex glow" style={{ color: colors.glow }}>
      <div
        className="w-1 h-1 border-4 border-current border-l-transparent border-t-transparent"
        style={{ color: colors.default }}
      ></div>
      <div
        className="w-1 h-1 border-4 border-current border-r-transparent border-b-transparent"
        style={{ color: colors.default }}
      ></div>
      <div
        className="w-1 h-1 border-4 border-current border-l-transparent border-t-transparent"
        style={{ color: colors.default }}
      ></div>
      <div
        className="w-1 h-1 border-4 border-current border-r-transparent border-b-transparent"
        style={{ color: colors.default }}
      ></div>
      <div
        className="w-1 h-1 border-4 border-current border-l-transparent border-t-transparent"
        style={{ color: colors.default }}
      ></div>
      <div
        className="w-1 h-1 border-4 border-current border-r-transparent border-b-transparent"
        style={{ color: colors.default }}
      ></div>
    </div>
  );
};

export default DangerStripes;
