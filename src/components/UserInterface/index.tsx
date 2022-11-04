import { MdAddRoad, MdEditRoad, MdFlipCameraAndroid, MdOutlineTerrain } from 'react-icons/md';
import { TbPackgeExport, TbPackgeImport } from 'react-icons/tb';
import { useMouseControls } from '../../hooks/mouseControls';
import { useInterfaceStore } from '../../utils/interfaceStore';
import { UISelection } from '../../utils/interfaceUtils';
import { useWorld } from 'core/World';
import { Button } from './ToggleButton';
// import EditRoad from './EditRoad';

const UserInterface = () => {
  const { currUISelection, setCurrUISelection } = useInterfaceStore();

  const controls = useMouseControls();

  const handleAddRoadClick = () => {
    setCurrUISelection(currUISelection !== UISelection.ADDROAD ? UISelection.ADDROAD : null);
  };

  const handleEditRoadClick = () => {
    setCurrUISelection(currUISelection !== UISelection.EDITROAD ? UISelection.EDITROAD : null);
  };

  const handleSculptClick = () => {
    setCurrUISelection(currUISelection !== UISelection.SCULPT ? UISelection.SCULPT : null);
  };

  const handleCameraClick = () => {
    setCurrUISelection(null);
  };

  return (
    <div className="fixed top-0 left-0 z-10 flex flex-col w-full">
      <div className="flex justify-start w-full p-8 backdrop-blur-xl">
        <Button isActive={currUISelection === null} onClick={handleCameraClick} currUISelection={currUISelection}>
          <MdFlipCameraAndroid className="w-6 h-6" />
        </Button>

        <Button
          isActive={currUISelection === UISelection.SCULPT}
          onClick={handleSculptClick}
          currUISelection={currUISelection}
        >
          <MdOutlineTerrain className="w-6 h-6" />
        </Button>

        <Button isActive={false} onClick={handleAddRoadClick}>
          <MdAddRoad className="w-6 h-6" />
        </Button>

        <Button isActive={false} onClick={handleEditRoadClick}>
          <MdEditRoad className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex-shrink p-8 backdrop-blur-xl w-[400px] m-8"></div>
    </div>
  );
};

export default UserInterface;
