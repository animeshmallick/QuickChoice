// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QuickChoice API',
            version: '1.0.0',
            description: 'API Documentation for QuickChoice',
        },
        components: {
            securitySchemes: {
                xAuthorization: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-authorization',
                    description: 'Your Bearer token: Bearer <token>'
                }
            }
        },
        security: [
            { xAuthorization: [] }
        ]

    },
    apis: ['src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
