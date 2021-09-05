IPFS_SHADERC_WASI="bafybeif5juuskzbygggzexxwdbo265b777vpx3uxgeu4joiqkdpekdazji"
IPFS_SHADERC_EXE="QmaTmrmDjxWeSCpgPAXWCSaC8wzqhBh46sSZuQ7ReNsYiZ"
IPFS_SHADERC_EM="QmdRFgz7PvD5aPakpcUkUeGLY8sjXA3bE732Pif9Zb1RW5"
IPFS_SHADERS="QmTJQYQuGnLx1iESXrCUjJnFKrdWn4TcFRr6dgsnYxUxeH"
IPFS_CBL_MT="QmcZDqh7owbxofNxZcqGJj4J3Ksw2VDe3oDhP2TetKpDWw"
IPFS_CBL_ST="QmReVCBaW1uykYskCAt5i6PVFjXiW9XU3j9e8hJjZpeArZ"

mkdir -p src/shaders/lib/gltf
mkdir -p src/shaders/include

curl https://ipfs.io/ipfs/$IPFS_SHADERC_WASI --output src/shaders/shadercRelease.wasm
curl https://ipfs.io/ipfs/$IPFS_SHADERC_EXE --output src/shaders/shadercRelease.exe

curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/bgfx_shader.h --output src/shaders/include/bgfx_shader.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/bgfx_compute.h --output src/shaders/include/bgfx_compute.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/shaderlib.h --output src/shaders/include/shaderlib.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/shader.h --output src/shaders/include/shader.h

curl https://ipfs.io/ipfs/$IPFS_SHADERS/gltf/ps_entry.h --output src/shaders/lib/gltf/ps_entry.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/gltf/vs_entry.h --output src/shaders/lib/gltf/vs_entry.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/gltf/varying.txt --output src/shaders/lib/gltf/varying.txt

curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/implicit_shapes.h --output src/shaders/include/implicit_shapes.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/noise.h --output src/shaders/include/noise.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/ShaderFastMathLib.h --output src/shaders/include/ShaderFastMathLib.h

curl https://ipfs.io/ipfs/$IPFS_CBL_MT/cbl-mt.wasm --output src/cbl-mt.wasm
curl https://ipfs.io/ipfs/$IPFS_CBL_MT/cbl-mt.js --output src/cbl-mt.js
curl https://ipfs.io/ipfs/$IPFS_CBL_MT/cbl-mt.worker.js --output src/cbl-mt.worker.js

curl https://ipfs.io/ipfs/$IPFS_CBL_ST/cbl-st.wasm --output src/cbl-st.wasm
curl https://ipfs.io/ipfs/$IPFS_CBL_ST/cbl-st.js --output src/cbl-st.js

curl https://ipfs.io/ipfs/$IPFS_SHADERC_EM/shaderc.wasm --output src/shaders/shaderc.wasm
curl https://ipfs.io/ipfs/$IPFS_SHADERC_EM/shaderc.js --output src/shaders/shaderc.js
