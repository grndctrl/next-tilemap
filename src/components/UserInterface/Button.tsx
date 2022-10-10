import { UISelection } from '../../utils/interfaceUtils';

type ButtonProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  currUISelection: UISelection | null;
};

const Button = ({ isActive, onClick, children, currUISelection }: ButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center w-10 h-10 mx-2 font-bold  text-slate-100 ${
        isActive ? 'bg-emerald-400' : 'bg-black'
      } hover:bg-orange-500`}
    >
      {children}
    </div>
  );
};

export { Button };
