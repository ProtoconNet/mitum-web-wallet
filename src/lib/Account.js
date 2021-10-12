class Account {
    constructor(addr=null, priv=null, pub=null, data=null) {
        if(!addr || !priv || !pub || !data) {
            throw new Error('Wrong parameter with Account constructor');
        }


        this.address = addr;
        this.privateKey = priv;
        this.resKey = undefined;

        this.publicKeys = data._embedded.keys.keys.map(x => { return { key: x.key, weight: x.weight } });
        this.balances = data._embedded.balance.map(x => { return { currency: x.currency, amount: x.amount } });
        this.accountType = this.publicKeys.length > 1 ? 'multi' : 'single';

        this.balances.sort((x, y) => x.currency.localeCompare(y.currency));
        this.publicKeys.sort((x, y) => x.key.localeCompare(y.key));

        this.publicKey = pub;
    }
}

export default Account;