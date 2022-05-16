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
var grip_link_1r;
var grip_link_2r;
var grip_link_1l;
var grip_link_2l;
var jaw_r;
var jaw_l;
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
  camera = new THREE.PerspectiveCamera(75, width / height, 0.005, 50);
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
  var link_material = new THREE.MeshPhongMaterial({ color: 0x7f347f });
  var gripper_material = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
  
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

  axis2 = new THREE.Object3D();
  objLoader.load('assets/models/Axis2.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = axis2_material;
      }
    });
    axis2.add(obj);
  });
  axis2.position.y+= 0.1889;
  axis1.add(axis2);

  axis3 = new THREE.Object3D();
  objLoader.load('assets/models/Axis3.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = axis3_material;
      }
    });
    axis3.add(obj);
  });
  axis3.position.z+= 0.56;
  axis2.add(axis3);

  axis4 = new THREE.Object3D();
  objLoader.load('assets/models/Axis4.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = axis4_material;
      }
    });
    axis4.add(obj);
  });
  axis4.position.z+= 0.415;
  axis3.add(axis4);

  axis5 = new THREE.Object3D();
  objLoader.load('assets/models/Axis5.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = axis5_material;
      }
    });
    axis5.add(obj);
  });
  axis5.position.z+= 0.071;
  axis5.position.y+= 0.02175;
  axis4.add(axis5);

  axis6 = new THREE.Object3D();
  objLoader.load('assets/models/Axis6.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = axis6_material;
      }
    });
    axis6.add(obj);
  });
  axis6.position.z+= 0.0325;
  axis5.add(axis6);

  
  grip_link_1r = new THREE.Object3D();
  grip_link_2r = new THREE.Object3D();
  grip_link_1l = new THREE.Object3D();
  grip_link_2l = new THREE.Object3D();

  objLoader.load('assets/models/GripperLink.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = link_material;
      }
    });
    grip_link_1r.add(obj);
  });

  objLoader.load('assets/models/GripperLink.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = link_material;
      }
    });
    grip_link_2r.add(obj);
  });

  objLoader.load('assets/models/GripperLink.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = link_material;
      }
    });
    grip_link_1l.add(obj);
  });

  objLoader.load('assets/models/GripperLink.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = link_material;
      }
    });
    grip_link_2l.add(obj);
  });
  
  grip_link_1r.position.z += 0.0865;
  grip_link_1r.position.x += 0.013;
  grip_link_1r.rotation.y += 1;
  
  grip_link_2r.position.z += 0.106;
  grip_link_2r.position.x += 0.006;
  grip_link_2r.rotation.y += 1;
  
  grip_link_1l.position.z += 0.0865;
  grip_link_1l.position.x -= 0.013;
  grip_link_1l.rotation.y -= 1;
  
  grip_link_2l.position.z += .106;
  grip_link_2l.position.x -= 0.006;
  grip_link_2l.rotation.y -= 1;

  axis6.add(grip_link_1r);
  axis6.add(grip_link_2r);
  axis6.add(grip_link_1l);
  axis6.add(grip_link_2l);

  jaw_l = new THREE.Object3D();
  jaw_r = new THREE.Object3D();

  objLoader.load('assets/models/Jaw.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = gripper_material;
      }
    });
    jaw_l.add(obj);
  });

  objLoader.load('assets/models/Jaw.obj', (obj) => {
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = gripper_material;
      }
    });
    jaw_r.add(obj);
  });

  jaw_l.position.z += 0.06;
  jaw_r.position.z += 0.06;
  jaw_r.rotation.z = 3.1415;
  jaw_r.rotation.y -= 1;
  jaw_l.rotation.y += 1;

  grip_link_1r.add(jaw_r);
  grip_link_1l.add(jaw_l);

  scene.add(base);

  const pointlight = new THREE.PointLight(0xffffff, 0.2, 10)
  pointlight.position.set(0,0.5,3);
  scene.add(pointlight);

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

  axis1.rotation.y += 0.001;
  axis2.rotation.x -= 0.001;
  axis3.rotation.x += 0.001;
  axis4.rotation.x += 0.0005;
  axis5.rotation.y -= 0.0005;
  axis6.rotation.z -= 0.0005;

  grip_link_1r.rotation.y -= 0.001;
  grip_link_2r.rotation.y -= 0.001;
  jaw_r.rotation.y += 0.001;
  
  grip_link_1l.rotation.y += 0.001;
  grip_link_2l.rotation.y += 0.001;
  jaw_l.rotation.y -= 0.001;

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
