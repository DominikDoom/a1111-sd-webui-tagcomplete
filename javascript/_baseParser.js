class BaseTagParser {
    triggerCondition = null;

    constructor (triggerCondition) {
        if (new.target === BaseTagParser) {
            throw new TypeError("Cannot construct abstract BaseCompletionParser directly");
        }
        this.triggerCondition = triggerCondition;
    }

    parse() {
        throw new NotImplementedError();
    }
}