const {kebabCase} = require('lodash');

function validate() {
}

module.exports = {
    async create(ctx) {
        const {
            request: {body: cluster},
            k8sApi,
            logger
        } = ctx;

        validate(cluster);

        const korral = cluster;
        korral.meta.name = kebabCase(cluster.meta.name);

        ctx.status = 201;
        ctx.body = korral;
    },

    async list(ctx) {
        const {
            query: {name},
            k8sApi,
            logger
        } = ctx;

        const korrals = [{}];

        ctx.status = 200;
        ctx.body = korrals;
    },

    async get(ctx) {
        const {
            params: {id},
            k8sApi,
            logger
        } = ctx;

        const korral = {};

        ctx.status = 200;
        ctx.body = korral;
    },

    async patch(ctx) {
        const {
            params: {id},
            request: {body: cluster},
            k8sApi,
            logger
        } = ctx;

        const korral = {};

        ctx.status = 200;
        ctx.body = korral;
    },

    async metrics(ctx) {
        const {
            params: {id},
            query: {options},
            k8sApi,
            logger
        } = ctx;

        const series = [{}];

        ctx.status = 200;
        ctx.body = series;
    },

    async delete(ctx) {
        const {
            params: {id},
            k8sApi,
            logger
        } = ctx;

        ctx.status = 204;
    }
};
