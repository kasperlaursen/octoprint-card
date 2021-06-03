import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import css from "rollup-plugin-css-only";

const production = !process.env.dev;

const MAIN_COMPONENT_NAME = "OctoprintCard";
const MAIN_COMPONENT_REGEX = /OctoprintCard\.svelte$/;
const TAG_NAME = production ? "octoprint-card" : "octoprint-card-dev";
const FILE_NAME = `${TAG_NAME}.js`;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default {
  input: "src/main.ts",
  output: {
    sourcemap: () => {
      return !production;
    },
    format: "umd",
    name: MAIN_COMPONENT_NAME,
    file: `public/${FILE_NAME}`,
  },
  plugins: [
    replace({
      "tag-name": TAG_NAME,
      preventAssignment: true,
    }),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
        customElement: true,
      },
      emitCss: true,
      include: MAIN_COMPONENT_REGEX,
      preprocess: sveltePreprocess(),
    }),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
        customElement: false,
      },
      emitCss: true,
      exclude: MAIN_COMPONENT_REGEX,
      preprocess: sveltePreprocess(),
    }),

    // HACK! Inject nested CSS into custom element shadow root
    css({
      output(nestedCSS, styleNodes, bundle) {
        const code = bundle[FILE_NAME].code;
        const escapedCssChunk = nestedCSS
          .replace(/\n/g, "")
          .replace(/[\\"']/g, "\\$&")
          .replace(/\u0000/g, "\\0");

        const matches = code.match(/<style>(.*)<\/style>/);

        if (matches && matches[1]) {
          const style = matches[1];
          bundle[FILE_NAME].code = code.replace(
            style,
            `${style}${escapedCssChunk}`
          );
        } else {
          throw new Error(
            "Couldn't shadowRoot <style> tag for injecting styles"
          );
        }
      },
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
