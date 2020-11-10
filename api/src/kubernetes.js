const fs = require('fs');
const https = require('https');
const path = require('path');
const axios = require('axios');
const yaml = require('js-yaml');
const {isString} = require('lodash');

function remoteKubernetes() {
    const {
        REMOTE_K8S_ENDPOINT: endpoint,
        REMOTE_K8S_CA_CERT: ca,
        REMOTE_K8S_TOKEN: token
    } = process.env;
    if (endpoint && ca && token) return {endpoint, ca, token};
    return undefined;
}

function kubernetes() {
    const {
        KUBERNETES_SERVICE_HOST: host,
        KUBERNETES_SERVICE_PORT: port
    } = process.env;
    if (host && port) {
        const endpoint = `${host}:${port}`;
        const root = process.env.TELEPRESENCE_ROOT || '';
        const serviceAccountDir = `${root}/var/run/secrets/kubernetes.io/serviceaccount`;
        const ca = fs.readFileSync(`${serviceAccountDir}/ca.crt`, 'utf8');
        const token = fs.readFileSync(`${serviceAccountDir}/token`, 'utf8');
        return {endpoint, ca, token};
    }
    return undefined;
}

function clusterConfig() {
    const {endpoint, ca, token} = remoteKubernetes() || kubernetes() || {};
    if (endpoint && ca && token) {
        try {
            const httpsAgent = new https.Agent({ca, keepAlive: true});
            return {
                baseURL: `https://${endpoint}`,
                httpsAgent,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
}

function kubeConfigPath() {
    if (process.env.KUBECONFIG) return process.env.KUBECONFIG;
    const home = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
    return path.join(home, '.kube', 'config');
}

function loadKubeConfig(optCfgPath) {
    const cfgPath = optCfgPath || kubeConfigPath();
    if (!fs.existsSync(cfgPath)) return undefined;
    return yaml.safeLoad(fs.readFileSync(cfgPath));
}

function localConfig(opts) {
    const {cfgPath = kubeConfigPath(), currentContext} = opts || {};

    const kubeConfig = isString(cfgPath)
        ? loadKubeConfig(cfgPath)
        : cfgPath;

    if (!kubeConfig) return undefined;

    const current = currentContext || kubeConfig['current-context'];
    const {context} = kubeConfig.contexts.find(item => item.name === current);
    const {cluster} = kubeConfig.clusters.find(item => item.name === context.cluster);
    const userConfig = kubeConfig.users.find(user => user.name === context.user);
    const user = userConfig ? userConfig.user : null;

    if (!cluster || !cluster.server) return undefined;

    const cfgDir = path.dirname((isString(cfgPath) ? cfgPath : null) || kubeConfigPath());
    const loadFile = (name) => {
        if (!name) return undefined;
        const canonical = path.normalize(name);
        const absPath = path.isAbsolute(canonical) ? canonical : path.join(cfgDir, canonical);
        return fs.readFileSync(absPath);
    };

    let ca;
    let key;
    let cert;
    // let insecure = false;
    if (cluster) {
        if (cluster['certificate-authority']) {
            ca = loadFile(cluster['certificate-authority']);
        } else if (cluster['certificate-authority-data']) {
            ca = Buffer.from(cluster['certificate-authority-data'], 'base64').toString();
        }
        // if (cluster['insecure-skip-tls-verify']) {
        //     insecure = cluster['insecure-skip-tls-verify'];
        // }
    }
    if (user) {
        if (user['client-key']) {
            key = loadFile(path.normalize(user['client-key']));
        } else if (user['client-key-data']) {
            key = Buffer.from(user['client-key-data'], 'base64').toString();
        }
        if (user['client-certificate']) {
            cert = loadFile(user['client-certificate']);
        } else if (user['client-certificate-data']) {
            cert = Buffer.from(user['client-certificate-data'], 'base64').toString();
        }
    }
    const httpsAgent = new https.Agent({ca, key, cert, keepAlive: true});
    const axiosConfig = {
        baseURL: cluster.server,
        httpsAgent
    };
    if (user) {
        if (user.token) {
            axiosConfig.headers = {
                Authorization: `Bearer ${user.token}`
            };
        }
        if (user.username && user.password) {
            axiosConfig.auth = {
                username: user.username,
                password: user.password
            };
        }
    }
    return axiosConfig;
}

function config(cfgPath) {
    if (cfgPath) return localConfig({cfgPath});
    const cfg = clusterConfig() || localConfig();
    if (cfg) return cfg;
    throw new ReferenceError('Unable to find Kubernetes connection parameters');
}

function apiClient(kubeconfig) {
    const axiosConfig = {
        ...config(kubeconfig),
        timeout: 10000,
        maxContentLength: 10 * 1024 * 1024
    };
    return axios.create(axiosConfig);
}

const api = apiClient();

module.exports = {api};
