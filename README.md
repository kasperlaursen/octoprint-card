# Octoprint Card (For Home Assistant Lovelace)

This is meant to be a general card for showing any relevant info about your 3D printer through Octoprint!

**_First Mockup_**.

<img width="502" alt="image" src="https://user-images.githubusercontent.com/8472619/114065273-c4daef00-989a-11eb-81af-d9531207d16d.png">

## Configuration example

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
