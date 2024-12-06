export const FRAGMENT_SHADER_SRC = `
precision highp float;

// taken from vertex shader
varying highp vec4 v_vertex_colour;
varying highp vec3 v_normal;


vec3 light_source_vec = vec3( -2.0, 5.0, 4.0 );
vec3 normalized_light_direction = normalize(light_source_vec);

float ambient = 0.3;


void main() {
  float light_lambert = max( dot(v_normal, normalized_light_direction), 0.0);

  float light_intensity = min( (ambient+light_lambert), 1.0);

  vec3 material_rgb = vec3(light_intensity*v_vertex_colour.r, light_intensity*v_vertex_colour.g, light_intensity*v_vertex_colour.b);
  
  gl_FragColor = vec4(material_rgb, 1.0);
}
`;