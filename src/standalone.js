window.chainblocks = {
  singleThreadMode: false,
  firstFrameDone: function () {
    var loadingPage = document.getElementById('loading');
    if (loadingPage !== null) {
      loadingPage.style.visibility = 'hidden';
    }

    var loadingPlayerPage = document.getElementById('loading_player_page');
    if (loadingPlayerPage !== null) {
      loadingPlayerPage.style.visibility = 'hidden';
    }

    // // write cache to persistent storage once
    // window.chainblocks.instance.FS.syncfs(false, function (err) {
    //   if (err)
    //     throw err;
    // });
  },
  errorDetected: function () {
    // TODO display error image
    var errorPage = document.getElementById('something-went-wrong-div');
    if (errorPage !== null) {
      errorPage.style.visibility = 'visible';
    }
  }
};

function vrFrame(_time, frame) {
  const module = window.chainblocks.instance;
  const session = frame.session;
  session.chainblocks.frame = frame;
  session.chainblocks.nextFrame = session.requestAnimationFrame(vrFrame);

  module.dynCall_ii(module.CBCore.tick, window.chainblocks.node);
  // -1.0 to avoid calling the internal sleep
  module.dynCall_vdi(module.CBCore.sleep, -1.0, true);
};

function regularFrame() {
  const module = window.chainblocks.instance;
  window.chainblocks.nextFrame = requestAnimationFrame(regularFrame);

  module.dynCall_ii(module.CBCore.tick, window.chainblocks.node);
  // -1.0 to avoid calling the internal sleep
  module.dynCall_vdi(module.CBCore.sleep, -1.0, true);
};

function restartChainblocksRunloop() {
  console.debug("Restarting chainblocks runloop.");

  if (window.chainblocks.WebXRSession) {
    const session = window.chainblocks.WebXRSession;
    if (session.chainblocks.nextFrame)
      session.cancelAnimationFrame(session.chainblocks.nextFrame);
    session.chainblocks.nextFrame = null;
  }

  window.chainblocks.nextFrame = requestAnimationFrame(regularFrame);
}

function stopChainblocksRunloop() {
  if (window.chainblocks.nextFrame) {
    cancelAnimationFrame(window.chainblocks.nextFrame);
    window.chainblocks.nextFrame = null;
  }
}

