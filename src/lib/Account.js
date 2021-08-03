import { key } from '../text/hint.json';

class Account {
    constructor(addr, priv, pub, data) {
        this.address = addr;
        this.privateKey = priv;
        this.resKey = undefined;

        this.publicKeys = data._embedded.keys.keys.map(x => { return { key: x.key, weight: x.weight } });
        this.balances = data._embedded.balance.map(x => { return { currency: x.currency, amount: x.amount } });
        this.accountType = this.publicKeys.length > 1 ? 'multi' : 'single';

        this.publicKey = pub;

        const idx = priv.indexOf(':');
        const hint = priv.substring(idx + 1);
        switch (hint) {
            case `${key.btc.priv}-${process.env.REACT_APP_VERSION}`:
                this.publicKey = pub + ':' + key.btc.pub + '-' + process.env.REACT_APP_VERSION;
                return;
            case `${key.ether.priv}-${process.env.REACT_APP_VERSION}`:
                this.publicKey = pub + ':' + key.ether.pub + '-' + process.env.REACT_APP_VERSION;
                return;
            case `${key.stellar.priv}-${process.env.REACT_APP_VERSION}`:
                this.publicKey = pub + ':' + key.stellar.pub + '-' + process.env.REACT_APP_VERSION;
                return;
        }
    }
}

export default Account;