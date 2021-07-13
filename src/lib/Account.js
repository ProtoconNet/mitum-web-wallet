class Account {
    constructor(addr, priv, data) {
        this.address = addr;
        this.privateKey = priv;
        this.resKey = undefined;

        this.parse(data);
    }

    parse(data) {
        this.publicKeys = data._embedded.keys.keys.map(x => {return {key: x.key, weight: x.weight}});
        this.balances = data._embedded.balance.map(x => {return {currency: x.currency, amount: x.amount}});
        this.accountType = this.publicKeys.length > 1 ? 'multi' : 'single';
    }
}

export default Account;