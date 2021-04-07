<svelte:options tag="octoprint-card-preview" />

<script lang="ts">
  import type { IStates } from "./config";

  export let state: IStates = {};
</script>

<div class="preview">
  <b class="current-state">{state.currentState}</b>
  <b class="print-percentage">{state.jobPercentage}%</b>
  <div class="tool">
    <span>Tool:</span>
    <b>{state.toolActual}°C / {state.toolTarget}°C</b>
  </div>
  <div class="bed">
    <span>Bed:</span>
    <b>{state.bedActual}°C / {state.bedTarget}°C</b>
  </div>
  <div class="elapsed">
    <ha-icon icon="mdi:clock-start" />
    <span>{state.timeElapsed} Elapsed</span>
  </div>
  <div class="remaining">
    <ha-icon icon="mdi:clock-end" />
    <span>{state.timeRemaining} Remaining</span>
  </div>
</div>

<style>
  .preview {
    background: var(--primary-color);
    border-radius: var(--ha-card-border-radius, 4px)
      var(--ha-card-border-radius, 4px) 0 0;
    padding: 4px;
    color: var(--text-primary-color);
  }
</style>
