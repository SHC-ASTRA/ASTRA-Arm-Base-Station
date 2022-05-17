import * as disp from 'armdisplay'
import * as inputHandler from 'inputHandler'

// Element References for Quick Access
var ros_status;

// ROS Instance Object
var ros;

// ROS Subscribers


// ROS Publishers


// ROS Clients


// global config variables

var speed = 2.5;
var rot_speed = 1;
var fast_axis1_speed = 30;
var max_allowed_rates = [30, 4, 4, 10, 15, 30];

function setup() {

  console.log("Setting Up")

  inputHandler.setupInput("#controllerDropdown", "#controlToggleButton");

  // Establish all element references for later use
  ros_status = $('#ros_status_output');

  ros = new ROSLIB.Ros({
    url: `ws://192.168.1.2:9090`,
  });

  ros.on('connection', function () {
    ros_log('Connected to websocket server.');
  });

  ros.on('error', function (error) {
    ros_log('Error connection to websocket server: ' + error);
  });

  ros.on('close', function () {
    ros_log('Connection to websocket server closed.');
  });

  // TODO: Control rate output

  // TODO: Homing service

  // TODO: Enable/shutdown service

  disp.setup_3d();
  disp.animate();

  setInterval(control_loop,20);
}

var theta = [20, 60, -100, 20, -20, 45];

function control_loop() {
  // Get Current Controller State

  var { joys, butt, dpad } = inputHandler.getInputs();

  // Get Current ROS State

  // Update IK based on Controller and ROS states

  var out = updateIK(theta, joys, butt, dpad, speed, rot_speed, fast_axis1_speed, max_allowed_rates)

  // Send command to arm

  for (let index = 0; index < theta.length; index++) {
   
    theta[index] += out.theta_rates._data[index]*200/1000;
    
  }
  
  // console.log(out)

  // Send display commands to 3d window

  disp.set_axes(theta);
  disp.set_grip(0.5);

}

function ros_log(log) {
  var time = new Date().toTimeString().split(' ')[0];
  ros_status.text('[' + time + '] ' + log + '\n' + ros_status.text());
}

// Run Setup after the document loads
window.onload = setup;
