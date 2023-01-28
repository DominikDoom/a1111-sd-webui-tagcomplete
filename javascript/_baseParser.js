class BaseTagParser {
    triggerCondition = null;

    constructor (triggerCondition) {
        if (new.target === BaseCompletionParser) {
            throw new TypeError("Cannot construct abstract BaseCompletionParser directly");
        }
        this.triggerCondition = triggerCondition;
    }

    parse() {
        throw new NotImplementedError();
    }
}