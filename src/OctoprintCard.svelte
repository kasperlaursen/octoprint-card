<svelte:options tag="op-c" />

<script lang="ts">
  import Preview from "./Preview.svelte"; // Needs import to work!

  import type { HomeAssistant } from "custom-card-helpers/dist/types";
  import { afterUpdate } from "svelte";
  import type { IConfig, IStates } from "./config";
  import { getStateFromHass } from "./state-helper";

  export let hass: HomeAssistant;
  export let state: IStates = {};
  let config: IConfig = {};

  // Home Assistant will call this with the config object!
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
      <a href={config.octoPrintUrl} target="_blank" title="Link to Web UI">
        <ha-icon icon="mdi:link-variant" />
      </a>
    {/if}
  </div>
</ha-card>

<style>
  .actions {
    padding: 1rem;
  }
</style>
