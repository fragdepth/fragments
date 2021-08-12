window.chainblocks = {};
Parameters = {};

function restartChainblocksRunloop() {
  // TODO maybe use window.requestAnimationFrame ?

  console.debug("Restarting chainblocks runloop.");

  if (window.ChainblocksWebXRSession) {
    const session = window.ChainblocksWebXRSession;
    session.chainblocks.shouldContinue = false;
    session.cancelAnimationFrame(session.chainblocks.nextFrame);
  }

  const module = window.chainblocks.instance;
  if (module.runloop) {
    clearInterval(module.runloop);
  }
  module.runloop = setInterval(function () {
    module.dynCall_ii(module.CBCore.tick, window.chainblocks.node);
    // -1.0 to avoid calling the internal sleep
    module.dynCall_vdi(module.CBCore.sleep, -1.0, true);
  }, 16);
}

async function _start() {
  console.log("_start");
  if (window.chainblocks.mainScript === undefined) {
    const body = await fetch("entry.edn");
    window.chainblocks.mainScript = await body.text();
  }

  const codeReq = await fetch("sample-gui1.edn");
  const textCode = await codeReq.text();

  if (navigator && navigator.xr) {
    Parameters.xrSupported = await navigator.xr.isSessionSupported('immersive-vr');
  } else {
    Parameters.xrSupported = false;
  }

  window.chainblocks.canvasHolder = document.getElementById("canvas-holder");

  // remove old canvas if any
  if (window.chainblocks.canvas) {
    window.chainblocks.canvas.remove();
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/OffscreenCanvas
  // let offscreen = new OffscreenCanvas(256, 256);
  // let gl = offscreen.getContext('webgl2');

  // create canvas for rendering
  window.chainblocks.canvas = document.createElement("canvas");
  window.chainblocks.canvas.id = "canvas";
  window.chainblocks.canvas.style = {};
  window.chainblocks.canvasHolder.appendChild(window.chainblocks.canvas);
  // THIS IS FAILING
  let gl = window.chainblocks.canvas.getContext('webgl2'); // this is our already created bgfx context
  window.chainblocks.glcontext = gl;

  var templateCode = "";
  const width = window.chainblocks.canvas.scrollWidth;
  const height = window.chainblocks.canvas.scrollHeight;
  // we need to re-set those here
  Parameters.windowWidth = width;
  Parameters.windowHeight = height;
  Parameters.windowFullscreen = false;
  const eparameters = `{:windowTitle "Hasten" :windowWidth ${Parameters.windowWidth} :windowHeight ${Parameters.windowHeight} :xrSupported ${Parameters.xrSupported} :isSVG true}`;
  templateCode += "(def _parameters " + eparameters + ")\n";
  templateCode += "(def _environment \"\")\n";
  templateCode += window.chainblocks.mainScript;

  // remove cbl if exists
  if (window.chainblocks.instance) {
    const PThread = window.chainblocks.instance.PThread;
    if (PThread) {
      // temrinate all threads that might be stuck from previous instance
      // otherwise they will keep leaking
      PThread.terminateAllThreads();
      window.chainblocks.instance = undefined;
    }
  }

  // setup cbl module
  window.chainblocks.instance = await window.cbl({
    wasmBinary: window.cbl_binary,
    postRun: function (module) {
      // run on a clean stack
      setTimeout(function () {
        // this should nicely coincide with the first (run-empty-forever)'s sleep
        let node = module.dynCall_i(module.CBCore.createNode);
        window.chainblocks.node = node;
        const nameStr = module._malloc(5);
        module.stringToUTF8("Main", nameStr, 5);
        const mainChain = module.dynCall_ii(module.CBCore.getGlobalChain, nameStr);
        module._free(nameStr);
        module.dynCall_vii(module.CBCore.schedule, node, mainChain);
        restartChainblocksRunloop();
      }, 0);
    },
    preRun: async function (module) {
      module.ENV.SDL_EMSCRIPTEN_KEYBOARD_ELEMENT = "#canvas";
      module.FS.mkdir("/.hasten/");
      module.FS.writeFile("/.hasten/main.edn", textCode);
      // if (base64Code != null) {
      //   module.FS.writeFile("/.hasten/base64-script", base64Code);
      // }
      // if (binaryCode != null) {
      //   var bytes = new Uint8Array(binaryCode.code);
      //   module.FS.writeFile("/.hasten/binary-script", bytes);
      //   if (binaryCode.environment) {
      //     bytes = new Uint8Array(binaryCode.environment);
      //     module.FS.writeFile("/.hasten/binary-environment", bytes);
      //   }
      // }

      // preload files
      module.FS.mkdir("/preload");
      module.FS.writeFile("/preload/entry.edn", templateCode);
      // shaders library
      module.FS.mkdir("/preload/shaders/");
      module.FS.mkdir("/preload/shaders/lib");
      module.FS.mkdir("/preload/shaders/lib/gltf");
      // these are needed in this module as well, as we compose the shader
      module.FS.createPreloadedFile("/preload/shaders/lib/gltf/", "ps_entry.h", "shaders/lib/gltf/ps_entry.h", true, false);
      module.FS.createPreloadedFile("/preload/shaders/lib/gltf/", "vs_entry.h", "shaders/lib/gltf/vs_entry.h", true, false);
      module.FS.createPreloadedFile("/preload/shaders/lib/gltf/", "varying.txt", "shaders/lib/gltf/varying.txt", true, false);
      module.FS.mkdir("/preload/shaders/cache");
      module.FS.mkdir("/preload/shaders/tmp");
      // mount persistent storage - NOT AVAIL IN SVG
      module.FS.mkdir("/storage");
    },
    print: (function () {
      return function (text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        if (text.includes("ERROR")) {
          console.error(text);
        } else {
          console.info(text);
        }
      };
    })(),
    printErr: function (text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      console.error(text);
    },
    canvas: (function () {
      // As a default initial behavior, pop up an alert when webgl context is lost. To make your
      // application robust, you may want to override this behavior before shipping!
      // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
      window.chainblocks.canvas.addEventListener("webglcontextlost", function (e) {
        alert('WebGL context lost. You will need to reload the page.');
        e.preventDefault();
      }, false);

      return window.chainblocks.canvas;
    })(),
    arguments: ["/preload/entry.edn"]
  });
}