async function reloadCBL() {
  window.chainblocks.loading = true;

  stopChainblocksRunloop();

  var parameters = {};

  if (window.chainblocks.mainScript === undefined) {
    const body = await fetch("entry.edn");
    window.chainblocks.mainScript = await body.text();
  }

  if (navigator && navigator.xr) {
    try {
      parameters.xrSupported = await navigator.xr.isSessionSupported('immersive-vr');
    } catch (_) {
      parameters.xrSupported = false;
    }
  } else {
    parameters.xrSupported = false;
  }

  window.chainblocks.canvasHolder = document.getElementById("canvas-holder");

  // remove old canvas if any
  if (window.chainblocks.canvas) {
    window.chainblocks.canvas.remove();
  }

  // create canvas for rendering
  window.chainblocks.canvas = document.createElement("canvas");
  window.chainblocks.canvas.id = "canvas";
  window.chainblocks.canvas.style.width = window.chainblocks.canvasHolder.clientWidth + "px";
  window.chainblocks.canvas.style.height = window.chainblocks.canvasHolder.clientHeight + "px";

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const userDefinedWidth = urlParams.get('w')
  const userDefinedHeight = urlParams.get('h')
  const chainId = urlParams.get("ch");
  const entityB58 = urlParams.get("e");
  const entityId = urlParams.get("id");
  const fragmentId = urlParams.get("t");
  const fromFragCache = urlParams.get("_cache_");

  const args = (() => {
    const gateway = (() => {
      if (chainId == 1) {
        return "https://mainnet.infura.io/v3/f1f1f88885f54de7955ce248e1d69046";
      } else if (chainId == 4) {
        return "https://rinkeby.infura.io/v3/f1f1f88885f54de7955ce248e1d69046";
      } else if (chainId == 5) {
        return "https://goerli.infura.io/v3/f1f1f88885f54de7955ce248e1d69046";
      }
    })();
    if (entityB58) {
      return ["/entry.edn", "--entity", entityB58, "--entity-id", entityId, "--gateway", gateway];
    } else if (fragmentId) {
      return ["/entry.edn", "--fragment", fragmentId, "--gateway", gateway]
    } else {
      return ["/entry.edn", "--fromFragCache", fromFragCache]
    }
  })();

  if (userDefinedWidth !== null || userDefinedWidth !== null) {
    window.chainblocks.canvas.style.width = userDefinedWidth + 'px';
    window.chainblocks.canvas.style.height = userDefinedHeight + 'px';
    console.log('resize canvas');
  }

  window.addEventListener('resize', (e) => {
    if (window.chainblocks.canvas) {
      window.chainblocks.canvas.style.width = window.chainblocks.canvasHolder.clientWidth + "px";
      window.chainblocks.canvas.style.height = window.chainblocks.canvasHolder.clientHeight + "px";
    }
  });

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
    wasmBinary: window.chainblocks.binary,
    postRun: async function (module) {
      window.chainblocks.loading = false;
      window.chainblocks.canvasHolder.appendChild(window.chainblocks.canvas);

      // // prompt for fullscreen
      // if (isFullscreen) {
      //   const modal = document.getElementById("fs-modal");
      //   const ok = document.getElementById("fs-modal-ok");
      //   const failed = document.getElementById("fs-modal-no");
      //   var acceptPromise = new Promise(function (resolve, reject) {
      //     failed.onclick = function () {
      //       modal.style.display = "none";
      //       resolve(false);
      //     }
      //     ok.onclick = async function () {
      //       modal.style.display = "none";
      //       try {
      //         await window.chainblocks.canvas.requestFullscreen();
      //         resolve(true);
      //       } catch (e) {
      //         reject(e);
      //       }
      //     }
      //   });

      //   modal.style.display = "block";
      //   await acceptPromise;
      // }

      // run on a clean stack
      setTimeout(function () {
        console.log("Starting main node");
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
      // TODO find a better solution that allows text inputs while editing too
      module.ENV.SDL_EMSCRIPTEN_KEYBOARD_ELEMENT = "#canvas";


      module.FS.writeFile("/entry.edn", window.chainblocks.mainScript);

      module.FS.createPreloadedFile("/", "Entity.json", "Entity.json", true, false);
      module.FS.createPreloadedFile("/", "Fragment.json", "Fragment.json", true, false);
      module.FS.createPreloadedFile("/", "utility.edn", "utility.edn", true, false);
      module.FS.createPreloadedFile("/", "shared.edn", "shared.edn", true, false);
      if (fromFragCache) {
        module.FS.mkdir("/cache");
        module.FS.mkdir("/cache/frag");
        module.FS.createPreloadedFile("/cache/frag", fromFragCache, "cache/frag/" + fromFragCache, true, false);
      }

      // TODO Caching properly, emscripten uses indexdb but we had some issue when enabled

      // // mount persistent storage
      // module.FS.mkdir("/storage");
      // module.FS.mount(module.IDBFS, {}, "/storage");
      // module.FS.mkdir("/cache");
      // module.FS.mount(module.IDBFS, {}, "/cache");
      // module.FS.mkdir("/shaders");
      // module.FS.mkdir("/shaders/cache");
      // module.FS.mount(module.IDBFS, {}, "/shaders/cache");

      // // load from current storage
      // await new Promise((resolve, reject) => {
      //   // true == populate from the DB
      //   module.FS.syncfs(true, function (err) {
      //     if (err !== null) {
      //       reject(err);
      //     } else {
      //       resolve();
      //     }
      //   });
      // });

      // window.chainblocks.previewScreenShot = function () {
      //   const screenshotBytes = module.FS.readFile("/.hasten/screenshot.png");
      //   saveByteArray("screenshot.png", screenshotBytes);
      // }

      // screenshotSetup();
      // videoCaptureSetup();
    },
    print: (function () {
      return function (text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        if (text.includes("[error]")) {
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
    arguments: args
  });
}

async function _start() {
  console.log("_start");

  // use mt if possible
  // cache wasm module
  if (window.chainblocks.binary === undefined) {
    var cblScript = "cbl-st.js";
    if (!window.chainblocks.singleThreadMode && typeof SharedArrayBuffer !== "undefined" && typeof Atomics !== "undefined") {
      cblScript = "cbl-mt.js";
      const response = await fetch("cbl-mt.wasm");
      const buffer = await response.arrayBuffer();
      window.chainblocks.binary = new Uint8Array(buffer);
    } else {
      const response = await fetch("cbl-st.wasm");
      const buffer = await response.arrayBuffer();
      window.chainblocks.binary = new Uint8Array(buffer);
    }
  }

  // load cbl
  const cbl = document.createElement("script");
  cbl.src = cblScript;
  cbl.async = true;
  cbl.onload = async function () {
    // finally start cbl
    await reloadCBL();
  };
  document.body.appendChild(cbl);
}