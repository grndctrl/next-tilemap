import { TrackAngle, TrackDirection, TrackVariation } from 'core/Track';
import { useTrack } from 'core/Track/hooks';
import { useEffect } from 'react';
import IconAngleDown from 'svg/IconAngleDown';
import IconAngleStraight from 'svg/IconAngleStraight';
import IconAngleUp from 'svg/IconAngleUp';
import IconVariationForward from 'svg/IconVariationForward';
import IconVariationTurnLeft from 'svg/IconVariationTurnLeft';
import IconVariationTurnRight from 'svg/IconVariationTurnRight';
import Button from 'ui/Button';
import DangerStripes from 'ui/DangerStripes';
import Toggle from 'ui/Toggle';
import { config } from 'utils/colors';
import { useInterfaceStore } from 'utils/interfaceStore';
import { UISelection } from 'utils/interfaceUtils';
import { BiRotateLeft, BiRotateRight } from 'react-icons/bi';

const EditTrackModal = () => {
  const { trackSettings, setTrackSettings, nextTrackBlock, setCurrUISelection } = useInterfaceStore();
  const { length, setBlock, deleteBlock } = useTrack();

  const handleDirectionClick = (rotateClockwise: boolean) => {
    let from = trackSettings.direction.from;
    let to = trackSettings.direction.to;

    if (rotateClockwise) {
      from = (from + 3) % 4;
      to = (to + 3) % 4;
    } else {
      from = (from + 1) % 4;
      to = (to + 1) % 4;
    }

    setTrackSettings({ direction: { from, to } });
  };

  const handleVariationClick = (variation: TrackVariation) => {
    setTrackSettings({ variation });
  };

  const handleAngleClick = (angle: TrackAngle) => {
    console.log(angle);
    setTrackSettings({ angle });
  };

  const handleAddClick = () => {
    if (nextTrackBlock !== 'blocked' && nextTrackBlock !== 'closed') {
      setBlock(nextTrackBlock);
    }
  };

  const handleDelClick = () => {
    deleteBlock();
  };

  useEffect(() => {
    if (length === 0) {
      setCurrUISelection(UISelection.ADDROAD);
    }
  }, [length]);

  return (
    <div className="p-4 m-4 text-xl bg-opacity-20 w-[190px] backdrop-blur-xl bg-slate-900 ui-crt">
      {length === 0 && (
        <div className="text-red-500">
          <div className="p-2 text-sm">Pick a start location</div>
          <div className="flex flex-col">
            <div className="w-[158px] flex justify-between">
              <Button
                onClick={() => {
                  handleDirectionClick(false);
                }}>
                <BiRotateLeft />
              </Button>
              <Button
                onClick={() => {
                  handleDirectionClick(true);
                }}>
                <BiRotateRight />
              </Button>
            </div>
            {/* <TrackSettingsConnector {...trackSettings} /> */}
          </div>
        </div>
      )}
      {length > 0 && (
        <div>
          <div className="flex flex-col">
            <div className="w-[158px] flex justify-between">
              <Toggle
                isActive={trackSettings.variation === TrackVariation.TURN_LEFT}
                onClick={() => handleVariationClick(TrackVariation.TURN_LEFT)}>
                <IconVariationTurnLeft className="block w-6 h-6" />
              </Toggle>
              <Toggle
                isActive={trackSettings.variation === TrackVariation.FORWARD}
                onClick={() => handleVariationClick(TrackVariation.FORWARD)}>
                <IconVariationForward className="block w-6 h-6" />
              </Toggle>
              <Toggle
                isActive={trackSettings.variation === TrackVariation.TURN_RIGHT}
                onClick={() => handleVariationClick(TrackVariation.TURN_RIGHT)}>
                <IconVariationTurnRight className="block w-6 h-6" />
              </Toggle>
            </div>
            {/* <TrackSettingsConnector {...trackSettings} /> */}
            <div className="mt-2">
              <div className="w-[158px] flex justify-between">
                <Toggle
                  isActive={trackSettings.angle === TrackAngle.DOWN}
                  onClick={() => handleAngleClick(TrackAngle.DOWN)}>
                  <IconAngleDown className="block w-6 h-6" />
                </Toggle>
                <Toggle
                  isActive={trackSettings.angle === TrackAngle.STRAIGHT}
                  onClick={() => handleAngleClick(TrackAngle.STRAIGHT)}>
                  <IconAngleStraight className="block w-6 h-6" />
                </Toggle>
                <Toggle
                  isActive={trackSettings.angle === TrackAngle.UP}
                  onClick={() => handleAngleClick(TrackAngle.UP)}>
                  <IconAngleUp className="block w-6 h-6" />
                </Toggle>
              </div>
            </div>
          </div>

          <div className="flex justify-between w-[158px] mt-8 items-center">
            <div className="flex flex-col">
              <DangerStripes />
              <Button onClick={handleDelClick} colors={config.danger}>
                <span className="block text-sm">DEL</span>
              </Button>
              <DangerStripes />
            </div>

            <Button onClick={handleAddClick} colors={config.success}>
              <span className="block text-sm">ADD</span>
            </Button>
          </div>

          <div className="flex justify-center w-[158px] mt-8 items-center">
            {nextTrackBlock === 'blocked' && <div className="text-red-500">BLOCKED</div>}
            {nextTrackBlock === 'closed' && <div className="text-red-500">CLOSED</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTrackModal;
