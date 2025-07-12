TAC.FunctionNotOverriddenError = class FunctionNotOverriddenError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message + " is an abstract base function and must be overwritten.";
      }
}

TAC.BaseTagParser = class BaseTagParser {
    triggerCondition = null;

    constructor (triggerCondition) {
        if (new.target === TAC.BaseTagParser) {
            throw new TypeError("Cannot construct abstract BaseCompletionParser directly");
        }
        this.triggerCondition = triggerCondition;
    }

    parse() {
        throw new TAC.FunctionNotOverriddenError("parse()");
    }
}