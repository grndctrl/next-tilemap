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

import Button from './Button';
import colors, { config } from 'utils/colors';
import Toggle from './Toggle';
import TrackSettingsCurves from 'assets/TrackSettingsCurvesBackground';
import DangerStripes from './DangerStripes';

const TrackSettingsConnector = ({ variation, angle }: { variation: TrackVariation; angle: TrackAngle }) => {
  return (
    <div className="relative w-[192px] h-12 bg-black">
      <TrackSettingsCurves className="absolute top-1 left-6 w-[144px] text-purple-2 z-0" variation="background" />
      {/* left */}
      {variation === TrackVariation.TURN_LEFT && angle !== TrackAngle.UP && (
        <TrackSettingsCurves className="absolute top-0 left-0 z-10 w-16 h-12 glow text-red-1" variation="curve" />
      )}
      {variation !== TrackVariation.TURN_LEFT && angle === TrackAngle.UP && (
        <TrackSettingsCurves
          className="glow absolute top-0 left-0 z-10 w-16 h-12 transform scale-y-[-1] text-red-1"
          variation="curve"
        />
      )}
      {variation === TrackVariation.TURN_LEFT && angle === TrackAngle.UP && (
        <TrackSettingsCurves
          className="absolute top-0 left-0 z-10 w-16 h-12 transform glow text-red-1"
          variation="vertical"
        />
      )}

      {/* center */}
      {variation === TrackVariation.FORWARD && angle === TrackAngle.UP && (
        <TrackSettingsCurves
          className=" glow absolute top-0 left-[64px] z-10 w-16 h-12 scale-x-[-1] text-red-1"
          variation="curve"
        />
      )}
      {variation === TrackVariation.FORWARD && angle === TrackAngle.DOWN && (
        <TrackSettingsCurves
          className=" glow absolute top-0 left-[64px] z-10 w-16 h-12  text-red-1"
          variation="curve"
        />
      )}
      {variation === TrackVariation.TURN_LEFT && angle === TrackAngle.STRAIGHT && (
        <TrackSettingsCurves
          className=" glow absolute top-0 left-[64px] z-10 w-16 h-12 transform scale-y-[-1] scale-x-[-1] text-red-1"
          variation="curve"
        />
      )}
      {variation === TrackVariation.TURN_RIGHT && angle === TrackAngle.STRAIGHT && (
        <TrackSettingsCurves
          className=" glow absolute top-0 left-[64px] z-10 w-16 h-12 transform scale-y-[-1] text-red-1"
          variation="curve"
        />
      )}
      {variation === TrackVariation.FORWARD && angle === TrackAngle.STRAIGHT && (
        <TrackSettingsCurves
          className=" glow absolute top-0 left-[64px] z-10 w-16 h-12 transform text-red-1"
          variation="vertical"
        />
      )}
      {((variation === TrackVariation.TURN_LEFT && angle === TrackAngle.DOWN) ||
        (variation === TrackVariation.TURN_RIGHT && angle === TrackAngle.UP)) && (
        <TrackSettingsCurves
          className=" glow absolute top-0 left-[64px] z-10 w-16 h-12 transform text-red-1"
          variation="horizontal"
        />
      )}

      {/* right */}
      {variation === TrackVariation.TURN_RIGHT && angle !== TrackAngle.DOWN && (
        <TrackSettingsCurves
          className=" glow absolute top-0 right-0 z-10 w-16 h-12 scale-x-[-1] text-red-1"
          variation="curve"
        />
      )}
      {variation !== TrackVariation.TURN_RIGHT && angle === TrackAngle.DOWN && (
        <TrackSettingsCurves
          className=" glow absolute top-0 right-0 z-10 w-16 h-12 transform scale-y-[-1] scale-x-[-1] text-red-1"
          variation="curve"
        />
      )}
      {variation === TrackVariation.TURN_RIGHT && angle === TrackAngle.DOWN && (
        <TrackSettingsCurves
          className="absolute top-0 right-0 z-10 w-16 h-12 transform glow text-red-1"
          variation="vertical"
        />
      )}
    </div>
  );
};

const EditTrackModal = () => {
  const { trackSettings, setTrackSettings } = useInterfaceStore();
  const { length } = useTrack();

  const handleVariationClick = (variation: TrackVariation) => {
    setTrackSettings({ variation });
  };

  const handleAngleClick = (angle: TrackAngle) => {
    console.log(angle);
    setTrackSettings({ angle });
  };

  return (
    <div className="p-4 m-8 text-xl bg-opacity-20 w-[248px] backdrop-blur-xl bg-slate-900 crt">
      {length === 1 && <div>Pick start location</div>}
      {length === 0 && (
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

            <Button onClick={() => {}} colors={config.success}>
              <span className="block text-sm">ADD</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTrackModal;
