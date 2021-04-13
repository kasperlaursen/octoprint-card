<svelte:options tag="op-c" />

<script lang="ts">
  import Preview from "./Preview.svelte"; // Needs import to work!

  import type { HomeAssistant } from "custom-card-helpers/dist/types";
  import { afterUpdate } from "svelte";
  import type { IStates } from "./config";
  import { getStateFromHass } from "./state-helper";

  export let hass: HomeAssistant;
  export let state: IStates = {};
  let config: { [key: string]: any } = {};

  export function setConfig(conf = {}) {
    config = { ...conf };
  }

  afterUpdate(() => {
    if (hass) {
      state = getStateFromHass(hass, config);
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
