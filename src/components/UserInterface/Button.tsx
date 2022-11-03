type ButtonProps = {
  onClick: () => void;
  label: string;
};

const Button = ({ onClick, label }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="p-2 text-yellow-800 uppercase bg-yellow-500 border-b-2 border-yellow-700 hover:bg-slate-200 hover:border-slate-400 hover:text-slate-900"
    >
      {label}
    </button>
  );
};

export default Button;
