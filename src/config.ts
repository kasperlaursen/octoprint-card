export interface IStates {
  bedActual?: { value: string; unit: string };
  bedTarget?: { value: string; unit: string };
  toolActual?: { value: string; unit: string };
  toolTarget?: { value: string; unit: string };
  currentState?: string;
  timeElapsed?: string;
  timeRemaining?: string;
  jobPercentage?: string;
  printing?: string;
  cameraStream?: string;
}
