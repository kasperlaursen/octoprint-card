<script lang="ts">
  import { afterUpdate } from "svelte";

  export let seconds: any;
  export let label: string;
  export let cssClass: string;

  let minutes;
  let hours;

  afterUpdate(() => {
    minutes = twoDidgetNumber((seconds / 60) % 60);
    hours = twoDidgetNumber(seconds / 60 / 60);
  });

  const twoDidgetNumber = (number) =>
    number.toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      maximumFractionDigits: 0,
      useGrouping: false,
    });
</script>

<div class={`timeSensor ${cssClass}`}>
  <b>
    {#if parseInt(hours) > 0}
      {hours}h
    {/if}
    {minutes}m
  </b>

  <div>{label}</div>
</div>

<style>
  .timeSensor {
    padding: 1rem;
    text-align: center;
  }
</style>
