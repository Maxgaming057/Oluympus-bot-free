const { Collection } = require("discord.js");

const variables = new Collection();

async function setVariable(data) {
    if (!data || typeof data !== 'object') return;
    
    const key = Object.keys(data)[0];
    const value = data[key];
    
    variables.set(key, value);
}

async function getVariable(variable) {
    if (!variable) return;
    return variables.get(variable);
}

async function deleteVariable(variable) {
    if (!variable) return;
    variables.delete(variable);
}

module.exports = {
    setVariable,
    getVariable,
    deleteVariable
};
