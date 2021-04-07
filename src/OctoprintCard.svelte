<svelte:options tag="octoprint-card" />

<script lang="ts">
  import Preview from "./Preview.svelte"; // Needs import to work!

  import type { HomeAssistant } from "custom-card-helpers/dist/types";
  import { afterUpdate } from "svelte";
  import type { IStates } from "./config";

  export let hass: HomeAssistant;
  export let state: IStates = {};
  export let entityMatch;
  let config: { [key: string]: any } = {};

  export function setConfig(conf = {}) {
    config = { ...conf };
    const entity = config.entity;
    entityMatch = entity?.substring(
      entity.lastIndexOf(".") + 1,
      entity.lastIndexOf("_")
    );
  }

  afterUpdate(() => {
    if (hass) {
      state = {
        bedActual: hass.states[config?.bedActual].state,
        bedTarget: hass.states[config?.bedTarget].state,
        toolActual: hass.states[config?.toolActual].state,
        toolTarget: hass.states[config?.toolTarget].state,
        currentState: hass.states[config?.currentState].state,
        timeElapsed: hass.states[config?.timeElapsed].state,
        timeRemaining: hass.states[config?.timeRemaining].state,
        jobPercentage: hass.states[config?.jobPercentage].state,
        printing: hass.states[config?.printing].state,
      };
      hass.callApi;
    }
  });
</script>

<ha-card class="parent">
  <octoprint-card-preview {state} />
  Actions goes here!
</ha-card>

<style>
</style>
