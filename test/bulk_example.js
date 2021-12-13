const getNewKeypair = require('mitumc').getNewKeypair;
const fs = require('fs');

function generatePublicKeys(numOfKey) {
    const pub = [];
    var kp, i;

    for (i = 0; i < numOfKey; i++) {
        try {
            kp = getNewKeypair();
            pub.push(kp.getPublicKey());

            // create ether keys
            // kp = getKeypair('ether');
            // pub.push(kp.getPublicKey());

            // create stellar keys
            // kp = getKeypair('stellar');
            // pub.push(kp.getPublicKey());
        }
        catch (e) {
            i = i - 1;
            continue;
        }
    }

    return pub;
}

function toFile(commands, filename) {
    const data = new Uint8Array(Buffer.from(commands));
    fs.writeFileSync(`${filename}.csv`, data, (err) => {
        if (err) throw err;
    });
}

const currency = ["MCC", "PEN"];
const amount = 100;
const threshold = 100;
const weight = 100;

/* create-account script */
const numOfKeys = 1000;
const keysToCreate = generatePublicKeys(numOfKeys);

var commands = "";
keysToCreate.forEach(
    key => commands += `ca, ${key}?threshold=${threshold}&weight=${weight}, ${currency[0]}, ${amount}, ${currency[1]}, ${amount}\n`
)

toFile(commands, "create_account_script");

/* transfers script */
const addressToTransfer = []; // put address you want to send currencies to

commands = "";
addressToTransfer.forEach(
    addr => commands += `tf, ${addr}, ${currency[0]}, ${amount}, ${currency[1]}, ${amount}`
)

toFile(commands, "transfers_script");