const apiRouter = require('express').Router();

const {verify_login, register} = require('./account');
const {getUser, getListData, getfoodType, getDailyData, getDetailDataByGid, getMySheet} = require('./info_getter.js');
const {postUpdateSheet,postCreateFile} = require('./data_updater.js')
const DatabaseError = require('../errors/DatabaseError');
const asyncHandler = require('../errors/asyncHandler');


apiRouter.get('/', (req, res) => {
    res.send('Home Page');
})


apiRouter.post('/login', asyncHandler(verify_login));
apiRouter.post('/register', asyncHandler(register));
apiRouter.post('/postUpdateSheet', asyncHandler(postUpdateSheet));
apiRouter.post('/postCreateFile', asyncHandler(postCreateFile));

apiRouter.get('/getUser', asyncHandler(getUser));
apiRouter.get('/getListData', asyncHandler(getListData));
apiRouter.get('/getfoodType', asyncHandler(getfoodType));
apiRouter.get('/getDailyData', asyncHandler(getDailyData));
apiRouter.get('/getDetailDataByGid', asyncHandler(getDetailDataByGid));
apiRouter.get('/getMySheet', asyncHandler( getMySheet));



apiRouter.use((err, req, res, next) => {
    if (err instanceof DatabaseError) {
        console.error(`${err.name}: ${err.message}`);
        if (err.inner) console.error(`${err.inner.name}: ${err.inner.message}`);
    }
    next(err);
});

apiRouter.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
})

module.exports = apiRouter;