# Octoprint Card (For Home Assistant Lovelace)
**Work in progress, use at your own risk!**

This Lovelace card is ment to show the currently availalbe sensors form the octorpint integration.  
It also shows an image or a stream that you define. 

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

**_Current State_**
| Printing | Image (Idle) | Camera (Idle) |
|---|---|---|
| ![image](https://user-images.githubusercontent.com/8472619/114276747-50ce5180-9a28-11eb-99d5-2f921a8aba67.png) | ![Screenshot 2021-04-10 at 17 58 54](https://user-images.githubusercontent.com/8472619/114276753-5deb4080-9a28-11eb-8ee9-3ce6b31cec29.png) | ![Screenshot 2021-04-10 at 17 59 01](https://user-images.githubusercontent.com/8472619/114276763-66437b80-9a28-11eb-9cc6-1585f46b1cc5.png) |



**_First Mockup_**.

<img width="502" alt="image" src="https://user-images.githubusercontent.com/8472619/114065273-c4daef00-989a-11eb-81af-d9531207d16d.png">


