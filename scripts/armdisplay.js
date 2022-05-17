import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { OBJLoader } from 'OBJLoader';

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


var axis1_offset = 0;
var axis2_offset = 0;
var axis3_offset = 0;
var axis4_offset = 0;
var axis5_offset = 0;
var axis6_offset = 0;
var grip_offset = -90;

function setup_3d() {
    arm_canvas = document.getElementById("arm_display");
    const { width, height } = arm_canvas.getBoundingClientRect();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.005, 50);
    renderer = new THREE.WebGLRenderer({ canvas: arm_canvas, antialias: true});
    renderer.setSize(width, height);
    renderer.setPixelRatio( window.devicePixelRatio * 1.5 );
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
    axis1.position.y += 0.05203;
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
    axis2.position.y += 0.1889;
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
    axis3.position.z += 0.56;
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
    axis4.position.z += 0.415;
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
    axis5.position.z += 0.071;
    axis5.position.y += 0.02175;
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
    axis6.position.z += 0.0325;
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
    pointlight.position.set(0, 0.5, 3);
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

    renderer.render(scene, camera);
}

function set_axis_1(theta1) {
    axis1.rotation.y = (theta1 + axis1_offset) * Math.PI / 180;
}

function set_axis_2(theta2) {
    axis2.rotation.x = -(theta2 + axis2_offset) * Math.PI / 180;
}

function set_axis_3(theta3) {
    axis3.rotation.x = -(theta3 + axis3_offset) * Math.PI / 180;
}

function set_axis_4(theta4) {
    axis4.rotation.x = -(theta4 + axis4_offset) * Math.PI / 180;
}

function set_axis_5(theta5) {
    axis5.rotation.y = (theta5 + axis5_offset) * Math.PI / 180;
}

function set_axis_6(theta6) {
    axis6.rotation.z = -(theta6 + axis6_offset) * Math.PI / 180;
}

function set_grip(grip_pct) {
    var grip_rotation = grip_pct * 60;
    grip_link_1r.rotation.y = -(grip_rotation + grip_offset) * Math.PI / 180;
    grip_link_2r.rotation.y = -(grip_rotation + grip_offset) * Math.PI / 180;
    jaw_r.rotation.y = (grip_rotation + grip_offset) * Math.PI / 180;

    grip_link_1l.rotation.y = (grip_rotation + grip_offset) * Math.PI / 180;
    grip_link_2l.rotation.y = (grip_rotation + grip_offset) * Math.PI / 180;
    jaw_l.rotation.y = -(grip_rotation + grip_offset) * Math.PI / 180;
}

function set_axes(thetas) {
    set_axis_1(thetas[0]);
    set_axis_2(thetas[1]);
    set_axis_3(thetas[2]);
    set_axis_4(thetas[3]);
    set_axis_5(thetas[4]);
    set_axis_6(thetas[5]);
}

export { setup_3d, animate, set_grip, set_axes }