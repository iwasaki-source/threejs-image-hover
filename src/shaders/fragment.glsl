uniform vec2 u_mouse;
uniform float u_progressHover;
uniform vec2 u_res;
uniform float u_time;
uniform sampler2D u_image;
uniform sampler2D u_imagehover;

varying vec2 v_uv;

#include includes/snoise3.glsl;

float circle(in vec2 _st, in float _radius, in float bluriness) {
  vec2 dist = _st;
  return 1.0 - smoothstep(
    _radius - (_radius * bluriness),
    _radius + (_radius * bluriness),
    dot(dist, dist) * 4.0
    );
}

void main() {
  vec2 res = u_res * PR;
  float progress = u_progressHover;
  vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);

  st.y *= u_res.y / u_res.x;

  vec2 mouse = u_mouse * -0.5;

  vec2 circlePos = st + mouse;
  float c = circle(circlePos, 0.05 * progress, 2.0) * 2.5;

  float offx = v_uv.x + sin(v_uv.y + u_time * 0.1);
  float offy = v_uv.y - u_time * 0.1 - cos(u_time * 0.001) * 0.01;

  float n = snoise3(vec3(offx, offy, u_time * 0.1) * 8.0) - 1.0;

  float mask = smoothstep(0.4, 0.5, n + pow(c, 2.0));

  vec4 image = texture2D(u_image, v_uv);
  vec4 hover = texture2D(u_imagehover, v_uv);

  vec4 finalImage = mix(image, hover, mask);

  gl_FragColor = finalImage;
}