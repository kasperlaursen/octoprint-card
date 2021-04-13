<svelte:options tag="op-c" />

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
        bedActual: {
          value: hass.states[config?.bedActual].state,
          unit: hass.states[config?.bedActual].attributes.unit_of_measurement,
        },
        bedTarget: {
          value: hass.states[config?.bedTarget].state,
          unit: hass.states[config?.bedTarget].attributes.unit_of_measurement,
        },
        toolActual: {
          value: hass.states[config?.toolActual].state,
          unit: hass.states[config?.toolActual].attributes.unit_of_measurement,
        },
        toolTarget: {
          value: hass.states[config?.toolTarget].state,
          unit: hass.states[config?.toolTarget].attributes.unit_of_measurement,
        },
        currentState: hass.states[config?.currentState].state,
        timeElapsed: hass.states[config?.timeElapsed].state,
        timeRemaining: hass.states[config?.timeRemaining].state,
        jobPercentage: hass.states[config?.jobPercentage].state,
        printing: hass.states[config?.printing].state,
        cameraStream:
          hass.states[config?.videoSource].attributes.entity_picture,
      };
      hass.callApi;
    }
  });
</script>

<ha-card class="parent">
  <op-c-preview {state} image={config.imageUrl} />
  <div class="actions">
    {#if config.octoPrintUrl}
      <a href={config.octoPrintUrl} target="_blank"
        ><ha-icon icon="mdi:link-variant" /></a
      >
    {/if}
  </div>
</ha-card>

<style>
  .actions {
    padding: 0.5rem;
  }
</style>
