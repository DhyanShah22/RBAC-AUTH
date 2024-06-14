const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const helmet = require('helmet')
const exp = require('constants')
require('dotenv').config()
const logger = require('./Logger/logger')
const userRoutes = require('./Routes/userRoutes')

const { collectMetrics, metricsEndpoint } = require('./Middleware/metrics');
const app = express()

app.use(collectMetrics); 
app.use(express.json())

app.use((req, res, next) => {
    logger.info(req.path, req.method)
    //console.log(req.path, req.method)
    next()
})

app.use(helmet())
app.use(morgan('dev'))

app.get('/metrics', metricsEndpoint);
app.use('/api/user', userRoutes)

mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            logger.info(`Connected to DB and listening to port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        logger.error(error)
    })