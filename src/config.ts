export interface IStates {
  bedActual?: ITemperatureState;
  bedTarget?: ITemperatureState;
  toolActual?: ITemperatureState;
  toolTarget?: ITemperatureState;
  currentState?: string;
  timeElapsed?: string;
  timeRemaining?: string;
  jobPercentage?: string;
  printing?: string;
  cameraStream?: string;
}

export interface ITemperatureState {
  value: string;
  unit: string;
}
