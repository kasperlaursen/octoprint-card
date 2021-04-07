# Octoprint Card (For Home Assistant Lovelace)

This is meant to be a general card for showing any relevant info about your 3D printer through Octoprint!

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
```
