<p align="center">
  <img height=200 src="https://user-images.githubusercontent.com/8472619/114278237-1320f700-9a2f-11eb-80d9-ac86238cccd5.png"/>
</p>

<h4 align="center">Lovelace 3D Printer Card</h2>
<strong align="center">All your 3D Printer info in a single card!</strong>

---

**⚠️ Work in progress, use at your own risk ⚠️**

**Contents:**  
[Introduction](#Introduction)  
[Intallation](#Intallation)   
[Properties](#Properties)  

# Introduction
This lovelace card is created for the purpose of collecting all relevant data about your 3D Printer.  
For the design I have been heavily inspired by the awesome [vacuum-card](https://github.com/denysdovhan/vacuum-card) by [Denys Dovhan](https://github.com/denysdovhan).

| Camera (Printing) | Image (Idle) | Camera (Idle) |
|---|---|---|
| ![image](https://user-images.githubusercontent.com/8472619/114276747-50ce5180-9a28-11eb-99d5-2f921a8aba67.png) | ![Screenshot 2021-04-10 at 17 58 54](https://user-images.githubusercontent.com/8472619/114276753-5deb4080-9a28-11eb-8ee9-3ce6b31cec29.png) | ![Screenshot 2021-04-10 at 17 59 01](https://user-images.githubusercontent.com/8472619/114276763-66437b80-9a28-11eb-9cc6-1585f46b1cc5.png) |

# Intallation

## Hass (Not Ready Yet)
## Manual. 

1. Download the `octoprint-card.js` file from the `/public/` directory
2. Pload the file to your Home Assistant `config/local` folder
3. Add a reference to the card to your lovelace instance   
    Go to `Configuration` → `Lovelace Dashboards` → `Resources Tab` → `Click Plus button`. 
      **Url:** `/local/vacuum-card.js`
      **Resource type:** `JavaScript Module` 
      _Note: If you do not see the Resources Tab, you will need to enable Advanced Mode in your User Profile_
4. Add the custom:octoprint-card to Lovelace UI as you normally would!

There are currently no Configuration UI, copy the yaml from below to and modify the properties to fit your installation.

**Configuration example:**
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
