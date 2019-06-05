var gl;
var canvas;
var legacygl;
var drawutil;
var camera;
var linkages = [
    { angle : 0, length : 0.8 },
    { angle : 0, length : 0.9 },
    { angle : 0, length : 1.5 },
    { angle : 0, length : 0.7 },
];
var is_dragging = false;

function update_position() {
    linkages.forEach(function(linkage, index){
        linkage.position = [0, 0];
        var angle_sum = 0;
        for (var j = 0; j <= index; ++j) {
            angle_sum += linkages[j].angle;
            linkage.position[0] += linkages[j].length * Math.cos(angle_sum * Math.PI / 180);
            linkage.position[1] += linkages[j].length * Math.sin(angle_sum * Math.PI / 180);
        }
    });
};

function vec_sub(a, b) {
    return [b[0]-a[0], b[1]-a[1]];
}

function compute_ik(target_position) {
    for (var i = linkages.length - 1; i >= 0; i--) {
        var base_position = (linkages[i-1]|| {position: [0, 0]}).position;
        var top_position = linkages[linkages.length-1].position;
        var vec_a = vec_sub(base_position, target_position);
        var vec_b = vec_sub(base_position, top_position);

        // calc angle
        // http://www5d.biglobe.ne.jp/~noocyte/Programming/Geometry/RotationDirection.html
        var dot = vec_a[0] * vec_b[0] + vec_a[1] * vec_b[1];
        var prod = vec_a[0] * vec_b[1] - vec_a[1] * vec_b[0];
        var angle = Math.atan2(prod, dot) / Math.PI * 180;
        linkages[i].angle -= angle;
        update_position();
    }
};

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
    
    // linkages
    var selected = Number(document.getElementById("input_selected").value);
    legacygl.begin(gl.LINES);
    linkages.forEach(function(linkage, index){
        if (index == selected)
            legacygl.color(1, 0, 0);
        else
            legacygl.color(0, 0, 0);
        if (index == 0)
            legacygl.vertex(0, 0, 0);
        else
            legacygl.vertex2(linkages[index - 1].position);
        legacygl.vertex2(linkage.position);
    });
    legacygl.end();
    legacygl.begin(gl.POINTS);
    legacygl.color(0, 0, 0);
    legacygl.vertex(0, 0, 0);
    linkages.forEach(function(linkage, index){
        if (index == selected)
            legacygl.color(1, 0, 0);
        else
            legacygl.color(0, 0, 0);
        legacygl.vertex2(linkage.position);
    });
    legacygl.end();
};
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
    camera.center = [2, 0, 0];
    camera.eye = [2, 0, 7];
    update_position();
    // event handlers
    canvas.onmousedown = function(evt) {
        var mouse_win = this.get_mousepos(evt);
        if (evt.altKey) {
            camera.start_moving(mouse_win, evt.shiftKey ? "zoom" : "pan");
            return;
        }
        if (document.getElementById("input_ikmode").checked)
            is_dragging = true;
    };
    canvas.onmousemove = function(evt) {
        var mouse_win = this.get_mousepos(evt);
        if (camera.is_moving()) {
            camera.move(mouse_win);
            draw();
            return;
        }
        if (!is_dragging) return;
        var viewport = [0, 0, canvas.width, canvas.height];
        mouse_win.push(1);
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
        var target_position = numeric.add(camera.eye, eye_to_intersection);
        compute_ik(target_position);
        draw();
        document.getElementById("input_selected").onchange();
    }
    document.onmouseup = function (evt) {
        if (camera.is_moving()) {
            camera.finish_moving();
            return;
        }
        is_dragging = false;
    };
    document.getElementById("input_selected").max = linkages.length - 1;
    document.getElementById("input_selected").onchange = function(){
        document.getElementById("input_angle").value = linkages[this.value].angle;
        draw();
    };
    document.getElementById("input_angle").onchange = function(){
        var selected = document.getElementById("input_selected").value;
        linkages[selected].angle = Number(document.getElementById("input_angle").value);
        update_position();
        draw();
    };
    // init OpenGL settings
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
};
