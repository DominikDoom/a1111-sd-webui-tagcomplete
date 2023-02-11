class FunctionNotOverriddenError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message + " is an abstract base function and must be overwritten.";
      }
}

class BaseTagParser {
    triggerCondition = null;

    constructor (triggerCondition) {
        if (new.target === BaseTagParser) {
            throw new TypeError("Cannot construct abstract BaseCompletionParser directly");
        }
        this.triggerCondition = triggerCondition;
    }

    parse() {
        throw new FunctionNotOverriddenError("parse()");
    }
}