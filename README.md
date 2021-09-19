# Fragment minter & runtime

## How to run locally

* Fetch dependencies from IPFS: `sh fetch-modules.sh`
* Make sure you build chainblocks **cbl** (or download from the link under) and run `./cbl src/entry.edn`.
  * Load a fragment: `./cbl  src/entry.edn --gateway "https://goerli.infura.io/v3/__MY_KEY__" --fragment "2mbXMts9sqVqPgdTj9ASoVRHN4GF"`

### cbl windows 64bit build here:
https://cloudflare-ipfs.com/ipfs/QmX9BTNybSHeHf8yVVwMNCrTCtPaeUfMeowUkgxAyyeTP1?filename=cbl-win64.zip

## How?

Edit `src/user/immutable.edn` mainly, that script is hot-reloaded so every time you save it will reload.

Add your own folders in `src/user/MyFolder` and load by calling `./cbl  src/entry.edn --rootFolder MyFolder/`
