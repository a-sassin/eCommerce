const hostname = '{HOSTNAME}'

const environment = {
    production: true,
    baseUrl: hostname,
    redirectUrl: `${hostname}/app/dashboard`,
    loginUrl: `${hostname}/login`,
    workflow: 'distribution',
};
export default environment;
