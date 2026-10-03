precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform float uScale;
uniform vec2 uOffset;
uniform float uTime;

uniform vec2 uHead;
uniform vec2 uTrail;
uniform float uHover;
uniform float uRadius;
uniform float uEnergy;
uniform float uLensLight;

uniform float uIntro;
uniform float uDissolve;

uniform float uDistortion;
uniform float uSoftness;
uniform float uGrain;
uniform float uMist;
uniform float uSaturation;
uniform float uExposure;
uniform float uHighlightLift;
uniform float uBaseOpacity;
uniform vec2 uFade;
uniform vec3 uPaper;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 gradient(vec2 cell) {
  float angle = hash(cell) * 6.2831853;
  return vec2(cos(angle), sin(angle));
}

float perlin(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(gradient(i), f);
  float b = dot(gradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(gradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(gradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.7 + 0.5;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * perlin(p);
    p = p * 2.02 + 17.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 toImage(vec2 uv) {
  float canvasAspect = uResolution.x / uResolution.y;
  float imageAspect = uImageSize.x / uImageSize.y;
  vec2 fit = canvasAspect > imageAspect
    ? vec2(canvasAspect / imageAspect, 1.0)
    : vec2(1.0, imageAspect / canvasAspect);
  return (uv - 0.5 - uOffset) * fit / uScale + 0.5;
}

// Premultiplied sample with a short feather at the photo's border so it never shows a hard edge.
vec4 photo(vec2 imageUv) {
  vec2 edge = smoothstep(vec2(0.0), vec2(0.06), imageUv) * smoothstep(vec2(0.0), vec2(0.06), 1.0 - imageUv);
  vec4 texel = texture2D(uTexture, vec2(imageUv.x, 1.0 - imageUv.y));
  float alpha = texel.a * edge.x * edge.y;
  return vec4(texel.rgb * alpha, alpha);
}

vec3 straight(vec4 color) {
  return color.rgb / max(color.a, 0.0001);
}

vec3 grade(vec3 color) {
  color *= uExposure;
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, uSaturation);
  return color + uHighlightLift * smoothstep(0.55, 1.0, luma);
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  vec2 p = vec2(uv.x * aspect, uv.y);

  vec2 grainCell = floor(uv * uResolution / 3.0);
  if (hash(grainCell) < uDissolve * 1.1 - 0.05) discard;
  uv.y -= uDissolve * uDissolve * 0.25 * hash(grainCell + 7.0);

  float grain = hash(uv * uResolution + fract(uTime * 7.0) * 61.0) - 0.5;

  // Frosted base: the photo seen through rippled glass, softened by grain-jittered samples and a drifting mist.
  vec2 warp = vec2(fbm(p * 3.0 + uTime * 0.02), fbm(p * 3.0 + 5.2 - uTime * 0.02)) - 0.5;
  vec2 frostUv = uv + warp * uDistortion;
  vec4 frost = photo(toImage(frostUv + grain * 0.006 * uSoftness));
  frost += photo(toImage(frostUv + vec2(grain, -grain) * 0.018 * uSoftness));
  frost *= 0.5;
  float mist = fbm(p * 2.2 + vec2(uTime * 0.015, -uTime * 0.01));
  vec3 baseColor = mix(grade(straight(frost)), uPaper, uMist * (0.6 + 0.8 * mist));
  float baseAlpha = frost.a * uBaseOpacity * (0.82 + 0.3 * mist);

  // Clear lens: a capsule from the lagging trail to the cursor head, narrowing toward the tail.
  vec2 head = vec2(uHead.x * aspect, uHead.y);
  vec2 tail = vec2(uTrail.x * aspect, uTrail.y);
  vec2 along = head - tail;
  float t = clamp(dot(p - tail, along) / max(dot(along, along), 1e-5), 0.0, 1.0);
  float distance = length(p - tail - along * t);
  float radius = uRadius * mix(0.45, 1.0, t);
  float lens = (1.0 - smoothstep(radius * 0.55, radius, distance)) * uHover;

  // Curved glass: pull samples toward the head so the centre of the lens magnifies.
  float fromHead = length(p - head);
  vec2 lensUv = uv - (uv - uHead) * 0.22 * (1.0 - smoothstep(0.0, uRadius * 1.2, fromHead));
  vec4 clear = photo(toImage(lensUv));
  float rim = smoothstep(radius * 0.5, radius * 0.95, distance) * lens;

  // Lit glass: inside the lens the photo is brighter, warmer and richer, as if backlit.
  float light = uLensLight * (0.75 + 0.5 * uEnergy);
  vec3 lit = straight(clear);
  float litLuma = dot(lit, vec3(0.299, 0.587, 0.114));
  lit = mix(vec3(litLuma), lit, 1.0 + 0.45 * light);
  lit *= 1.0 + 0.3 * light;
  lit += vec3(0.16, 0.11, 0.02) * light * smoothstep(0.2, 0.8, litLuma);
  vec3 clearColor = lit * (1.0 - rim * 0.2);

  // A glossy highlight sits toward the lower right of the head, plus a bright crescent on the rim.
  vec2 lightDir = normalize(vec2(0.55, -0.8));
  vec2 toPixel = (p - head) / max(uRadius, 1e-4);
  float gloss = exp(-dot(toPixel - lightDir * 0.45, toPixel - lightDir * 0.45) * 14.0);
  float crescent = rim * smoothstep(0.2, 0.9, dot(normalize(toPixel + 1e-5), lightDir));
  vec3 specular = vec3(1.0) * (gloss * 0.55 + crescent * 0.35) * light * uHover;

  // A soft halo spills past the lens edge and lifts the frost around it.
  float halo = (1.0 - smoothstep(radius, radius * 2.2, distance)) * uHover * light;
  baseColor = mix(baseColor, baseColor * 1.08 + vec3(0.05, 0.035, 0.0), halo * 0.6);

  vec3 color = mix(baseColor, clearColor, lens) + specular;
  float alpha = max(mix(baseAlpha, clear.a, lens), length(specular) * clear.a);
  color += grain * uGrain;

  alpha *= smoothstep(uFade.x, uFade.y, toImage(uv).y);

  // Intro: the flower condenses out of the mist, low-noise areas first.
  float revealNoise = fbm(p * 2.5 + 3.7);
  alpha *= smoothstep(revealNoise - 0.2, revealNoise + 0.05, uIntro * 1.3 - 0.1);

  alpha *= 1.0 - uDissolve * 0.6;
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
