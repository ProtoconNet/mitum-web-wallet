# mitum-web-wallet

'mitum-web-wallet' provides web wallet for [mitum-currency](https://github.com/ProtoconNet/mitum-currency).

## Install and Run

Recommended requirements for 'mitum-web-wallet' are,

* node v16.4.0
* npm v7.18.1 (yarn v1.22.*)

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

/mitum-web-wallet$ npm install

/mitum-web-wallet$ npm link mitumc

/mitum-web-wallet$ npm start
```

You can use yarn instead of npm.

```sh
/mitum-web-wallet$ yarn start
```

## Build

Before running build for 'mitum-web-wallet', 'mitum-js-util' must be installed and linked.

Refer to 'Install and Run'.

```sh
/mitum-web-wallet$ npm run build
```