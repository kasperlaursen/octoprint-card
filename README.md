<p align="center">
  <img height=200 src="https://user-images.githubusercontent.com/8472619/114278237-1320f700-9a2f-11eb-80d9-ac86238cccd5.png"/>
</p>

<h3 align="center">Lovelace 3D Printer Card</h2>
<p align="center">
  <strong align="center">All your 3D Printer info in one place!</strong>
</p>

---

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/kasperlaursen/octoprint-card?include_prereleases)](https://GitHub.com/kasperlaursen/octoprint-card/releases/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/kasperlaursen/octoprint-card/graphs/commit-activity)
![Dependencies](https://img.shields.io/david/kasperlaursen/octoprint-card.svg)
[![Tasks untill v1](https://img.shields.io/github/issues-search/kasperlaursen/octoprint-card?label=Tasks%20before%20v1%20release&query=is%3Aopen%20is%3Aissue%20project%3Akasperlaursen%2Foctoprint-card%2F1)](https://github.com/kasperlaursen/octoprint-card/projects/1)
![GitHub last commit](https://img.shields.io/github/last-commit/kasperlaursen/octoprint-card)
![Svelte](https://img.shields.io/badge/Made%20with-Svelte-orange)

**⚠️ Work in progress, use at your own risk ⚠️**

**Contents:**

[🚪 Introduction](#Introduction)  
[💽 Intallation](#Intallation)  
[📖 Properties](#Properties)  
[💻 Development](#Development)  
[⌨️ How to Contribute](#how-to-contribute)  

# Introduction

This lovelace card is created for the purpose of collecting all relevant data about your 3D Printer.  
For the design I have been heavily inspired by the awesome [vacuum-card](https://github.com/denysdovhan/vacuum-card) by [Denys Dovhan](https://github.com/denysdovhan).

| Camera (Printing)                                                                                              | Image (Idle)                                                                                                                               | Camera (Idle)                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ![image](https://user-images.githubusercontent.com/8472619/114276747-50ce5180-9a28-11eb-99d5-2f921a8aba67.png) | ![Screenshot 2021-04-10 at 17 58 54](https://user-images.githubusercontent.com/8472619/114276753-5deb4080-9a28-11eb-8ee9-3ce6b31cec29.png) | ![Screenshot 2021-04-10 at 17 59 01](https://user-images.githubusercontent.com/8472619/114276763-66437b80-9a28-11eb-9cc6-1585f46b1cc5.png) |

# Intallation

## HACS (Not Ready Yet)

## Manual

1. Download the `octoprint-card.js` file from the [Releases Page](https://github.com/kasperlaursen/octoprint-card/releases)
2. Upload the file to your Home Assistant `config/local` folder
3. Add a reference to the card to your lovelace instance  
   Go to `Configuration` → `Lovelace Dashboards` → `Resources Tab` → `Click Plus button`.  
   **Url:** `/local/vacuum-card.js`  
   **Resource type:** `JavaScript Module`  
   _Note: If you do not see the Resources Tab, you will need to enable Advanced Mode in your User Profile_
4. Add the custom:octoprint-card to Lovelace UI as you normally would!

There are currently no Configuration UI, copy the yaml from below to and modify the properties to fit your installation.

### Configuration example

```yaml
type: "custom:octoprint-card"
bedActual: sensor.octoprint_actual_bed_temp
bedTarget: sensor.octoprint_target_bed_temp
toolActual: sensor.octoprint_actual_tool0_temp
toolTarget: sensor.octoprint_target_tool0_temp
currentState: sensor.octoprint_current_state
timeElapsed: sensor.octoprint_time_elapsed
timeRemaining: sensor.octoprint_time_remaining
jobPercentage: sensor.octoprint_job_percentage
printing: binary_sensor.octoprint_printing
imageUrl: /local/printer.svg
videoSource: camera.prusa_3d_printer
octoPrintUrl: http://192.168.50.116/
```

# Properties

| Name            |   Type   | Default      | Description                                                   |
| --------------- | :------: | ------------ | ------------------------------------------------------------- |
| `type`          | `string` | **Required** | `custom:octoprint-card`                                       |
| `bedActual`     | `string` | **Required** | The entity_id for your printers **Current** Bed Temperature   |
| `bedTarget`     | `string` | **Required** | The entity_id for your printers **Target** Bed Temperature    |
| `toolActual`    | `string` | **Required** | The entity_id for your printers **Current** Tool Temperature  |
| `toolTarget`    | `string` | **Required** | The entity_id for your printers **Target** Tool Temperature   |
| `currentState`  | `string` | **Required** | The entity_id for your printers current state                 |
| `timeElapsed`   | `string` | **Required** | The entity_id for the time elapsed on the current print job   |
| `timeRemaining` | `string` | **Required** | The entity_id for the time remaining on the current print job |
| `jobPercentage` | `string` | **Required** | The entity_id for the print job percentage sensor             |
| `printing`      | `string` | **Required** | The entity_id for the printing binary sensor                  |
| `imageUrl`      | `string` | Optional     | Path to image of your printer.                                |
| `videoSource`   | `string` | Optional     | The entity_id for a camera                                    |
| `octoPrintUrl`  | `string` | Optional     | An url for the link button (Meant for link to Octoprint UI)   |

# Development

I though I would give som technical background about the project, and also let you know how you can contribute.

## Why Svelte?

The most common framework used for Lovelace cards seems to be `lit-element` but I chose to jump on the [Svelte](https://svelte.dev) hype train and learn something different.

This is my first "Real project" using Svelte and I think it is a simple and easy framework to use.

## Goals

### Short Term

The project has just begun, and I have a lot of ideas for improvement!  
On the [project board](https://github.com/kasperlaursen/octoprint-card/projects/1) you can see the planed tasks for the v1 release!

### Mid term

Custom actions based on Home Assistant Scripts.  
Some sort of nice looking Temperature Charts.  
Making a custom animated svg progress indicator resembling a printer printing a Benchy.

### Long term

The current Octoprint integration in Home Assistant does not really seem complete to me.  
I think there are a lot of possible improvements and additions. So in the long run i hope to be able to contribute to that as well, and update this Card to have even more functionality.

Adding Printer Play/Pause/Stop actions.  
Starting a print for existing g-code.

# How to Contribute

I Would love to wee what ideas you have. Any contributions are happily welcomed!

1. Fork the repo.
2. Make your changes on your fork ([How to run locally](#Running-locally))
3. Open a Pull Request from your fork against the main branch.
4. Remember to add a nice description of what your changes are intended to do.
5. I will get back to you as soon as possible!

## Running locally

1. Clone this repository to your local machine

```
git clone https://github.com/kasperlaursen/octoprint-card.git
```

2. Go to the folder

```
cd octoprint-card
```

3. Install dependencies

```
npm install
```

3. Start the local development server, which will recompile the code on file changes.

```
npm run dev
```

4. Add the dev card to your Lovelace resources using the url `http://localhost:5000/octoprint-card-dev.js`

5. Add the card to your dashboard with `type: 'custom:octoprint-card-dev'` and the rest of [the config](#Configuration-example)

## Prerequisite

To run the project locally you need to have [node.js](https://nodejs.org/en/) installed on your machine.
