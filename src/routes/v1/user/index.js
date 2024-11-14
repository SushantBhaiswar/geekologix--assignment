const express = require('express');
const router = express.Router();
const authRoute = require('./auth.route')
const userRoute = require('./user.route')


const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/',
        route: userRoute,
    },

];


defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
