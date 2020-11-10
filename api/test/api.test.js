/* eslint-disable prefer-destructuring, no-underscore-dangle */
// const crypto = require('crypto');
const axios = require('axios');

const xApiSecret = process.env.BUMPER_API_SECRET;

const apiPrefix = '/api/v1';
const apiConfig = {
    baseURL: 'http://localhost:3001',
    timeout: 3000,
    maxContentLength: 65536,
    validateStatus: () => true
};
const withApiPrefix = {baseURL: `${apiConfig.baseURL}${apiPrefix}`};
const withApiSecret = () => (xApiSecret ? {headers: {'X-API-Secret': xApiSecret}} : {});
// const randomSuf = () => crypto.randomBytes(3).toString('hex');

const apiV1 = axios.create({...apiConfig, ...withApiPrefix});

describe('basic routing', () => {
    test('ping', async () => {
        expect.assertions(2);

        const getResp = await apiV1.get('/ping');
        expect(getResp.status).toBe(200);
        expect(getResp.data).toBe('pong');
    });

    test('version', async () => {
        expect.assertions(2);

        const getResp = await apiV1.get('/version');
        expect(getResp.status).toBe(200);
        expect(getResp.data.rev).toBeDefined();
    });
});

const cluster = {
    meta: {
        name: 'Test Cluster',
        domain: 'test.bubble.superhub.io',
        description: 'optional'
    },
    kubernetes: {
        api: {
            endpoint: 'https://api.test.bubble.superhub.io/',
            caCert: '-----BEGIN CERTIFICATE...',
            token: '<bearer token>',
            clientCert: '-----BEGIN CERTIFICATE...',
            clientKey: '-----BEGIN RSA PRIVATE KEY...'
        }
    }
};

describe('cluster', () => {
    test('post', async () => {
        expect.assertions(3);

        const postResp = await apiV1.post('/clusters', cluster, withApiSecret());
        expect(postResp.status).toBe(201);
        expect(postResp.data.meta).toBeDefined();
        expect(postResp.data.meta.name).toBe('test-cluster');
    });
});
