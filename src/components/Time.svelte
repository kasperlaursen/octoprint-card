<svelte:options tag="op-c-time" />

<script lang="ts">
  import { afterUpdate } from "svelte";

  export let seconds: any;

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

<b>
  {#if parseInt(hours) > 0}
    {hours}h
  {/if}
  {minutes}m
</b>
