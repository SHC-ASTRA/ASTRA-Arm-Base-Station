// Element References for Quick Access
var ros_status;

// ROS Instance Object
var ros;

// ROS Subscribers
var battery_sub;

// ROS Publishers


// global control variables


var control_input_delay = 100; // milliseconds
var last_control_input = 0;
var control_input_enabled = true;

function setup() {

  console.log("Setting Up")

  var LStick_Horiz = 0
  var LStick_Vert = 0
  var RStick_Horiz = 0
  var RStick_Vert = 0
  var Triggers = 0

  var joys = { LStick_Horiz, LStick_Vert, RStick_Horiz, RStick_Vert, Triggers }

  var A_button = false
  var B_button = false
  var X_button = false
  var Y_button = false
  var L_Shoulder = false
  var R_Shoulder = false
  var Back_button = false
  var Start_button = false
  var LStick_Press = false
  var RStick_Press = false

  var butt = { A_button, B_button, X_button, Y_button, L_Shoulder, R_Shoulder, Back_button, Start_button, LStick_Press, RStick_Press }

  var dpad_up = false
  var dpad_right = false
  var dpad_down = false
  var dpad_left = false

  var dpad = { dpad_up, dpad_right, dpad_down, dpad_left }

  var speed = 2.5;
  var rot_speed = 1;
  var fast_axis1_speed = 30;
  var max_allowed_rates = [30, 4, 4, 10, 15, 30]

  var theta = [1, 2, 3, 4, 5, 6]
  var out = updateIK(theta, joys, butt, dpad, speed, rot_speed, fast_axis1_speed, max_allowed_rates)
  console.log(out)

  // Establish all element references for later use
  ros_status = $('#ros_status_output');

  ros = new ROSLIB.Ros({
    url: `ws://${window.location.hostname}:9090`,
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


  battery_sub = new ROSLIB.Topic({
    ros: ros,
    name: '/teensy/battery_status',
    messageType: 'embedded_controller_relay/BatteryReport',
  });

  // TODO: Arm pi performance reporter

  // TODO: Control rate output

  // TODO: Homing service

  // TODO: Enable/shutdown service

  battery_sub.subscribe(update_battery);

  $('#enable_input').change(enable_control_input);
  $('#disable_input').change(disable_control_input);

  setup_controller();
}

function setup_controller() {
  // Documentation: https://github.com/samiare/Controller.js/wiki
  if (Controller.supported) {
    Controller.search();
    $('#game_controller_status').text('Searching for controller...');
  } else {
    $('#game_controller_status').text(
      'This browser does not support game controllers...'
    );
  }

  window.addEventListener(
    'gc.controller.found',
    function (event) {
      var controller = event.detail.controller;
      $('#game_controller_status').text(
        'Controller found at index ' + controller.index + '.'
      );
    },
    false
  );

  window.addEventListener('gc.analog.hold', handle_analog_input, false);
  window.addEventListener(
    'gc.analog.end',
    function (event) {
      // Reset the timer to ensure this event is published
      last_control_input = 0;
      handle_analog_input(event);
    },
    false
  );
  // window.addEventListener("gc.button.hold", handle_button_input, false);
}

function handle_analog_input(event) {
  var input = event.detail;

  if (input.name == 'RIGHT_ANALOG_STICK') {
    direction = input.position.y;
  } else if (input.name == 'LEFT_ANALOG_STICK') {
    speed = -input.position.y; // Controller Inputs are inverted
  }

  // Only skips publishing an input
  if (
    Date.now() - last_control_input < control_input_delay ||
    !control_input_enabled
  )
    return;

  var control_input = new ROSLIB.Message({
    channel: 'base_human_input',
    heading: [speed, direction],
    speed_clamp: Math.sqrt(speed * speed + direction * direction),
    is_urgent: false,
  });

  human_control_pub.publish(control_input);

  last_control_input = Date.now();
}

function handle_button_input(event) { }

function enable_control_input(event) {
  control_input_enabled = true;
  console.log('enable');
}

function disable_control_input(event) {
  control_input_enabled = false;

  var control_input = new ROSLIB.Message({
    channel: 'base_human_input',
    heading: [0.0, 0.0],
    speed_clamp: 1,
    is_urgent: false,
  });

  human_control_pub.publish(control_input);

  console.log('disable');
}

function ros_log(log) {
  time = new Date().toTimeString().split(' ')[0];
  ros_status.text('[' + time + '] ' + log + '\n' + ros_status.text());
}

function update_battery(message) {
  $('#battery_charge').text((message.batteryCharge * 100).toFixed(2) + '%');
  $('#battery_charge').attr('style', `width: ${message.batteryCharge * 100}%`);
  $('#battery_charge').removeClass(['bg-warning', 'bg-success', 'bg-danger']);

  if (message.batteryCharge > 0.25) {
    $('#battery_charge').addClass('bg-success');
  } else if (message.batteryCharge > 0.1) {
    $('#battery_charge').addClass('bg-warning');
  } else {
    $('#battery_charge').addClass('bg-danger');
  }

  $('#battery_voltage').text((message.batteryVoltage).toFixed(1) + 'V');
  $('#battery_voltage').attr('style', `width: ${((message.batteryVoltage - 24) / (34 - 24)) * 100}%`);
  $('#battery_voltage').removeClass(['bg-warning', 'bg-success', 'bg-danger']);

  if (message.batteryVoltage > 30) {
    $('#battery_voltage').addClass('bg-success');
  } else if (message.batteryVoltage > 28) {
    $('#battery_voltage').addClass('bg-warning');
  } else {
    $('#battery_voltage').addClass('bg-danger');
  }
}

// Run Setup after the document loads
window.onload = setup;
