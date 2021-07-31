IPFS_SHADERC_WASI="bafybeif5juuskzbygggzexxwdbo265b777vpx3uxgeu4joiqkdpekdazji"
IPFS_SHADERC_EXE="QmaTmrmDjxWeSCpgPAXWCSaC8wzqhBh46sSZuQ7ReNsYiZ"
IPFS_SHADERS="QmNYTY6SPhEvE6KJ67T2NgPiTBAsjXY3q1vUwakq7kscNT"

mkdir -p src/shaders/lib/gltf
mkdir -p src/shaders/include

curl https://ipfs.io/ipfs/$IPFS_SHADERC_WASI --output public/shaders/shadercRelease.wasm
curl https://ipfs.io/ipfs/$IPFS_SHADERC_EXE --output public/shaders/shadercRelease.exe

curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/bgfx_shader.h --output public/shaders/include/bgfx_shader.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/bgfx_compute.h --output public/shaders/include/bgfx_compute.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/shaderlib.h --output public/shaders/include/shaderlib.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/shader.h --output public/shaders/include/shader.h

curl https://ipfs.io/ipfs/$IPFS_SHADERS/gltf/ps_entry.h --output public/shaders/lib/gltf/ps_entry.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/gltf/vs_entry.h --output public/shaders/lib/gltf/vs_entry.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/gltf/varying.txt --output public/shaders/lib/gltf/varying.txt

curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/implicit_shapes.h --output public/shaders/include/implicit_shapes.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/noise.h --output public/shaders/include/noise.h
curl https://ipfs.io/ipfs/$IPFS_SHADERS/include/ShaderFastMathLib.h --output public/shaders/include/ShaderFastMathLib.h
