var Input = {}
Input.activeController = -1;
Input.enabled = false;

function setupInput(dropdown_id, control_toggle_button_id) {
    if (Controller.supported) {
        Controller.search();

        window.addEventListener("gc.controller.found", function (event) {
            updateControllerDropdown(dropdown_id);
        });
        window.addEventListener("gc.controller.lost", function (event) {
            updateControllerDropdown(dropdown_id);
        });

        $(dropdown_id).change(function () {
            Input.activeController = $(dropdown_id).val();
        });

        var button = $(control_toggle_button_id);
        button.click(function () {
            if (button.text() == "Enable") {
                Input.enabled = true;
                button.removeClass("btn-success");
                button.addClass("btn-danger");
                button.text("Disable");
            } else {
                Input.enabled = false;
                button.addClass("btn-success");
                button.removeClass("btn-danger");
                button.text("Enable");
            }
        });

        console.log("Searching for controllers...");

        return 1;
    } else {
        return -1;
    }
}

function updateControllerDropdown(dropdown_id) {
    var dropdown = $(dropdown_id);
    var selectedController = dropdown.val();

    dropdown.empty();

    var el = document.createElement("option");
    el.textContent = "Choose a controller...";
    el.value = -1;
    dropdown.append(el);

    console.log(Controller.controllers);

    for (var c in Controller.controllers) {
        var controller = Controller.controllers[c];
        var val = c;
        var name = controller.name;
        console.log(name, val);
        var el = document.createElement("option");
        el.textContent = parseInt(val) + ": " + name;
        el.value = parseInt(val);
        dropdown.append(el);
    }
}

function getInputs() {
    
    if (Input.enabled && Input.activeController>=0 && Controller.getController(Input.activeController) !== undefined) {
        var controller = Controller.getController(Input.activeController);

        // console.log(controller.inputs);
       
        var LStick_Horiz = controller.inputs.analogSticks.LEFT_ANALOG_STICK.position.x;
        var LStick_Vert = controller.inputs.analogSticks.LEFT_ANALOG_STICK.position.y;
        var RStick_Horiz = controller.inputs.analogSticks.RIGHT_ANALOG_STICK.position.x;
        var RStick_Vert = controller.inputs.analogSticks.RIGHT_ANALOG_STICK.position.y;
        var Triggers = controller.inputs.buttons.RIGHT_SHOULDER_BOTTOM.value - controller.inputs.buttons.LEFT_SHOULDER_BOTTOM.value;

        var joys = { LStick_Horiz, LStick_Vert, RStick_Horiz, RStick_Vert, Triggers };
        
        var A_button = controller.inputs.buttons.FACE_1.pressed;
        var B_button = controller.inputs.buttons.FACE_2.pressed;
        var X_button = controller.inputs.buttons.FACE_3.pressed;
        var Y_button = controller.inputs.buttons.FACE_4.pressed;
        var L_Shoulder = controller.inputs.buttons.LEFT_SHOULDER.pressed;
        var R_Shoulder = controller.inputs.buttons.RIGHT_SHOULDER.pressed;
        var Back_button = controller.inputs.buttons.SELECT.pressed;
        var Start_button = controller.inputs.buttons.START.pressed;
        var LStick_Press = controller.inputs.buttons.LEFT_ANALOG_BUTTON.pressed;
        var RStick_Press = controller.inputs.buttons.RIGHT_ANALOG_BUTTON.pressed;

        var butt = { A_button, B_button, X_button, Y_button, L_Shoulder, R_Shoulder, Back_button, Start_button, LStick_Press, RStick_Press };

        var dpad_up = controller.inputs.buttons.DPAD_UP.pressed;
        var dpad_right = controller.inputs.buttons.DPAD_RIGHT.pressed;
        var dpad_down = controller.inputs.buttons.DPAD_DOWN.pressed;
        var dpad_left = controller.inputs.buttons.DPAD_LEFT.pressed;

        var dpad = { dpad_up, dpad_right, dpad_down, dpad_left };
    }
    else {
        var LStick_Horiz = 0;
        var LStick_Vert = 0;
        var RStick_Horiz = 0;
        var RStick_Vert = 0;
        var Triggers = 0;

        var joys = { LStick_Horiz, LStick_Vert, RStick_Horiz, RStick_Vert, Triggers };

        var A_button = false;
        var B_button = false;
        var X_button = false;
        var Y_button = false;
        var L_Shoulder = false;
        var R_Shoulder = false;
        var Back_button = false;
        var Start_button = false;
        var LStick_Press = false;
        var RStick_Press = false;

        var butt = { A_button, B_button, X_button, Y_button, L_Shoulder, R_Shoulder, Back_button, Start_button, LStick_Press, RStick_Press };

        var dpad_up = false;
        var dpad_right = false;
        var dpad_down = false;
        var dpad_left = false;

        var dpad = { dpad_up, dpad_right, dpad_down, dpad_left };
    }

    return { joys, butt, dpad };
}

export { setupInput, getInputs }