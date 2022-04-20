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

function handle_button_input(event) {}

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
  $('#battery_voltage').attr('style', `width: ${((message.batteryVoltage-24)/(34-24))*100}%`);
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
