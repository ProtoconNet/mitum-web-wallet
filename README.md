# mitum-web-wallet

'mitum-web-wallet' provides web wallet for [mitum-currency](https://github.com/ProtoconNet/mitum-currency).

## Install and Run

Recommended requirements for 'mitum-web-wallet' are,

* node v16.4.0
* npm v7.18.1 (yarn v1.22.*)

and

* mitumc v0.0.5

Then install and run 'mitum-web-wallet'.

```sh
$ git clone https://github.com/ProtoconNet/mitum-web-wallet.git

$ cd mitum-web-wallet

/mitum-web-wallet$ yarn install

/mitum-web-wallet$ yarn start
```

## Build

Before running build for 'mitum-web-wallet', 'mitum-js-util' must be installed and linked.

Refer to 'Install and Run'.

```sh
/mitum-web-wallet$ yarn run build
```

## Create Scripts for Massive Create-Accounts and Transfers

You can generate and broadcast a number of create-accounts/transfers items.

Before that, you must prepare script of create-accounts/transfers commands in csv format.

See the example code [here](test/bulk_example.js).

The detail of script rules is inside wallet - send/sign multiple operations.