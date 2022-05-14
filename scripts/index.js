import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { OBJLoader } from 'OBJLoader';

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

var arm_canvas;
var scene;
var camera;
var renderer;
var base;
var axis1;
var axis2;
var axis3;
var axis4;
var axis5;
var axis6;
var controls;

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

  // TODO: Arm pi performance reporter

  // TODO: Control rate output

  // TODO: Homing service

  // TODO: Enable/shutdown service


  setup_3d();
  animate();
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

function setup_3d() {
  arm_canvas = document.getElementById("arm_display");
  const { width, height } = arm_canvas.getBoundingClientRect();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: arm_canvas });
  renderer.setSize(width, height);
  controls = new OrbitControls(camera, renderer.domElement);

  // const objLoader = new OBJLoader();
  // objLoader.load('assets/models/Axis0.obj', (root) => {
  //   scene.add(root);
  // });

  base = new THREE.Object3D();
  var base_material = new THREE.MeshPhongMaterial({ color: 0x808080 });
  const objLoader = new OBJLoader();
  objLoader.load('assets/models/Axis0.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = base_material;
      }
    });
    base.add(obj);
  });
  objLoader.load('assets/models/Rover.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = base_material;
      }
    });
    base.add(obj);
  });

  var axis1_material = new THREE.MeshPhongMaterial({ color: 0xff6969 });
  var axis4_material = new THREE.MeshPhongMaterial({ color: 0xffff69 });
  var axis2_material = new THREE.MeshPhongMaterial({ color: 0x69ff69 });
  var axis5_material = new THREE.MeshPhongMaterial({ color: 0x69ffff });
  var axis3_material = new THREE.MeshPhongMaterial({ color: 0x6969ff });
  var axis6_material = new THREE.MeshPhongMaterial({ color: 0xff69ff });
  
  axis1 = new THREE.Object3D();
  objLoader.load('assets/models/Axis1.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = axis1_material;
      }
    });
    axis1.add(obj);
  });
  axis1.position.y+= 0.05203;
  base.add(axis1);

  scene.add(base);

  const light = new THREE.HemisphereLight(0xeeeeee, 0x303030, 0.5);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  scene.add(directionalLight);

  const size = 3;
  const divisions = 30;
  const gridHelper = new THREE.GridHelper(size, divisions);
  gridHelper.position.y = -0.363 - 0.21 / 2;
  scene.add(gridHelper);

  // const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  // scene.add( light );

  camera.position.z = 3;
}

function animate() {
  requestAnimationFrame(animate);

  axis1.rotation.y += 0.01;

  renderer.render(scene, camera);
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
  var time = new Date().toTimeString().split(' ')[0];
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
