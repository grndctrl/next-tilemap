import { MdAddRoad, MdEditRoad, MdFlipCameraAndroid, MdOutlineTerrain } from 'react-icons/md';
import { TbPackgeExport, TbPackgeImport } from 'react-icons/tb';
import { useMouseControls } from '../../hooks/mouseControls';
import { useInterfaceStore } from '../../utils/interfaceStore';
import { UISelection } from '../../utils/interfaceUtils';
import { useWorldStore } from '../../utils/worldStore';
import { Button } from './Button';
// import EditRoad from './EditRoad';

const UserInterface = () => {
  const { updateRenderKey } = useWorldStore();
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

  const handleExportClick = async () => {
    const json = ''; //exportJSON();

    const blob = new Blob([json], { type: 'application/json' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = href;
    link.download = 'world.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    // const input = document.createElement('input');

    // input.type = 'file';
    // input.accept = '.json';
    // input.click();

    // input.onchange = () => {
    //   if (input.files) {
    //     if (input.files.length > 0) {
    //       const file = input.files[0];
    //       const reader = new FileReader();

    //       reader.onload = () => {
    //         if (reader.result) {
    //           const data = JSON.parse(reader.result as string);
    //           console.log(data);
    //         }
    //       };

    //       reader.readAsText(file);
    //     }
    //   }
    // };

    updateRenderKey(0);
    updateRenderKey(1);
    updateRenderKey(2);
    updateRenderKey(3);
    updateRenderKey(4);
    updateRenderKey(5);
    updateRenderKey(6);
    updateRenderKey(7);
  };

  return (
    <div className="fixed top-0 left-0 z-10 flex flex-col w-full">
      <div className="flex justify-start w-full p-4 bg-gray-800">
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

        <Button isActive={false} onClick={handleExportClick}>
          <TbPackgeExport className="w-6 h-6" />
        </Button>

        <Button isActive={false} onClick={handleImportClick}>
          <TbPackgeImport className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default UserInterface;
