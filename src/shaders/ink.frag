precision highp float;

uniform vec2 uResolution;
uniform float uProgress;
uniform float uSeed;
uniform vec2 uOrigin;
uniform vec3 uPaper;
uniform vec3 uTide;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 origin = vec2(uOrigin.x * aspect, uOrigin.y);

  // The wash spreads radially from the origin; distance is normalised to the farthest corner.
  float reach = max(length(vec2(aspect, 1.0) - origin), length(origin));
  float field = length(p - origin) / reach * 0.75 + fbm(p * 2.5 + uSeed) * 0.45;

  // Remapped so 0 leaves every pixel uncovered and 1 covers the noisiest corner.
  float front = mix(-0.1, 1.35, uProgress);
  float depth = front - field;

  float cover = smoothstep(0.0, 0.02, depth);
  float tide = smoothstep(0.0, 0.015, depth) * (1.0 - smoothstep(0.015, 0.09, depth));
  float grain = fbm(p * 18.0 + uSeed * 3.0) - 0.5;

  vec3 color = mix(uPaper, uTide, clamp(tide * 0.55 + grain * 0.04, 0.0, 1.0));
  gl_FragColor = vec4(color, cover);
}
