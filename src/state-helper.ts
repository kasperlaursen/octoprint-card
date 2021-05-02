import {
  bed,
  tool,
  printerState,
  timeElapsed,
  timeRemaining,
  jobPercentage,
  printing,
  cameraStream,
} from "./stores";
import type { IConfig, ITemperatureState } from "./config";
import type { HomeAssistant } from "custom-card-helpers";

export const setStoresFromHass = (
  hass: HomeAssistant,
  config: IConfig
): void => {
  bed.set({
    actual: getTemperatureState(hass, config?.bedActual),
    target: getTemperatureState(hass, config?.bedTarget),
  });
  tool.set({
    actual: getTemperatureState(hass, config?.toolActual),
    target: getTemperatureState(hass, config?.toolTarget),
  });
  printerState.set(hass.states[config?.currentState].state);
  timeElapsed.set(toInt(hass.states[config?.timeElapsed].state));
  timeRemaining.set(toInt(hass.states[config?.timeRemaining].state));
  jobPercentage.set(toInt(hass.states[config?.jobPercentage].state));
  printing.set(hass.states[config?.printing].state === "on");
  cameraStream.set(hass.states[config?.videoSource].attributes.entity_picture);
};

const toInt = (input: string): number | null => {
  const output = parseInt(input);
  return output || null;
};

const getTemperatureState = (
  hass: HomeAssistant,
  entity_id: string
): ITemperatureState => ({
  value: hass.states[entity_id].state,
  unit: hass.states[entity_id].attributes.unit_of_measurement,
});
