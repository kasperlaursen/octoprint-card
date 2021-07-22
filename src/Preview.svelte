<script lang="ts">
  import {
    timeElapsed,
    timeRemaining,
    bed,
    tool,
    jobPercentage,
    printerState,
    cameraStream,
  } from "./stores";
  import Sensors from "./components/Sensors.svelte";
  import TimeSensor from "./components/TimeSensor.svelte";
  import Temperature from "./components/Temperature.svelte";

  export let image: string;
  let stream: string;

  let mediaSource: string;
  let streamWasSet: boolean;

  cameraStream.subscribe((value) => {
    stream = value?.replace("camera_proxy", "camera_proxy_stream");
    mediaSource = streamWasSet ? mediaSource : stream || image;
  });

  const toggleSource = () => {
    streamWasSet = true;
    mediaSource = mediaSource === stream ? image : stream;
  };
</script>

<div class="preview">
  <b class="current-state">{$printerState}</b>
  <b class="print-percentage">{$jobPercentage ? `${$jobPercentage}%` : ""}</b>
  <div class="content" on:click={toggleSource}>
    <img src={mediaSource} alt="Representation or your 3D Printer" />
  </div>
  <div
    class="progress"
    style="--percentage: {$jobPercentage ? `${$jobPercentage}%` : '0px'}"
  />
  <Sensors>
    <Temperature
      cssClass="tool"
      label="Tool Temperature"
      actual={$tool?.actual}
      target={$tool?.target}
    />
    <Temperature
      cssClass="tool"
      label="Bed Temperature"
      actual={$bed?.actual}
      target={$bed?.target}
    />
    {#if $timeElapsed || $timeRemaining}
      <TimeSensor cssClass="elapsed" seconds={$timeElapsed} label={"Elapsed"} />
      <TimeSensor
        cssClass="remaining"
        seconds={$timeRemaining}
        label={"Remaining"}
      />
    {/if}
  </Sensors>
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
