console.clear();

import { gsap } from "gsap";

import { of } from "rxjs";
import { map } from "rxjs/operators";

import "./style.scss";

import { Renderer } from "interactive-shader-format";
import fsISF from "./glitch-flood";



const resize = () => {
  var realToCSSPixels = window.devicePixelRatio;
  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  var width = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
  var height = Math.floor(gl.canvas.clientHeight * realToCSSPixels);
  if (gl.canvas.width !== width || gl.canvas.height !== height) {
    gl.canvas.width = width;
    gl.canvas.height = height;
    renderer.draw(canvas);
    console.log('resize')
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  now = window.performance.now();
  delta = now - then;
  if (delta > fpsMs) {
    then = now - (delta % fpsMs);
    render({
      inputImage: video,
      time: time
    })
    resize();
    time += 0.01;
  }
};

const render = ( { inputImage, time} ) => {
    renderer.setValue("inputImage", inputImage);
    renderer.setValue("TIME", time);
    renderer.draw(canvas);
};

// webcam

let aspectRatio = 1.333;
const constraints = {
  audio: false,
  video: true /*  {
    width: {
      min: 640,
      max: 1920
    },
    height: {
      min: 480,
      max: 1080
    },
    frameRate: {
      ideal: 50,
      max: 60
    }
  } */
};
async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    success(stream);
    e.target.disabled = true;
  } catch (e) {
    error(e);
  }
}

const error = e => {
  console.error(e);
};

const success = stream => {
  const video = document.querySelector("video");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "true");
  video.setAttribute("playsinline", "");
  const videoTracks = stream.getVideoTracks();
  const videoSettings = videoTracks[0].getSettings();
  const aspectRatio = videoSettings.width / videoSettings.height;

 /*  document.querySelector("#status").innerHTML =
    videoSettings.width + " " + videoSettings.height + " " + aspectRatio; */

  console.log(
    "Got stream with constraints:",
    videoTracks[0].label,
    videoTracks[0].getSettings(),
    aspectRatio
  );
  canvas.style.width =
    aspectRatio > 1
      ? aspectRatio * 100 + "vh"
      : aspectRatio * window.innerHeight + "px";
  window.stream = stream; // make variable available to browser console
  if (video.mozSrcObject !== undefined) {
    // hack for Firefox < 19
    video.mozSrcObject = stream;
  } else {
    if (typeof video.srcObject === "object") {
      video.srcObject = stream;
    } else {
      window.URL =
        window.URL || window.webkitURL || window.mozURL || window.msURL;
      video.src = window.URL && window.URL.createObjectURL(stream);
    }
  }
};

// start
document.querySelector("#cover").addEventListener("click", e => {
  gsap.to("#cover", 0.35, {
    autoAlpha: 0,
    onComplete: () => {
      init(e);
    }
  });
});

let then = window.performance.now();
let now = 0;
let delta = 0;
let time = 0;
let fps = 60;
const fpsMs = fps / 1000;

const canvas: HTMLCanvasElement = document.querySelector("#canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl",  {
  antialias: true,
  powerPreference: "high-performance"
});
const renderer = new Renderer(gl);
renderer.loadSource(fsISF);

then = window.performance.now();
animate();

// rx
/* const source = of("World").pipe(map(x => `Hello ${x}!`));
source.subscribe(x => console.log(x)); */
