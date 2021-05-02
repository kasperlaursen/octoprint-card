export interface IStates {
  bedActual?: ITemperatureState;
  bedTarget?: ITemperatureState;
  toolActual?: ITemperatureState;
  toolTarget?: ITemperatureState;
  currentState?: string;
  timeElapsed?: number;
  timeRemaining?: number;
  jobPercentage?: string;
  printing?: string;
  cameraStream?: string;
}

export interface ITemperatureState {
  value: string;
  unit: string;
}

export interface IUnitTemperature {
  actual: ITemperatureState;
  target: ITemperatureState;
}

/**
 * The config object expected form Home Assistant
 */
export interface IConfig {
  bedActual?: string;
  bedTarget?: string;
  toolActual?: string;
  toolTarget?: string;
  currentState?: string;
  timeElapsed?: string;
  timeRemaining?: string;
  jobPercentage?: string;
  printing?: string;
  imageUrl?: string;
  videoSource?: string;
  octoPrintUrl?: string;
}
