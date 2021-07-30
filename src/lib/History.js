import { TYPE_CREATE_ACCOUNT, TYPE_TRANSFER } from "../text/mode";
import { address } from '../text/hint.json';

const hintedAccount = (account) => {
    return  account + ':' + address + '-' + process.env.REACT_APP_VERSION
};

class History {
    constructor(history, me) {
        this.me = me;
        this.inState = history.in_state;
        this.confirmedAt = history.confirmed_at;
        
        this.operation = history.operation;
        this.type = history.operation._hint;
        this.factHash = history.operation.fact.hash;

        this.setItems();
    }

    setItems(){
        if(!(this.type === TYPE_CREATE_ACCOUNT || this.type === TYPE_TRANSFER)) {
            this.items = undefined;
            return;
        }

        const items = this.operation.fact.items.map(
            x => ({
                receiver: this.type === TYPE_CREATE_ACCOUNT ? hintedAccount(x.keys.hash) : x.receiver,
                amounts: x.amounts.map(
                    y => ({
                        currency: y.currency,
                        amount: y.amount
                    })
                )
            })
        );

        this.sender = this.operation.fact.sender;
        if(this.sender === this.me){
            this.items = items;
        }
        else{
            this.items = [];
            for( let i = 0; i < items.length; i++ ){
                if(items[i].receiver === this.me) {
                    this.items.push(items[i]);
                    break;
                }
            }
        }
    }
}

export default History;