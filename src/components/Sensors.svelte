<script lang="ts">
</script>

<div class="sensors">
  <slot>Goes here!</slot>
</div>

<style>
  .sensors {
    display: flex;
    border-top: 1px solid rgba(255, 255, 255, 0.4);
    grid-area: sensors;
  }

  :global(.sensors > * + *) {
    border-left: 1px solid rgba(255, 255, 255, 0.4);
  }
</style>
