var express = require('express');
var router = express.Router();
// var ctrlMain = require('../controllers/main');
var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });



// var homepageController = function (req, res) {
//   res.render('index' , { title: 'Express'});
// }

/* GET home page/ */
// router.get('/', ctrlMain.index);

/* Locations pages */
router.get('/', ctrlLocations.homelist);
router.get('/location/:locationId', ctrlLocations.locationInfo);
router.get('/location/:locationId/reviews/new', ctrlLocations.addReview);
router.post('/location/:locationId/reviews/new', ctrlLocations.doAddReview);

// module.exports = function(app) {
//     app.route('/')

//     app.route('/location')

//     app.route('/location/review/new')
// }

/* Other pages */
router.get('/about' , ctrlOthers.about);

module.exports = router;