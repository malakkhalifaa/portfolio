(function () {
  'use strict';

  var canvas = document.getElementById('webgl-overlay');
  if (!canvas) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl =
    canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }) ||
    canvas.getContext('experimental-webgl', { alpha: false, antialias: false });

  if (!gl) {
    canvas.classList.add('webgl-overlay--unsupported');
    return;
  }

  var vert =
    'attribute vec2 a_pos;' +
    'void main(){ gl_Position=vec4(a_pos,0.0,1.0); }';

  var frag =
    'precision highp float;' +
    'uniform float u_time;' +
    'uniform vec2 u_resolution;' +
    'uniform float u_light;' +
    'void main(){' +
    ' vec2 frag=gl_FragCoord.xy;' +
    ' vec2 uv=frag/u_resolution.xy;' +
    ' vec2 p=uv*2.0-1.0;' +
    ' p.x*=u_resolution.x/u_resolution.y;' +
    ' float t=u_time*0.18;' +
    ' float w=sin(p.x*2.2+t)*cos(p.y*1.9-t*0.55);' +
    ' vec2 o=vec2(sin(t*0.31)*0.35,cos(t*0.27)*0.28);' +
    ' float r=length(p-o);' +
    ' float pulse=sin(r*4.8-t*1.35)*0.5+0.5;' +
    ' float flow=sin(p.x*3.5+p.y*2.1+t*0.9)*0.5+0.5;' +
    ' vec3 darkA=vec3(0.03,0.08,0.10);' +
    ' vec3 darkB=vec3(0.07,0.04,0.11);' +
    ' vec3 teal=vec3(0.15,0.62,0.55);' +
    ' vec3 blue=vec3(0.28,0.48,0.92);' +
    ' vec3 col=mix(darkA,darkB,0.5+0.4*w);' +
    ' col+=teal*(0.12+0.18*pulse)*(0.4+0.6*flow);' +
    ' col+=blue*(0.06+0.12*(1.0-pulse))*w;' +
    ' if(u_light>0.5){' +
    '  vec3 base=vec3(0.96,0.97,0.99);' +
    '  vec3 mist=vec3(0.55,0.72,0.95)*0.25;' +
    '  col=mix(base,mist,0.35+0.25*pulse+0.2*w);' +
    ' }' +
    ' gl_FragColor=vec4(col,1.0);' +
    '}';

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, vert);
  var fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;

  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  var verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

  var locPos = gl.getAttribLocation(program, 'a_pos');
  var locTime = gl.getUniformLocation(program, 'u_time');
  var locRes = gl.getUniformLocation(program, 'u_resolution');
  var locLight = gl.getUniformLocation(program, 'u_light');

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function resize() {
    var narrow = window.matchMedia('(max-width: 768px)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.75);
    var w = Math.floor(window.innerWidth * dpr);
    var h = Math.floor(window.innerHeight * dpr);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
  }

  var start = performance.now();
  var raf = 0;
  var paused = false;

  function draw(timeSec) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(locTime, timeSec);
    gl.uniform2f(locRes, canvas.width, canvas.height);
    gl.uniform1f(locLight, isLight() ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now) {
    if (paused) return;
    var t = reducedMotion ? 0 : (now - start) / 1000;
    draw(t);
    raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    resize();
    draw(reducedMotion ? 0 : (performance.now() - start) / 1000);
    canvas.classList.add('webgl-overlay--ready');
    if (!reducedMotion) raf = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', function () {
    resize();
    if (reducedMotion) draw(0);
  });

  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
    if (!paused && !reducedMotion) raf = requestAnimationFrame(frame);
    else if (paused) cancelAnimationFrame(raf);
  });

  function onReducedMotionChange(e) {
    reducedMotion = e.matches;
    cancelAnimationFrame(raf);
    start = performance.now();
    if (reducedMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(frame);
    }
  }
  var motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionMq.addEventListener) motionMq.addEventListener('change', onReducedMotionChange);
  else if (motionMq.addListener) motionMq.addListener(onReducedMotionChange);

  startLoop();
})();
