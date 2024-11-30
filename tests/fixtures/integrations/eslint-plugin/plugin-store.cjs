/** @type {any} */
let plugin

/**
 * @param {any} p
 * @returns {void}
 */
function setPlugin(p) {
    plugin = p
}
/**
 * @returns {any}
 */
function getPlugin() {
    return plugin
}

module.exports = {
    setPlugin,
    getPlugin
}
