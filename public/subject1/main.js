var gl;
var canvas;
var legacygl;
var drawutil;
var camera;
var p0, p2;
var controlPoints;
var selected = null;

function factorial(k) {
    var result = 1;
    for (var i = 1; i <= k; i++) {
        result *= i;
    }
    return result;
}

function combination(n, k) {
    return factorial(n) / (factorial(k) * factorial(n-k));
}

function internal_division(a, b, t) {
    return numeric.add(numeric.mul(t, a), numeric.mul(1 - t, b));
}

function eval_quadratic_bezier(p0, p1, p2, t) {
    var p01 = internal_division(p0, p1, t);
    var p12 = internal_division(p1, p2, t);
    return internal_division(p01, p12, t);
}

function eval_bezier(a, b, controls, t) {
    if (controls.length < 1) {
        console.error("number of control points is not enough. length: ", controls.length);
    }
    var n = 1 + controls.length;
    var sum = numeric.mul(Math.pow((1 - t), n), a);
    for (var i = 0; i < controls.length; i++) {
        var j = i + 1;
        sum = numeric.add(sum, numeric.mul(combination(n, j) * Math.pow(t, j) * Math.pow((1 - t), n - j), controls[i]));
    }
    sum = numeric.add(sum, numeric.mul(Math.pow(t, n), b));
    return sum;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // projection & camera position
    mat4.perspective(legacygl.uniforms.projection.value, Math.PI / 6, canvas.aspect_ratio(), 0.1, 1000);
    var modelview = legacygl.uniforms.modelview;
    camera.lookAt(modelview.value);
    
    // xy grid
    gl.lineWidth(1);
    legacygl.color(0.5, 0.5, 0.5);
    drawutil.xygrid(100);
    
    // draw line segments composing curve
    legacygl.color(1, 0.6, 0.2);
    legacygl.begin(gl.LINE_STRIP);
    var numsteps = Number(document.getElementById("input_numsteps").value);
    for (var i = 0; i <= numsteps; ++i) {
        var t = i / numsteps;
        legacygl.vertex2(eval_bezier(p0, p2, controlPoints, t));
    }
    legacygl.end();
    // draw sample points
    if (document.getElementById("input_show_samplepoints").checked) {
        legacygl.begin(gl.POINTS);
        for (var i = 0; i <= numsteps; ++i) {
            var t = i / numsteps;
            legacygl.vertex2(eval_bezier(p0, p2, controlPoints, t));
        }
        legacygl.end();
    }

    // draw control points
    if (document.getElementById("input_show_controlpoints").checked) {
        legacygl.color(0.2, 0.5, 1);
        legacygl.begin(gl.LINE_STRIP);
        legacygl.vertex2(p0);
        for (const p of controlPoints) {
            legacygl.vertex2(p);
        }
        legacygl.vertex2(p2);
        legacygl.end();
        legacygl.begin(gl.POINTS);
        legacygl.vertex2(p0);
        for (const p of controlPoints) {
            legacygl.vertex2(p);
        }
        legacygl.vertex2(p2);
        legacygl.end();
    }
}

function mouseWin2canvasPos(mouse_win) {
    var viewport = [0, 0, canvas.width, canvas.height];
    mouse_win = [mouse_win[0], mouse_win[1], 1];
    var mouse_obj = glu.unproject(mouse_win,
                                    legacygl.uniforms.modelview.value,
                                    legacygl.uniforms.projection.value,
                                    viewport);
    // just reuse the same code as the 3D case
    var plane_origin = [0, 0, 0];
    var plane_normal = [0, 0, 1];
    var eye_to_mouse = numeric.sub(mouse_obj, camera.eye);
    var eye_to_origin = numeric.sub(plane_origin, camera.eye);
    var s1 = numeric.dot(eye_to_mouse, plane_normal);
    var s2 = numeric.dot(eye_to_origin, plane_normal);
    var eye_to_intersection = numeric.mul(s2 / s1, eye_to_mouse);
    return numeric.add(camera.eye, eye_to_intersection);
}

function init() {
    // OpenGL context
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("experimental-webgl");
    if (!gl)
        alert("Could not initialise WebGL, sorry :-(");
    var vertex_shader_src = "\
        attribute vec3 a_vertex;\
        attribute vec3 a_color;\
        varying vec3 v_color;\
        uniform mat4 u_modelview;\
        uniform mat4 u_projection;\
        void main(void) {\
            gl_Position = u_projection * u_modelview * vec4(a_vertex, 1.0);\
            v_color = a_color;\
            gl_PointSize = 5.0;\
        }\
        ";
    var fragment_shader_src = "\
        precision mediump float;\
        varying vec3 v_color;\
        void main(void) {\
            gl_FragColor = vec4(v_color, 1.0);\
        }\
        ";
    legacygl = get_legacygl(gl, vertex_shader_src, fragment_shader_src);
    legacygl.add_uniform("modelview", "Matrix4f");
    legacygl.add_uniform("projection", "Matrix4f");
    legacygl.add_vertex_attribute("color", 3);
    legacygl.vertex2 = function(p) {
        this.vertex(p[0], p[1], 0);
    };
    drawutil = get_drawutil(gl, legacygl);
    camera = get_camera(canvas.width);
    camera.eye = [0, 0, 7];
    p0 = [-0.5, -0.6];
    p2 = [-0.4, 1.3];
    controlPoints = [[1.2, 0.5]];
    // event handlers
    canvas.onmousedown = function(evt) {
        var mouse_win = this.get_mousepos(evt);
        if (evt.altKey) {
            camera.start_moving(mouse_win, evt.shiftKey ? "zoom" : "pan");
            return;
        }
        if (document.getElementById("input_add_controlpoints").checked) {
            var p = mouse_win;
            vec2.copy(p, mouseWin2canvasPos(mouse_win));

            selected = p;
            controlPoints.push(p);
            draw();
            document.getElementById("input_add_controlpoints").checked = false;
            return;
        }
        // pick nearest object
        var points = controlPoints.concat([p0, p2]);
        var viewport = [0, 0, canvas.width, canvas.height];
        var dist_min = 10000000;
        for (const p of points) {
            var object_win = glu.project([p[0], p[1], 0],
                                         legacygl.uniforms.modelview.value,
                                         legacygl.uniforms.projection.value,
                                         viewport);
            var dist = vec2.dist(mouse_win, object_win);
            if (dist < dist_min) {
                dist_min = dist;
                selected = p;
            }
        }
    };
    canvas.onmousemove = function(evt) {
        var mouse_win = this.get_mousepos(evt);
        if (camera.is_moving()) {
            camera.move(mouse_win);
            draw();
            return;
        }
        if (selected != null) {
            vec2.copy(selected, mouseWin2canvasPos(mouse_win));
            draw();
        }
    }
    document.onmouseup = function (evt) {
        if (camera.is_moving()) {
            camera.finish_moving();
            return;
        }
        selected = null;
    };
    // init OpenGL settings
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
}
