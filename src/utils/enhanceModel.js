const ObjectId = require('mongoose').Types.ObjectId;
const { getLogger } = require('meen-utils');
const logger = getLogger('utils/enhanceModel');

module.exports = (Model, itemPerPage) => {
    const makeQueryBuilder = (options = {}, findOne) => {
        logger.debug('makeQueryBuilder options=%o', options);

        let {
            query,
            populate,
            sort,
            page,
            select,
        } = options;
        let queryBuilder = Model[findOne ? 'findOne' : 'find'](query);

        populate && queryBuilder.populate(populate);
        sort && queryBuilder.sort(sort);
        select && queryBuilder.select(select);
        page && queryBuilder.skip((itemPerPage * page) - itemPerPage).limit(itemPerPage);

        return queryBuilder;
    };

    const saveRecord = (record, payload, populateFn) => {
        logger.debug('saveRecord:\nrecord=%o\npayload=%o\npopulateFn=%o', record, payload, populateFn);

        if (populateFn) {
            record = populateFn(record, payload);
        } else {
            for (let key in payload) {
                if (payload.hasOwnProperty(key)) {
                    record[key] = payload[key];
                }
            }
        }

        return record.save();
    };

    return {
        constructor: Model,
        create: (payload) => new Model(payload),
        count: (query) => Model.countDocuments(query).exec(),
        totalPage: (query) => Model.countDocuments(query).exec().then(total => Math.ceil(total / itemPerPage)),
        find: (options) => makeQueryBuilder(options).exec(),
        findById: (id) => Model.findById(id).exec(),
        findOne: (options) => makeQueryBuilder(options, true).exec(),
        delete: (record) => record.delete(),
        deleteById: (id) => Model.deleteOne({ _id: id }),
        save: (record, payload, populateFn) => saveRecord(record, payload, populateFn),
        isValidId: (id) => ObjectId.isValid(id),
    }
};
