export { default as default } from "./OctoprintCard.svelte";

// Make Typescript Happy!
declare global {
  interface Window {
    customCards?: any[]; // Todo: Find correct type
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "tag-name",
  name: "Octoprint Card",
  preview: false,
  description: "Octoprint card",
});
