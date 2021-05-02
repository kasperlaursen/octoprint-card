import { Writable, writable } from "svelte/store";
import type { IUnitTemperature } from "./config";

export const bed: Writable<IUnitTemperature> = writable(null);
export const tool: Writable<IUnitTemperature> = writable(null);

export const printerState: Writable<string> = writable(null);

export const timeElapsed: Writable<number> = writable(null);
export const timeRemaining: Writable<number> = writable(null);

export const jobPercentage: Writable<number> = writable(null);
export const printing: Writable<boolean> = writable(null);

export const cameraStream: Writable<string> = writable(null);
