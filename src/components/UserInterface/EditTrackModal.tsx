import IconAngleDown from 'assets/IconAngleDown';
import IconAngleStraight from 'assets/IconAngleStraight';
import IconAngleUp from 'assets/IconAngleUp';
import IconVariationTurnLeft from 'assets/IconVariationTurnLeft';
import IconVariationTurnRight from 'assets/IconVariationTurnRight';
import IconVariationForward from 'assets/IconVariationForward';
import { TrackAngle, TrackVariation } from 'core/Track';
import { useTrack } from 'core/Track/hooks';
import {
  FiCornerUpLeft,
  FiCornerUpRight,
  FiArrowUp,
  FiArrowDownRight,
  FiArrowRight,
  FiArrowUpRight,
  FiPlusSquare,
  FiMinusSquare,
} from 'react-icons/fi';
import { useInterfaceStore } from 'utils/interfaceStore';

import Button from 'ui/Button';
import colors, { config } from 'utils/colors';
import Toggle from 'ui/Toggle';
import TrackSettingsCurves from 'assets/TrackSettingsCurvesBackground';
import DangerStripes from 'ui/DangerStripes';

const EditTrackModal = () => {
  const { trackSettings, setTrackSettings, nextTrackBlock } = useInterfaceStore();
  const { length, setBlock } = useTrack();

  const handleVariationClick = (variation: TrackVariation) => {
    setTrackSettings({ variation });
  };

  const handleAngleClick = (angle: TrackAngle) => {
    console.log(angle);
    setTrackSettings({ angle });
  };

  const handleAddClick = () => {
    if (nextTrackBlock) {
      console.log('🚀 ~ file: EditTrackModal.tsx ~ line 42 ~ nextTrackBlock', nextTrackBlock);
      setBlock(nextTrackBlock);
    }
  };

  return (
    <div className="p-4 m-4 text-xl bg-opacity-20 w-[190px] backdrop-blur-xl bg-slate-900 ui-crt">
      {length === 0 && <div>Pick start location</div>}
      {length > 0 && (
        <div>
          <div className="flex flex-col">
            <div className="w-[158px] flex justify-between">
              <Toggle
                isActive={trackSettings.variation === TrackVariation.TURN_LEFT}
                onClick={() => handleVariationClick(TrackVariation.TURN_LEFT)}
              >
                <IconVariationTurnLeft className="block w-6 h-6" />
              </Toggle>
              <Toggle
                isActive={trackSettings.variation === TrackVariation.FORWARD}
                onClick={() => handleVariationClick(TrackVariation.FORWARD)}
              >
                <IconVariationForward className="block w-6 h-6" />
              </Toggle>
              <Toggle
                isActive={trackSettings.variation === TrackVariation.TURN_RIGHT}
                onClick={() => handleVariationClick(TrackVariation.TURN_RIGHT)}
              >
                <IconVariationTurnRight className="block w-6 h-6" />
              </Toggle>
            </div>
            {/* <TrackSettingsConnector {...trackSettings} /> */}
            <div className="mt-2">
              <div className="w-[158px] flex justify-between">
                <Toggle
                  isActive={trackSettings.angle === TrackAngle.UP}
                  onClick={() => handleAngleClick(TrackAngle.UP)}
                >
                  <IconAngleUp className="block w-6 h-6" />
                </Toggle>
                <Toggle
                  isActive={trackSettings.angle === TrackAngle.STRAIGHT}
                  onClick={() => handleAngleClick(TrackAngle.STRAIGHT)}
                >
                  <IconAngleStraight className="block w-6 h-6" />
                </Toggle>
                <Toggle
                  isActive={trackSettings.angle === TrackAngle.DOWN}
                  onClick={() => handleAngleClick(TrackAngle.DOWN)}
                >
                  <IconAngleDown className="block w-6 h-6" />
                </Toggle>
              </div>
            </div>
          </div>

          <div className="flex justify-between w-[158px] mt-8 items-center">
            <div className="flex flex-col">
              <DangerStripes />
              <Button onClick={() => {}} colors={config.danger}>
                <span className="block text-sm">DEL</span>
              </Button>
              <DangerStripes />
            </div>

            <Button onClick={handleAddClick} colors={config.success}>
              <span className="block text-sm">ADD</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTrackModal;