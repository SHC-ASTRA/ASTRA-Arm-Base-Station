import * as disp from './armdisplay'
import * as inputHandler from './inputHandler'

// Element References for Quick Access
var ros_status;

// ROS Instance Object
var ros;

// ROS Subscribers
var ee_status_sub;
var ab_status_sub;
var feedback_sub;

// ROS Publishers
var control_pub;

// ROS Clients
var home_client;
var enable_client;
var arm_zero_client;
var ee_zero_client;
var laser_client;

// global config variables

var speed = 2.5;
var rot_speed = 1;
var fast_axis1_speed = 10;
var max_allowed_rates = [30, 4, 4, 10, 15, 30];

var theta_min = [-180, -15, -140, -75, -45, -180];
var theta_max = [180, 90, -40, 60, 45, 180];

var theta = [20, 60, -100, 20, -20, 45];
var grip_pct = 0;
var grip_speed = 50;

var laser_state = false;

function setup() {

  console.log("Setting Up")

  inputHandler.setupInput("#controllerDropdown", "#controlToggleButton");

  $('#rq_home').click(request_homing);
  $('#rq_home_low').click(request_homing_low);
  $('#force_home').click(force_homing);
  $('#force_home_low').click(force_homing_low);
  $('#laserToggleButton').click(toggle_laser);
  $('#zero_axis1').click(zero_axis_1);
  $('#zero_axis5').click(zero_axis_5);
  $('#zero_axis6').click(zero_axis_6);
  $('#zero_grip').click(zero_grip);
  $("#enable_arm").change(enable_arm);
  $("#disable_arm").change(disable_arm);

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

  ee_status_sub = new ROSLIB.Topic({
    ros: ros,
    name: '/ee/ee_status',
    messageType: 'endeffector_controller/EEStatus',
  });
  ab_status_sub = new ROSLIB.Topic({
    ros: ros,
    name: '/arm/ab_status',
    messageType: 'arm_relay/ABStatus',
  });
  feedback_sub = new ROSLIB.Topic({
    ros: ros,
    name: '/actuator_feedback',
    messageType: 'arm_relay/ActuatorFeedback',
  });

  control_pub = new ROSLIB.Topic({
    ros: ros,
    name: '/joint_rate_command',
    messageType: 'arm_relay/JointRateCommand',
  });

  home_client = new ROSLIB.Service({
    ros: ros,
    name: '/arm/home_arm_base',
    serviceType: '/arm_relay/HomeArmBase'
  });
  enable_client = new ROSLIB.Service({
    ros: ros,
    name: '/arm/enable_actuators',
    serviceType: '/arm_relay/EnableActuators'
  });
  arm_zero_client = new ROSLIB.Service({
    ros: ros,
    name: '/arm/zero_actuators',
    serviceType: '/arm_relay/ZeroAxis'
  });
  ee_zero_client = new ROSLIB.Service({
    ros: ros,
    name: '/ee/zero_actuators',
    serviceType: '/endeffector_controller/ZeroAxis'
  });
  laser_client = new ROSLIB.Service({
    ros: ros,
    name: '/ee/enable_laser',
    serviceType: '/endeffector_controller/EnableLaser'
  });

  // TODO: Control rate output

  // TODO: Homing service

  // TODO: Enable/shutdown service

  ee_status_sub.subscribe(process_ee_status);
  ab_status_sub.subscribe(process_arm_status);
  feedback_sub.subscribe(process_feedback);

  disp.setup_3d();
  disp.animate();

  setInterval(control_loop, 100);
}

function process_feedback(message) {
  if (message.axis > 0 && message.axis <= 6) {
    theta[message.axis - 1] = message.angle;
  }
  else if (message.axis == 7) {
    grip_pct = message.angle / 8.5;
  }
  update_axes(theta);
  disp.set_axes(theta);
}

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

  // for (let index = 0; index < theta.length; index++) {
  //   theta[index] += theta_rates[index] * 20 / 1000;
  // }

  for (let i = 0; i < theta_rates.length; i++) {
    const theta_rate = theta_rates[i];
    var control_input = new ROSLIB.Message({
      axis: i + 1,
      desiredRate: theta_rate
    });

    control_pub.publish(control_input);
  }

  var grip_rate = grip_speed * -joys.Triggers;
  var control_input = new ROSLIB.Message({
    axis: 7,
    desiredRate: grip_rate
  });

  control_pub.publish(control_input);



  // console.log(out)

  // Send display commands to 3d window

  update_axes(theta);
  update_grip(grip_pct);
  disp.set_axes(theta);
  disp.set_control_frame(out.relative_mode, out.direct_rotation_mode);
  disp.set_grip(grip_pct/100);
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

function update_grip(grip_percentage) {
  $('#grip_bar').text(grip_percentage.toFixed(0) + '%');
  $('#grip_bar').attr('style', `width: ${grip_percentage}%`);
}

function request_homing() {
  ros_log("Requesting Homing")
  homing(false, false);
}
function request_homing_low() {
  ros_log("Requesting Low Homing")
  homing(true, false);
}
function force_homing() {
  ros_log("Forcing Homing")
  homing(false, true);
}
function force_homing_low() {
  ros_log("Forcing Low Homing")
  homing(true, true);
}
function homing(under10deg, force) {
  var request = new ROSLIB.ServiceRequest({
    axis1Low: under10deg,
    force: force
  });
  home_client.callService(request)
}


function check_arm_enable() {

}

function enable_arm() {
  ros_log("Enabling Arm ...");
  set_arm_enable_state(true);
}
function disable_arm() {
  ros_log("Disabling Arm ...");
  set_arm_enable_state(false);
}
function set_arm_enable_state(enabled) {
  var request = new ROSLIB.ServiceRequest({
    enable: enabled
  });
  enable_client.callService(request, function (result) {
    set_enable_button_state(result.enabled);
    if (result.enabled) {
      ros_log("Enabled.")
    }
    else {
      ros_log("Disabled.")
    }
  })
}
function set_enable_button_state(enabled) {
  if (enabled) {
    $("#enable_arm").parent().addClass("active");
    $("#disable_arm").parent().removeClass("active");
  }
  else {
    $("#enable_arm").parent().removeClass("active");
    $("#disable_arm").parent().addClass("active");
  }
}

function zero_axis_1() {
  ros_log("Zeroing Axis 1 ...");
  zero_axis(1);
}
function zero_axis_5() {
  ros_log("Zeroing Axis 5 ...");
  zero_axis(5);
}
function zero_axis_6() {
  ros_log("Zeroing Axis 6 ...");
  zero_axis(6);
}
function zero_grip() {
  ros_log("Zeroing Grip ...");
  zero_axis(7);
}
function zero_axis(axisNum) {
  var request = new ROSLIB.ServiceRequest({
    axis: axisNum
  });
  if (axisNum == 1) {
    arm_zero_client.callService(request, function (result) {
      ros_log("Zeroed.")
    })
  }
  else {
    ee_zero_client.callService(request, function (result) {
      ros_log("Zeroed.")
    })
  }
}

function toggle_laser() {
  var button = $("#laserToggleButton");
  var currently_enabled = (button.text() == "Disable Laser");
  var now_enabled = !currently_enabled;
  set_laser_button_state(now_enabled);
  set_laser_enable_state(now_enabled);

  if (now_enabled) {
    ros_log("Enabling Laser ... ");
  }
  else {
    ros_log("Disabling Laser ... ");
  }

}

function set_laser_enable_state(enabled) {
  var request = new ROSLIB.ServiceRequest({
    enable: enabled
  });
  laser_client.callService(request, function (result) {
    if (result.enabled) {
      ros_log("Enabled.")
    }
    else {
      ros_log("Disabled.")
    }
  })
}

function set_laser_button_state(now_enabled) {
  var button = $("#laserToggleButton");
  if (!now_enabled) {
    button.removeClass("btn-success");
    button.addClass("btn-danger");
    button.text("Enable Laser");
    laser_state = false
  }
  else {
    button.addClass("btn-success");
    button.removeClass("btn-danger");
    button.text("Disable Laser");
    laser_state = true
  }
}

function process_ee_status(message) {
  if (message.laserOn != laser_state) {
    set_laser_button_state(message.laserOn);
  }
}

function process_arm_status(message) {
  if (message.enabled != $("#enable_arm").parent().hasClass("active")) {
    set_enable_button_state(message.enabled);
  }
}

// Run Setup after the document loads
window.onload = setup;
