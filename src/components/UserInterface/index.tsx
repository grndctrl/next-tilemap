import { MdAddRoad, MdEditRoad, MdOutlineTerrain } from 'react-icons/md';
import { useMouseControls } from '../../hooks/controls';
import { useInterfaceStore } from '../../utils/interfaceStore';
import { UISelection } from '../../utils/interfaceUtils';
import { useWorldStore } from '../../utils/worldStore';
import { Button } from './Button';
// import EditRoad from './EditRoad';

const UserInterface = () => {
  // const { road } = useWorldStore();
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

  return (
    <div className="fixed top-0 left-0 z-10 flex flex-col w-full">
      <div className="flex justify-start w-full p-4 bg-slate-200">
        {/* {road.length === 0 && (
          <Button
            isActive={currUISelection === UISelection.ADDROAD}
            onClick={handleAddRoadClick}
            currUISelection={currUISelection}
          >
            <MdAddRoad className="w-6 h-6" />
          </Button>
        )}

        {road.length > 0 && (
          <Button
            isActive={currUISelection === UISelection.EDITROAD}
            onClick={handleEditRoadClick}
            currUISelection={currUISelection}
          >
            <MdEditRoad className="w-6 h-6" />
          </Button>
        )} */}

        <Button
          isActive={currUISelection === UISelection.SCULPT}
          onClick={handleSculptClick}
          currUISelection={currUISelection}
        >
          <MdOutlineTerrain className="w-6 h-6" />
        </Button>
      </div>
      {/* {currUISelection === UISelection.EDITROAD && <EditRoad />} */}
    </div>
  );
};

export default UserInterface;
