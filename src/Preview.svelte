<svelte:options tag="op-c-preview" />

<script lang="ts">
  import Time from "./components/Time.svelte";
  import Temperature from "./components/Temperature.svelte";
  import type { IStates } from "./config";
  import { afterUpdate } from "svelte";

  export let state: IStates = {};
  export let image: string;
  let timeElapsed;
  let timeRemaining;

  let mediaSource: string;
  let streamWasSet: boolean;

  afterUpdate(() => {
    timeElapsed = state.timeElapsed && parseInt(state.timeElapsed);
    timeRemaining = state.timeRemaining && parseInt(state.timeRemaining);
    const stream = getStreamUrl(state.cameraStream);
    mediaSource = streamWasSet ? mediaSource : stream || image;
  });

  const toggleSource = () => {
    streamWasSet = true;
    const stream = getStreamUrl(state.cameraStream);
    mediaSource = mediaSource.includes("camera_proxy") ? image : stream;
  };

  const getStreamUrl = (url: string) =>
    url.replace("camera_proxy", "camera_proxy_stream");
</script>

<div class="preview">
  <b class="current-state">{state.currentState}</b>
  <b class="print-percentage">{state.jobPercentage}%</b>
  <div class="content" on:click={toggleSource}>
    <img src={mediaSource} alt="Representation or your 3D Printer" />
  </div>
  <div class="progress" style="--percentage: {state.jobPercentage}%" />
  <div class="sensors">
    <Temperature
      cssClass="tool"
      label="Tool Temperature"
      actual={state.toolActual}
      target={state.toolTarget}
    />
    <Temperature
      cssClass="tool"
      label="Bed Temperature"
      actual={state.bedActual}
      target={state.bedTarget}
    />
    {#if timeElapsed && timeRemaining}
      <div class="elapsed">
        <Time bind:seconds={timeElapsed} />
        <span>Elapsed</span>
      </div>
      <div class="remaining">
        <Time bind:seconds={timeRemaining} />
        <span>Remaining</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .preview {
    background: var(--primary-color);
    border-radius: var(--ha-card-border-radius, 4px)
      var(--ha-card-border-radius, 4px) 0 0;
    color: var(--text-primary-color);

    display: grid;
    grid-template-areas:
      "state percentage"
      "content content"
      "progress progress"
      "sensors sensors";
  }
  .current-state {
    grid-area: state;
    padding: 1rem;
  }
  .print-percentage {
    grid-area: percentage;
    text-align: right;
    padding: 1rem;
  }

  .sensors {
    display: flex;
    border-top: 1px solid rgba(255, 255, 255, 0.4);
    grid-area: sensors;
  }
  .sensors > div {
    padding: 1rem;
    text-align: center;
    flex-grow: 1;
  }

  .sensors > div > span {
    display: block;
  }

  .sensors > div + div {
    border-left: 1px solid rgba(255, 255, 255, 0.4);
  }

  .content {
    grid-area: content;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    cursor: pointer;
  }
  img {
    max-width: 90%;
    max-height: 300px;
  }

  .progress {
    position: relative;
    grid-area: progress;
    height: 5px;
    width: var(--percentage);
    background-color: rgba(255, 255, 255, 0.7);
    transition: width 0.5s;
  }
</style>
