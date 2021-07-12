import axios from 'axios';

class Account {
    constructor(account, privateKey) {
        this.account = account;
        this.privateKey = privateKey;

        this.reload();
    }

    getAccountInformation = async () => {
        return await axios.get(process.env.REACT_APP_API_ACCOUNT + this.props.account);
    }

    reload() {
        this.getAccountInformation()
            .then(res => {
                this.publicKeys = res.data._embedded.keys.keys.map(x => {return {key: x.key, weight: x.weight}});
                this.balances = res.data._embedded.balance.map(x => {return {currency: x.currency, amount: x.amount}});
                this.accountType = this.publicKeys.length > 1 ? 'multi' : 'single';
            })
            .catch(e => {
                this.publicKeys = [];
                this.balances = [];
                this.accountType = 'unknown';
                alert(`Could not access account\n${this.props.account}`);
            });
    }

    get privateKey() {
        return this.privateKey;
    }

    get account() {
        return this.account;
    }

    get accountType() {
        return this.accountType;
    }

    get publicKeys() {
        return this.publicKeys;
    }
    
    get balance() {
        return this.balances;
    }
}

export default Account;