# Fragment minter & runtime

## How to run locally

* Fetch dependencies from IPFS: `sh fetch-modules.sh`
* Make sure you build chainblocks **cbl** and run `./cbl src/entry.edn`.
  * Further options passed via edn, e.g.: `./cbl  src/entry.edn "{:gateway \"https://goerli.infura.io/v3/__MY_KEY__\" :fragment \"2mbXMts9sqVqPgdTj9ASoVRHN4GF\"}"`

### cbl windows 64bit build here:
https://ipfs.io/ipfs/QmSQaee7vrA1F6f6FNNthZkymP7qsHLARZNjP6i2RR4LeT?filename=cbl-win64.zip

## How?

Edit `src/user/immutable.edn` mainly, that script is hot-reloaded so every time you save it will reload.

