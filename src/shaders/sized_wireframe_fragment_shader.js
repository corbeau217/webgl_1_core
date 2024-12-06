export const FRAGMENT_SHADER_SRC = `
precision highp float;

// taken from vertex shader
varying highp vec4 v_vertex_colour;

void main() {
  gl_FragColor = v_vertex_colour;
}
`;