# mitum-web-wallet

'mitum-web-wallet' provides web wallet for [mitum-currency](https://github.com/ProtoconNet/mitum-currency).

## Installation

Recommended requirements for 'mitum-web-wallet' are,

* node v16.*
* npm v7.* (yarn v1.22.*)

and

* mitum-js-util

You must install [mitum-js-util](https://github.com/ProtoconNet/mitum-js-util) before running 'mitum-web-wallet'.

```sh
$ git clone https://github.com/ProtoconNet/mitum-js-util.git

$ cd mitum-js-util

/mitum-js-util$ sudo npm install -g
```

Then install and run 'mitum-web-wallet'.

```sh
$ git clone https://github.com/ProtoconNet/mitum-web-wallet.git

$ cd mitum-web-wallet

/mitum-web-wallet$ npm install -D

/mitum-web-wallet$ npm link mitumc

/mitum-web-wallet$ npm start
```

You can use yarn instead of npm.

```sh
/mitum-web-wallet$ yarn start
```
