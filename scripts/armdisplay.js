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

var target;
var control_transform;
var x_arrow;
var y_arrow;
var z_arrow;
var x_body;
var y_body;
var z_body;
var x_head;
var y_head;
var z_head;

var axis1_arrow;
var axis4_arrow;
var axis5_arrow;
var axis6_arrow;
var axis1_arrow_body;
var axis4_arrow_body;
var axis5_arrow_body;
var axis6_arrow_body;
var axis1_arrow_head;
var axis4_arrow_head;
var axis5_arrow_head;
var axis6_arrow_head;


var arrow_radius = 0.01;
var arrow_head_radius = 0.02;
var arrow_head_length = 0.02;
var arrow_max_length = 0.1;
var arrow_offset = 0.03;

var axis1_offset = 0;
var axis2_offset = 0;
var axis3_offset = 0;
var axis4_offset = 0;
var axis5_offset = 0;
var axis6_offset = 0;
var grip_offset = -90;


var controls;

function setup_3d() {
    arm_canvas = document.getElementById("arm_display");
    const { width, height } = arm_canvas.getBoundingClientRect();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.005, 50);
    renderer = new THREE.WebGLRenderer({ canvas: arm_canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 4;
    controls.minDistance = 0.1;

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

    var target_material = new THREE.MeshPhongMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
    var target_mesh = new THREE.SphereGeometry(0.01);
    target = new THREE.Mesh(target_mesh, target_material);

    axis6.add(target);
    target.position.z += 0.2175;

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

    var x_material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    var y_material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    var z_material = new THREE.MeshPhongMaterial({ color: 0x0000ff });

    control_transform = new THREE.Object3D();
    x_arrow = new THREE.Object3D();
    y_arrow = new THREE.Object3D();
    z_arrow = new THREE.Object3D();

    var cyl_geom = new THREE.CylinderGeometry(arrow_radius, arrow_radius, arrow_max_length);
    var cone_geom = new THREE.ConeGeometry(arrow_head_radius, arrow_head_length);

    x_body = new THREE.Mesh(cyl_geom, x_material);
    x_body.position.y += arrow_max_length / 2;
    x_head = new THREE.Mesh(cone_geom, x_material);
    x_head.position.y += arrow_max_length + arrow_head_length / 2;
    x_arrow.add(x_body);
    x_arrow.add(x_head);

    x_arrow.rotation.z = Math.PI / 2;
    x_arrow.position.x -= arrow_offset;

    y_body = new THREE.Mesh(cyl_geom, y_material);
    y_body.position.y += arrow_max_length / 2;
    y_head = new THREE.Mesh(cone_geom, y_material);
    y_head.position.y += arrow_max_length + arrow_head_length / 2;
    y_arrow.add(y_body);
    y_arrow.add(y_head);

    y_arrow.position.y += arrow_offset;

    z_body = new THREE.Mesh(cyl_geom, z_material);
    z_body.position.y += arrow_max_length / 2;
    z_head = new THREE.Mesh(cone_geom, z_material);
    z_head.position.y += arrow_max_length + arrow_head_length / 2;
    z_arrow.add(z_body);
    z_arrow.add(z_head);

    z_arrow.rotation.x = Math.PI / 2;
    z_arrow.position.z += arrow_offset;

    control_transform.add(x_arrow);
    control_transform.add(y_arrow);
    control_transform.add(z_arrow);

    var axis1_torus_radius = 0.2;
    var axis1_torus_span = 1;
    axis1_arrow = new THREE.Object3D();
    var axis1_torus_geom = new THREE.TorusGeometry(axis1_torus_radius, arrow_radius, 8, 20, axis1_torus_span)
    var axis1_circle_geom = new THREE.CircleGeometry(arrow_radius, 8);
    axis1_arrow_body = new THREE.Mesh(axis1_torus_geom, x_material);
    axis1_arrow_head = new THREE.Mesh(cone_geom, x_material);
    var axis1_head_holder = new THREE.Object3D();
    var axis1_arrow_cap = new THREE.Mesh(axis1_circle_geom, x_material);
    axis1_arrow_head.position.x += axis1_torus_radius;
    axis1_head_holder.add(axis1_arrow_head)
    axis1_head_holder.rotation.z = axis1_torus_span;
    axis1_arrow_cap.position.x += axis1_torus_radius;
    axis1_arrow_cap.rotation.x += Math.PI / 2;
    axis1_arrow.add(axis1_arrow_body);
    axis1_arrow.add(axis1_head_holder);
    axis1_arrow.add(axis1_arrow_cap);
    axis1_arrow.rotation.x = Math.PI / 2;
    axis1_arrow.rotation.z = Math.PI / 2 - axis1_torus_span / 2;
    
    axis1.add(axis1_arrow);

    var axis4_torus_radius = 0.4;
    var axis4_torus_span = 0.5;
    axis4_arrow = new THREE.Object3D();
    var axis4_torus_geom = new THREE.TorusGeometry(axis4_torus_radius, arrow_radius, 8, 20, axis4_torus_span)
    var axis4_circle_geom = new THREE.CircleGeometry(arrow_radius, 8);
    axis4_arrow_body = new THREE.Mesh(axis4_torus_geom, y_material);
    axis4_arrow_head = new THREE.Mesh(cone_geom, y_material);
    var axis4_head_holder = new THREE.Object3D();
    var axis4_arrow_cap = new THREE.Mesh(axis4_circle_geom, y_material);
    axis4_arrow_head.position.x += axis4_torus_radius;
    axis4_head_holder.add(axis4_arrow_head)
    axis4_head_holder.rotation.z = axis4_torus_span;
    axis4_arrow_cap.position.x += axis4_torus_radius;
    axis4_arrow_cap.rotation.x += Math.PI / 2;
    axis4_arrow.add(axis4_arrow_body);
    axis4_arrow.add(axis4_head_holder);
    axis4_arrow.add(axis4_arrow_cap);
    axis4_arrow.rotation.y = -Math.PI / 2;
    axis4_arrow.rotation.z = - axis4_torus_span / 2;
    axis4.add(axis4_arrow);

    var axis5_torus_radius = 0.3;
    var axis5_torus_span = 0.7;
    axis5_arrow = new THREE.Object3D();
    var axis5_torus_geom = new THREE.TorusGeometry(axis5_torus_radius, arrow_radius, 8, 20, axis5_torus_span)
    var axis5_circle_geom = new THREE.CircleGeometry(arrow_radius, 8);
    axis5_arrow_body = new THREE.Mesh(axis5_torus_geom, x_material);
    axis5_arrow_head = new THREE.Mesh(cone_geom, x_material);
    var axis5_head_holder = new THREE.Object3D();
    var axis5_arrow_cap = new THREE.Mesh(axis5_circle_geom, x_material);
    axis5_arrow_head.position.x += axis5_torus_radius;
    axis5_head_holder.add(axis5_arrow_head)
    axis5_head_holder.rotation.z = axis5_torus_span;
    axis5_arrow_cap.position.x += axis5_torus_radius;
    axis5_arrow_cap.rotation.x += Math.PI / 2;
    axis5_arrow.add(axis5_arrow_body);
    axis5_arrow.add(axis5_head_holder);
    axis5_arrow.add(axis5_arrow_cap);
    axis5_arrow.rotation.x = Math.PI / 2;
    axis5_arrow.rotation.z = Math.PI / 2 - axis5_torus_span / 2;
    axis5.add(axis5_arrow);

    var axis6_torus_radius = 0.1;
    var axis6_torus_span = 4.5;
    axis6_arrow = new THREE.Object3D();
    var axis6_torus_geom = new THREE.TorusGeometry(axis6_torus_radius, arrow_radius, 8, 20, axis6_torus_span)
    var axis6_circle_geom = new THREE.CircleGeometry(arrow_radius, 8);
    axis6_arrow_body = new THREE.Mesh(axis6_torus_geom, z_material);
    axis6_arrow_head = new THREE.Mesh(cone_geom, z_material);
    var axis6_head_holder = new THREE.Object3D();
    var axis6_arrow_cap = new THREE.Mesh(axis6_circle_geom, z_material);
    axis6_arrow_head.position.x += axis6_torus_radius;
    axis6_head_holder.add(axis6_arrow_head)
    axis6_head_holder.rotation.z = axis6_torus_span;
    axis6_arrow_cap.position.x += axis6_torus_radius;
    axis6_arrow_cap.rotation.x += Math.PI / 2;
    axis6_arrow.add(axis6_arrow_body);
    axis6_arrow.add(axis6_head_holder);
    axis6_arrow.add(axis6_arrow_cap);
    // axis6_arrow.rotation.x = Math.PI / 2;
    axis6_arrow.rotation.z = -Math.PI / 2 - axis6_torus_span / 2;
    axis6_arrow.position.z += 0.1;
    axis5.add(axis6_arrow);
    

    scene.add(control_transform);

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

function set_control_frame(relative_mode, direct_rotation_mode) {
    var vector_target = new THREE.Vector3();
    var quat_target = new THREE.Quaternion();
    target.getWorldPosition(vector_target);
    target.getWorldQuaternion(quat_target);
    control_transform.position.copy(vector_target);

    if (!direct_rotation_mode) {
        y_arrow.visible = true;
        z_arrow.visible = true;
        axis4_arrow.visible = false;
        axis5_arrow.visible = false;
        axis6_arrow.visible = false;
        if (!relative_mode) {
            x_arrow.visible = false;
            axis1_arrow.visible = true;
            control_transform.rotation.y = axis1.rotation.y;
            control_transform.rotation.x = 0;
            control_transform.rotation.z = 0;
        }
        else {
            x_arrow.visible = true;
            axis1_arrow.visible = false;
            control_transform.setRotationFromQuaternion(quat_target);
        }
    }
    else {
        x_arrow.visible = false;
        y_arrow.visible = false;
        z_arrow.visible = false;
        axis1_arrow.visible = false;
        axis4_arrow.visible = true;
        axis5_arrow.visible = true;
        axis6_arrow.visible = true;
    }



}

export { setup_3d, animate, set_grip, set_axes, set_control_frame }