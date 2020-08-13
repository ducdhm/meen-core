module.exports = (Model, originItemPerPage) => {
    return {
        get: async (query, page, itemPerPage, improveQueryBuild) => {
            page = isNaN(page) ? 1 : page;

            if (!itemPerPage) {
                itemPerPage = originItemPerPage;
            }

            if (typeof itemPerPage === 'function') {
                improveQueryBuild = itemPerPage;
                itemPerPage = originItemPerPage;
            }

            let queryBuilder = Model.find(query);
            if (typeof improveQueryBuild === 'function') {
                queryBuilder = improveQueryBuild(queryBuilder);
            }

            const totalPage = await Model.countDocuments(query).then(total => Math.ceil(total / itemPerPage));
            const data = await queryBuilder.skip((itemPerPage * page) - itemPerPage).limit(itemPerPage);

            return {
                data,
                totalPage,
                page,
            }
        },
    };
};