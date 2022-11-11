import { MdAddRoad, MdEditRoad, MdFlipCameraAndroid, MdOutlineTerrain } from 'react-icons/md';
import { TbPackgeExport, TbPackgeImport } from 'react-icons/tb';
import { useMouseControls } from '../../hooks/mouseControls';
import { useInterfaceStore } from '../../utils/interfaceStore';
import { UISelection } from '../../utils/interfaceUtils';
import { useWorld } from 'core/World';
import Toggle from 'ui/Toggle';
import { useTrack } from 'core/Track/hooks';
import EditTrackModal from './EditTrackModal';
import Button from 'ui/Button';
import lzwCompress from 'lzwcompress';

const UserInterface = () => {
  const { currUISelection, setCurrUISelection } = useInterfaceStore();
  const { length, exportJSON: exportTrack } = useTrack();
  const { exportJSON: exportWorld } = useWorld();

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

  const handleExportClick = () => {
    const world = exportWorld();
    const track = exportTrack();

    const json = JSON.stringify({ world, track });

    const a = document.createElement('a');
    const file = new Blob([json], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = 'data.json';
    a.click();
    a.remove();
  };

  return (
    <div className="fixed top-0 left-0 z-10 flex flex-col w-full">
      <div className="flex justify-between w-full p-8 backdrop-blur-xl bg-slate-900 text-slate-900 bg-opacity-20 ui-crt">
        <div className="flex justify-start">
          <div className="mr-2">
            <Toggle isActive={currUISelection === null} onClick={handleCameraClick}>
              <MdFlipCameraAndroid className="w-6 h-6" />
            </Toggle>
          </div>
          <div className="mr-2">
            <Toggle isActive={currUISelection === UISelection.SCULPT} onClick={handleSculptClick}>
              <MdOutlineTerrain className="w-6 h-6" />
            </Toggle>
          </div>
          <div className="mr-2">
            {length === 0 && (
              <Toggle onClick={handleAddRoadClick} isActive={currUISelection === UISelection.ADDROAD}>
                <MdAddRoad className="w-6 h-6" />
              </Toggle>
            )}
            {length > 0 && (
              <Toggle onClick={handleEditRoadClick} isActive={currUISelection === UISelection.EDITROAD}>
                <MdEditRoad className="w-6 h-6" />
              </Toggle>
            )}
          </div>
        </div>

        <div>
          <div className="mr-2">
            <Button onClick={handleExportClick}>
              <TbPackgeExport className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
      {(currUISelection === UISelection.ADDROAD || currUISelection === UISelection.EDITROAD) && <EditTrackModal />}
    </div>
  );
};

export default UserInterface;
