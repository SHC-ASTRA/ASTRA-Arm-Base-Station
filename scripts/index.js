import * as disp from 'armdisplay'
import * as inputHandler from 'inputHandler'

// Element References for Quick Access
var ros_status;

// ROS Instance Object
var ros;

// ROS Subscribers
var status_sub;
var feedback_sub;

// ROS Publishers
var control_pub;

// ROS Clients
var home_client;
var enable_client;
var zero_client;

// global config variables

var speed = 2.5;
var rot_speed = 1;
var fast_axis1_speed = 30;
var max_allowed_rates = [30, 4, 4, 10, 15, 30];

var theta_min = [-180, -15, -140, -75, -45, -180];
var theta_max = [180, 90, -40, 60, 45, 180];

function setup() {

  console.log("Setting Up")

  inputHandler.setupInput("#controllerDropdown", "#controlToggleButton");

  $('#rq_home').click(request_homing);
  $('#rq_home_low').click(request_homing_low);
  $('#force_home').click(force_homing);
  $('#force_home_low').click(force_homing_low);

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

  setInterval(control_loop, 20);
}

var theta = [20, 60, -100, 20, -20, 45];

function control_loop() {
  // Get Current Controller State

  var { joys, butt, dpad } = inputHandler.getInputs();

  // Get Current ROS State

  // Update IK based on Controller and ROS states

  var out = updateIK(theta, joys, butt, dpad, speed, rot_speed, fast_axis1_speed, max_allowed_rates)
  var theta_rates = out.theta_rates._data;

  // Verify limits

  // var new_theta = [...theta];
  // var limited = false;

  // for (let index = 0; index < theta.length; index++) {
  //   new_theta[index] += theta_rates[index] * 200 / 1000;
  //   if (new_theta[index] > theta_max[index] || new_theta[index] < theta_min[index])
  //   {
  //     limited = true;
  //   }
  // }

  // if (limited) {
  //   theta_rates = [0,0,0,0,0,0];
  // }

  // Send command to arm

  for (let index = 0; index < theta.length; index++) {
    theta[index] += theta_rates[index] * 200 / 1000;
  }
  update_axes(theta);

  // console.log(out)

  // Send display commands to 3d window

  disp.set_axes(theta);
  disp.set_control_frame(out.relative_mode, out.direct_rotation_mode);
  disp.set_grip(1);

}

function ros_log(log) {
  var time = new Date().toTimeString().split(' ')[0];
  ros_status.text('[' + time + '] ' + log + '\n' + ros_status.text());
}

function update_axes(thetas) {
  theta[5] = theta[5] = (((theta[5] - -180) % (180 - -180)) + (180 - -180)) % (180 - -180) + -180;
  for (let index = 0; index < thetas.length; index++) {
    $('#axis' + (index + 1) + '_bar').text(thetas[index].toFixed(1) + '°');
    $('#axis' + (index + 1) + '_bar').attr('style', `width: ${100 * (thetas[index] - theta_min[index]) / (theta_max[index] - theta_min[index])}%`);
  }
}

function request_homing() {
  ros_log("Requesting Homing")
  homing(false,false);
}
function request_homing_low() {
  ros_log("Requesting Low Homing")
  homing(true,false);
}
function force_homing() {
  ros_log("Forcing Homing")
  homing(false,true);
}
function force_homing_low() {
  ros_log("Forcing Low Homing")
  homing(true,true);
}
function homing(under10deg, force) {

}


function check_arm_enable()
{

}

function enable_arm()
{
  ros_log("Enabling Arm");
  set_arm_enable_state(true);
}
function disable_arm()
{
  ros_log("Disabling Arm");
  set_arm_enable_state(false);
}
function set_arm_enable_state(enabled)
{

}

// Run Setup after the document loads
window.onload = setup;
