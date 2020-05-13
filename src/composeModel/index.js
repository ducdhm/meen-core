const mongoose = require('mongoose');
const getDataByPage = require('./getDataByPage');
const composeUrlVirtual = require('./composeUrlVirtual');

module.exports = (modelName, schema, options) => {
    let modelSchema = new mongoose.Schema(schema, { timestamps: true });

    // Virtual
    // --------------------------------
    if (options && options.virtual) {
        for (let [key, value] of Object.entries(options.virtual)) {
            let virtual = modelSchema.virtual(key);

            if (typeof value === 'function') {
                virtual.get(value);
            } else {
                let getter = value.get;
                typeof getter === 'function' && virtual.get(getter);

                let setter = value.set;
                typeof setter === 'function' && virtual.set(setter);
            }
        }

        if (!('url' in options.virtual)) {
            composeUrlVirtual(modelName, modelSchema);
        }
    } else {
        composeUrlVirtual(modelName, modelSchema);
    }

    // Plugins
    // --------------------------------
    if (options && Array.isArray(options.plugins)) {
        options.plugins.map((plugin) => {
            modelSchema.plugin(plugin);
        });
    }

    // Index
    // --------------------------------
    if (options && options.index) {
        modelSchema.index(options.index);
    }

    // Set
    // --------------------------------
    if (options && options.set) {
        for (let [key, value] of Object.entries(options.set)) {
            modelSchema.set(key, value);
        }
    }

    const Model = mongoose.model(modelName, modelSchema);

    // Static
    // --------------------------------
    if (options && options.static) {
        for (let [key, value] of Object.entries(options.static)) {
            Model[key] = value;
        }
    }

    // "getDataByPage" method
    // --------------------------------
    Model.getDataByPage = async (...params) => await getDataByPage(Model, ...params);

    return Model;
};
