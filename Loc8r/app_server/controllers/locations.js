// const location = require('mongoose').model('Location');

// exports.create = function(req, res, next) {
//     const location = new location(req.body);
//     location.save();
// };

// exports.read = function(req, res) {
//     res.json(req.location);
// };

// exports.update = function(req, res, next) {
//     location.findByIdAndUpdate(req.location.id, req.body, {
//         'new': true
//     }, (err, location) => {
//         if (err) {
//             return next(err);
//         } else {
//             res.status(200).json(location);
//         }
//     }); 
// };

// exports.delete = function(req, res, next) {
//     req.location.remove(err => {
//         if (err) {
//             return next(err);
//         } else {
//             res.status(200).json(req.location);
//         }
//     })
// };

var request = require('request');
var apiOptions = {
    server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = "https://neardust3.herokuapp.com";
}

// var renderHomepage = function(req, res, responseBody) {
//     var message;
//     // 응답바디가 배열이 아닌경우 메세지를 설정하고 빈 배열로 설정
//     if (!(responseBody instanceof Array)) {
//         message = "API lookup error";
//         responseBody = [];
//     } else {
//         if (!responseBody.length) {
//             message = "No places found nearby";
//         }
//     }

//     res.render('locations-list', {
//         title: '',
//         pageHeader : {
//             title: 'Loc8r',
//             strapline: 'Find places to work with wifi near you!'
//         },
//         sidebar : "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place your're looking for.",
//         locations: responseBody,
//         message : message
//     });
// };

var renderHomepage = function(req, res) {
    
    res.render('locations-list', {
        title: '',
        pageHeader : {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        },
        sidebar : "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place your're looking for."
    });
};

// request (requestOptions, function(err, response, body) {
//     if (err) {
//         console.log(err);
//     } else if (response.statusCode === 200) {
//         console.log(body);
//     } else {
//         console.log(response.statusCode);
//     }
// });
var isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var formatDistance = function() {
    return function (distance) {
        var numDistance, unit;
        if (distance && isNumeric(distance)) {
            if (distance > 1) {
                numDistance = parseFloat(distance).toFixed(1);
                unit = 'km';
            } else {
                numDistance = parseInt (distance * 1000,10);
                unit = 'm';
            }
            return numDistance + unit;
        } else {
            return "?";
        }
    };
};

var _showError = function (req, res, status) {
    var title, content;
    if (status === 400) {
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this apge. Sorry";
    } else {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};

/* GET 'home' page */
module.exports.homelist = function(req, res) {
    // var path = '/api/locations';
    // if (process.env.NODE_ENV === 'production') {
    //     path = "neardust3/api/locations";
    // }
    renderHomepage(req, res);
    // var requestOptions = {
    //     url : apiOptions.server + path,
    //     method : "GET",
    //     json : {},
    //     qs : {
    //         lng : 127.1422541,
    //         lat : 37.3038965,
    //         maxDistance : 9999999
    //     }
    // };
    // request(
    //     requestOptions,
    //     function(err, response, body) {
    //         var i, data;
    //         data = body;
    //         if (response.statusCode === 200 && data.length){
    //             for (i=0; i<data.length; i++) {
    //                 data[i].distance = _formatDistance(data[i].distance);
    //             }
    //         }
    //         renderHomepage(req, res, body);
    //     }
    // );

//     res.render('locations-list', { 
//         title: 'Loc8r - find a place to work with wifi',
//         pageHeader: {
//             title: 'Loc8r',
//             strapline: 'Find places to work with wifi near you!'
//         },
//         locations: [{
//             name: 'Starcups',
//             address: '125 High Street, Reading, RG 1PS',
//             rating: 3,
//             facilities: ['Hot drinks', 'Food', 'Premium wifi'],
//             distance: '100m'
//         },{
//             name: 'Cafe Hero',
//             address: '125 High Street, Reading, RG6 1PS',
//             rating: 4,
//             facilities: ['Hot drinks', 'Food', 'Premium wifi'],
//             distance: '200m'
//         },{
//             name: 'Burger Queen',
//             address: '125 High Street, Reading, RG 1PS',
//             rating: 2,
//             facilities:['Food', 'Premium wifi'],
//             distance: '250m'
//         }]
// });
}; /* locations-list.jade 뷰 렌더링 */

var renderDetailPage = function (req, res, locDetail) {
    res.render('location-info', {
        title: locDetail.name,
        pageHeader: {title: locDetail.name},
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: locDetail
    });
};

var getLocationInfo = function (req, res, callback) {
    var requestOptions, path;
    path = "/api/locations/" + req.params.locationId;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            var data = body;
            if (response.statusCode === 200) {
                data.coords = {
                    lng : body.coords[0],
                    lat : body.coords[1]
                };
                callback(req, res, data);
            } else {
                _showError(req, res, response.statusCode);
            }
        }
    );
};

