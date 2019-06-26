#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const vec3 camera_up = vec3(0.0, 1.0, 0.0);
const vec3 camera_to = vec3(0.0, 0.0, 1.0);
// const vec3 camera_from = vec3(0.0, 0.0, 0.0);
const float distance_to_film = 120.0;
const vec4 empty_color = vec4(0.0, 0.0, 0.0, 1.0);
const int n_spheres = 3;

vec3 norm_vec3(vec3 v) {
	return v / length(v);
}

float hit_sphere(vec3 vec_c, float r, vec3 vec_d, vec3 vec_o) {
	float a = dot(vec_d, vec_d);
	float b = 2.0 * dot(vec_d, vec_o - vec_c);
	float c = dot(vec_o - vec_c, vec_o - vec_c) - r * r;
	float d = b * b - 4.0 * a * c;
	if (d >= 0.0) {
		return - b - sqrt(d)/ (2.0 * a);
	} else {
		return -1.0;
	}
}

void main( void ) {
	vec4 spheres[10];
	spheres[0] = vec4(0.0, 0.0, 50.0, 30.0);
	spheres[1] = vec4(0.0, 0.0, 100.0, 70.0);
	spheres[2] = vec4(0.0, 0.0, 1500.0, 1300.0);
	vec4 colors[10];
	colors[0] = vec4(1.0, 0.0, 0.0, 1.0);
	colors[1] = vec4(0.0, 1.0, 0.0, 1.0);
	colors[2] = vec4(0.0, 0.0, 1.0, 1.0);

	float film_w = resolution.x;
	float film_h = resolution.y;

	vec3 camera_from = vec3(mouse.x * 2.0 - 1.0 , mouse.y * 2.0 - 1.0, 0.0);

	vec3 vec_w = norm_vec3(camera_from - camera_to);
	vec3 vec_u = norm_vec3(cross(camera_up, vec_w));
	vec3 vec_v = cross(vec_w, vec_u);
	vec3 vec_e = camera_from;

	float x = film_w * (gl_FragCoord.x + 0.5 - resolution.x / 2.0) / resolution.x;
	float y = film_h * (gl_FragCoord.y + 0.5 - resolution.y / 2.0) / resolution.y;
	float z = distance_to_film;

	vec3 vec_pixel = x * vec_u + y * vec_v + z * vec_w + vec_e;
	vec3 vec_origin = vec_e;
	vec3 vec_direction = norm_vec3(vec_origin - vec_pixel);

	float min_d = -1.0;
	vec4 dest_color = empty_color;
	for (int i = 0; i < n_spheres; i++) {
		vec4 s = spheres[i];
		float hit = hit_sphere(s.xyz, s[3], vec_direction, vec_origin);
		if (hit >= 0.0) {
			if (hit < min_d || min_d < 0.0) {
				min_d = hit;
				dest_color = colors[i];
			}
		}
	}
	gl_FragColor = dest_color;
}
