<svelte:options tag="octoprint-card" />

<script lang="ts">
  import Preview from "./Preview.svelte";
  import type { HomeAssistant } from "custom-card-helpers/dist/types";
  import { afterUpdate } from "svelte";

  export let hass: HomeAssistant;
  export let state;
  let config: { [key: string]: any } = {};

  export function setConfig(conf = {}) {
    config = { ...conf };
  }

  afterUpdate(() => {
    if (hass) {
      state = hass?.states[config?.entity];
    }
  });
</script>

<ha-card>
  <Preview />
  <p><b>{state?.attributes?.friendly_name}</b>: {state?.state}</p>
</ha-card>

<style>
  p {
    color: red;
  }
  div {
    background: var(--primary-color);
  }
</style>