/* GET 'Location info' page */
module.exports.locationInfo = function(req, res) {
    getLocationInfo(req, res, function(req, res, responseData) {
        renderDetailPage (req, res, responseData);
    });
    // var requestOptions, path;
    // // path = "/api/locations/" + req.params.locationId;
    // path = req.params.locationId;
    // requestOptions = {
    //     // url : apiOptions.sever + path,
    //     url : "http://localhost:3000/api/locations/" + path,
    //     method : "GET",
    //     json : {}
    // };
    // request(
    //     requestOptions,
    //     function(err, response, body) {
    //         var data = body;
    //         if (response.statusCode === 200) {
    //             data.coords = {
    //                 lng : data.coords[0],
    //                 lat : data.coords[1]
    //             };
    //             renderDetailPage(req, res, data);
    //         } else {
    //             _showError(req, res, response.statusCode);
    //         }
            
    //     }
    // );
    // res.render('location-info' , {
    //     title: 'Location info',
    //     pageHeader: {title: 'Starcups'},
    //     sidebar: {
    //         context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
    //         callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
    //     },
    //     location: {
    //         name: 'Starcups',
    //         address: '125 High Street, Reading, RG6 1PS',
    //         rating: 3,
    //         facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //         coords: {lat: 51.455041, lng: -0.9690884},
    //         openingTimes: [{
    //             days: 'Monday - Friday',
    //             opening: '7:00am',
    //             closing: '7:00pm',
    //             closed: false
    //         },{
    //             days:'Saturday',
    //             opening: '8:00am',
    //             closing: '5:00pm',
    //             closed: false
    //         },{
    //             days: 'Sunday',
    //             closed: true
    //         }],
    //         reviews: [{
    //             author: 'Simon Holmes',
    //             rating: 5,
    //             timestamp: '16 July 2013',
    //             reviewText: 'What a greate place. I can\'t say enough good things about it.'
    //         },{
    //             author: 'Charlie Chaplin',
    //             rating: 3,
    //             timestamp: '16 June 2013',
    //             reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
    //         }]
    //     }
    // });
};



module.exports.doAddReview = function(req, res) {
    var requestOptions, path, locationId, postdata;
    locationId = req.params.locationId;
    path = "/api/locations/" + locationId + '/reviews';
    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    requestOptions = {
        url: apiOptions.server + path,
        method: "POST",
        json: postdata
    };
    if (!postdata.author || !postdata.rating || !postdata.reviewText) {
        res.redirect('/location/' + locationId + 'reviews/new?err=val');
    } else {
        request(
            requestOptions,
            function(err, response, body) {
                if (response.statusCode === 201) {
                    res.redirect('/location/' + locationId);
                } else if(response.statusCode === 400 && body.name && body.name === "ValidationError" ){
                    res.redirect('/location/' + locationId + '/reviews/new?err=val');
                } else {
                    console.log(body);
                    _showError(req, res, response.statusCode);
                }
            }
        );
    }
};

var renderReviewForm = function(req, res, locDetail) {
    res.render('location-review-form', {
        title: 'Review ' + locDetail.name + ' on Loc8r',
        pageHeader: {title: 'Review ' + locDetail.name},
        error: req.query.err,
        // url: req.originalUrl
    });
};

/* GET 'Add review' page */
module.exports.addReview = function(req, res) {
    // res.render('location-review-form', {
    //     title: 'Review Starcups on Loc8r',
    //     pageHeader: {title: 'Review Starcups'}
    // });
    getLocationInfo(req, res, function(req, res, responseData) {
        renderReviewForm (req, res, responseData);
    });
    // renderReviewForm(req, res);
};