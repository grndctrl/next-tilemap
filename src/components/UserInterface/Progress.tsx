type ProgressProps = {
  value: number;
};

const Progress = ({ value }: ProgressProps) => {
  return <progress className="flex-grow h-10 p-2 border-2 bg-slate-900 border-slate-200" max={1} value={value} />;
};

export default Progress;
