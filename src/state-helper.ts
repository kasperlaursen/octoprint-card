import type { IStates, ITemperatureState } from "./config";
import type { HomeAssistant } from "custom-card-helpers";

export const getStateFromHass = (
  hass: HomeAssistant,
  config: { [key: string]: any }
): IStates => {
  return {
    bedActual: getTemperatureState(hass, config?.bedActual),
    bedTarget: getTemperatureState(hass, config?.bedTarget),
    toolActual: getTemperatureState(hass, config?.toolActual),
    toolTarget: getTemperatureState(hass, config?.toolTarget),
    currentState: hass.states[config?.currentState].state,
    timeElapsed: hass.states[config?.timeElapsed].state,
    timeRemaining: hass.states[config?.timeRemaining].state,
    jobPercentage: hass.states[config?.jobPercentage].state,
    printing: hass.states[config?.printing].state,
    cameraStream: hass.states[config?.videoSource].attributes.entity_picture,
  };
};

const getTemperatureState = (
  hass: HomeAssistant,
  entity_id: string
): ITemperatureState => ({
  value: hass.states[entity_id].state,
  unit: hass.states[entity_id].attributes.unit_of_measurement,
});
