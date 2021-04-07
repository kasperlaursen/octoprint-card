<svelte:options tag="octoprint-card" />

<script lang="ts">
  import { afterUpdate } from "svelte";
  export let hass;
  export let state;
  let config: { [key: string]: any } = {};

  export function setConfig(conf = {}) {
    config = { ...conf };
  }

  afterUpdate(() => {
    console.log("the component just updated", hass);
    if (hass) {
      state = hass?.states[config?.entity];
      console.log(state);
    }
  });
</script>

<ha-card>
  <p><b>{state?.attributes?.friendly_name}</b>: {state?.state}</p>
</ha-card>

<style>
</style>
