function updateIK (theta, joys, butt, dpad, speed, rot_speed, fast_axis1_speed, max_allowed_rates) {

    theta = math.multiply(theta,math.pi/180)

    var LStick_Horiz = joys.LStick_Horiz
    var LStick_Vert = joys.LStick_Vert
    var RStick_Horiz = joys.RStick_Horiz
    var RStick_Vert = joys.RStick_Vert
    var Triggers = joys.Triggers

    var A_button = butt.A_button
    var B_button = butt.B_button
    var X_button = butt.X_button
    var Y_button = butt.Y_button
    var L_Shoulder = butt.L_Shoulder
    var R_Shoulder = butt.R_Shoulder
    var Back_button = butt.Back_button
    var Start_button = butt.Start_button
    var LStick_Press = butt.LStick_Press
    var RStick_Press = butt.RStick_Press

    var dpad_up = dpad.dpad_up
    var dpad_right = dpad.dpad_right
    var dpad_down = dpad.dpad_down
    var dpad_left = dpad.dpad_left

    var J = Jfunc(theta)
    var { T_1_0, T_2_1, T_3_2, T_4_3, T_5_4, T_6_5, T_H_6, T_2_0, T_3_0, T_4_0, T_5_0, T_6_0, T_H_0 } = this.getTransforms(theta)
    var { p_1_0, p_2_0, p_3_0, p_4_0, p_5_0, p_6_0, p_H_0 } = this.getPoints(T_1_0, T_2_0, T_3_0, T_4_0, T_5_0, T_6_0, T_H_0)
    var Jdet = math.det(J)
    if (Jdet == 0) {
        console.warn("J is not invertible!");
        return;
    } else {
        var Jinv = math.inv(J) // Should probably be pseudo-inverse, but math.js doesn't have that function
    }

    var p_H_0_2d = math.resize(p_H_0, [2])
    var dist2d = math.norm(p_H_0_2d)

    var relative_mode = L_Shoulder;
    var direct_rotation_mode = R_Shoulder;

    var delta_theta_dot = [0, 0, 0, 0, 0, 0]
    var X_dot_des = [0, 0, 0, 0, 0, 0]

    if (direct_rotation_mode) {
        delta_theta_dot[3] = rot_speed * max_allowed_rates[3] * -RStick_Vert
        delta_theta_dot[4] = rot_speed * max_allowed_rates[4] * -RStick_Horiz
        delta_theta_dot[5] = rot_speed * max_allowed_rates[5] * -LStick_Horiz
    } else if (!direct_rotation_mode && !relative_mode) {
        X_dot_des[0] = speed * -LStick_Vert
        X_dot_des[1] = speed * -RStick_Vert
        delta_theta_dot[0] = speed * -RStick_Horiz / dist2d * 1.5
    } else if (!direct_rotation_mode && relative_mode) {
        X_dot_des[0] = speed * -LStick_Vert
        X_dot_des[1] = speed * -RStick_Vert
        X_dot_des[2] = speed * -RStick_Horiz
    }

    delta_theta_dot[0] += fast_axis1_speed * (dpad_left * 1 + dpad_right * -1)

    if (relative_mode) {
        var T_control = math.multiply(T_5_0, [[0, 1, 0, 0], [-1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]])
    } else {
        var T_control = T_1_0;
    }

    T_control.subset(math.index([0, 1, 2], 3), p_H_0)
    var R_control = T_control.subset(math.index([0, 1, 2], [0, 1, 2]))

    var X_dot_des_vec = [X_dot_des[0], X_dot_des[2], X_dot_des[1]]
    var X_dot_des_vec_rotated = math.multiply(R_control, X_dot_des_vec)

    var X_dot_des_Now = [0, 0, 0, 0, 0, 0]
    X_dot_des_Now[0] = X_dot_des_vec_rotated._data[0]
    X_dot_des_Now[1] = X_dot_des_vec_rotated._data[1]
    X_dot_des_Now[2] = X_dot_des_vec_rotated._data[2]
    X_dot_des_Now = math.transpose(math.matrix(X_dot_des_Now))

    var theta_rates = math.multiply(Jinv, X_dot_des_Now)
    theta_rates = math.add(theta_rates, delta_theta_dot)

    if (math.sum(math.larger(math.abs(theta_rates), max_allowed_rates)) > 0) {
        max_rate = max(math.abs(dotDivide(theta_rates, max_allowed_rates)))
        theta_rates = dotDivide(theta_rates, max_rate)
    }

    return { theta_rates, Jdet, T_control, T_1_0, T_2_1, T_3_2, T_4_3, T_5_4, T_6_5, T_H_6, T_2_0, T_3_0, T_4_0, T_5_0, T_6_0, T_H_0, p_1_0, p_2_0, p_3_0, p_4_0, p_5_0, p_6_0, p_H_0 }

}

function getPoints (T_1_0, T_2_0, T_3_0, T_4_0, T_5_0, T_6_0, T_H_0) {

    var p_0 = math.transpose(math.matrix([0, 0, 0, 1]));

    var p_1_0 = math.resize(math.multiply(T_1_0, p_0), [3]);
    var p_2_0 = math.resize(math.multiply(T_2_0, p_0), [3]);
    var p_3_0 = math.resize(math.multiply(T_3_0, p_0), [3]);
    var p_4_0 = math.resize(math.multiply(T_4_0, p_0), [3]);
    var p_5_0 = math.resize(math.multiply(T_5_0, p_0), [3]);
    var p_6_0 = math.resize(math.multiply(T_6_0, p_0), [3]);
    var p_H_0 = math.resize(math.multiply(T_H_0, p_0), [3]);

    return { p_1_0, p_2_0, p_3_0, p_4_0, p_5_0, p_6_0, p_H_0 }

}

function getTransforms (theta) {
    var T_1_0 = T_1_to_0(theta);
    var T_2_1 = T_2_to_1(theta);
    var T_3_2 = T_3_to_2(theta);
    var T_4_3 = T_4_to_3(theta);
    var T_5_4 = T_5_to_4(theta);
    var T_6_5 = T_6_to_5(theta);
    var T_H_6 = T_H_to_6(theta);

    var T_2_0 = math.multiply(T_1_0, T_2_1)
    var T_3_0 = math.multiply(T_2_0, T_3_2)
    var T_4_0 = math.multiply(T_3_0, T_4_3)
    var T_5_0 = math.multiply(T_4_0, T_5_4)
    var T_6_0 = math.multiply(T_5_0, T_6_5)
    var T_H_0 = math.multiply(T_6_0, T_H_6)

    return {
        T_1_0, T_2_1, T_3_2, T_4_3, T_5_4, T_6_5, T_H_6, T_2_0, T_3_0, T_4_0, T_5_0, T_6_0, T_H_0
    }

}