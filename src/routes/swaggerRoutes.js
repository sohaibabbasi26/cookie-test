const express = require('express');
const router = express.Router();
const { swaggerSpec } = require("../configurations/swaggerConfig");
const swaggerUi = require('swagger-ui-express');

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;
