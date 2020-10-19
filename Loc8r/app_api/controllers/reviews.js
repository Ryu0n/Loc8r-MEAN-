var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};
var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var doAddReview = function(req, res, location) {
    if(!location) {
        sendJsonResponse(res, 404, {
            "message": "locationId not found"
        });
    } else {
        location.reviews.push({
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });

        location.save(function(err, location) {
            var thisReview;
            if(err) {
                console.log(err);
                sendJsonResponse(res, 400, err);
            } else {
                updateAverageRating(location._id);
                thisReview = location.reviews[location.reviews.length - 1];
                sendJsonResponse(res, 201, thisReview);
            }
        });
    }
};
var updateAverageRating = function(locationId) {
    Loc
    .findById(locationId)
    .select('rating reviews')
    .exec(
        function(err, location) {
            if(!err) {
                doSetAverageRating(location);
            }
        }
    );
};
var doSetAverageRating = function(location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if (location.reviews && location.reviews.length > 0) {
        reviewCount = location.reviews.length;
        ratingTotal = 0;
        for (i=0; i<reviewCount; i++) {
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Average rating updated to", ratingAverage);
            }
        });
    }
};
module.exports.reviewsCreate = function(req, res) {
    var locationId = req.params.locationId;
    if(locationId) {
        Loc
        .findById(locationId)
        .select('reviews')
        .exec(
            function(err, location) {
                if(err) {
                    sendJsonResponse(res, 400, err);
                } else {
                    doAddReview(req, res, location);
                }
            }
        );
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationId required"
        });
    }
};

module.exports.reviewsReadOne = function(req, res) {
    if (req.params && req.params.locationId && req.params.reviewId) {
        Loc.findById(req.params.locationId).select('name reviews').exec(
            function(err, location) {
                var response, review;
                if (!location) {
                    sendJsonResponse(res, 404, {
                      'message': 'locationId not found'
                    });
                    return;
                  } else if (err) {
                      sendJsonResponse(res, 400, err);
                      return;
                  }
                  if (location.reviews && location.reviews.length > 0) {
                      review = location.reviews.id(req.params.reviewId);
                      if (!review) {
                          sendJsonResponse(res, 404, {
                            "message": "reviewId not found"
                          });
                      } else {
                          response = {
                              location : {
                                  name : location.name,
                                  id : req.params.locationId
                              },
                              review : review
                          };
                          sendJsonResponse(res, 200, response);
                      }
                  } else {
                      sendJsonResponse(res, 404, {
                          "message": "No reviews found"
                      });
                  }
                //   sendJsonResponse(res, 200, location);
            }
        );
    } else {
        sendJsonResponse(res, 404, {
            'message': 'No found, locationId and reviewId are both required'
          });
    }
};

module.exports.reviewsUpdateOne = function(req, res) {
    if(!req.params.locationId || !req.params.reviewId) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationId and reviewId are both required"
        });
        return;
    }
    Loc
    .findById(req.params.locationId)
    .select('reviews')
    .exec(
        function(err, location) {
            var thisReview;
            if(!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationId not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }
            if(location.reviews && location.reviews.length > 0){
                thisReview = location.reviews.id(req.params.reviewId);
                if(!thisReview){
                    sendJsonResponse(res, 404, {
                        "message": "reviewId not found"
                    });
                } else {
                    thisReview.author = req.body.author;
                    thisReview.rating = req.body.rating;
                    thisReview.reviewText = req.body.reviewText;
                    location.save(function(err){
                        if(err){
                            sendJsonResponse(res, 404, err);
                        } else {
                            updateAverageRating(location._id);
                            sendJsonResponse(res, 204, null);
                        }
                    });
                }
            } else {
                sendJsonResponse(res, 404, {
                    "message": "No review to delete"
                });
            }
        }
    );
};

module.exports.reviewsDeleteOne = function(req, res) {
    if(!req.params.locationId || !req.params.reviewId) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationId and reviewId are both required"
        });
        return;
    }
    Loc
    .findById(req.params.locationId)
    .select('reviews')
    .exec(
        function(err, location) {
            var thisReview;
            if(!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationId not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }
            if(location.reviews && location.reviews.length > 0){
                thisReview = location.reviews.id(req.params.reviewId);
                if(!thisReview){
                    sendJsonResponse(res, 404, {
                        "message": "reviewId not found"
                    });
                } else {
                    thisReview.remove();
                    location.save(function(err){
                        if(err){
                            sendJsonResponse(res, 404, err);
                        } else {
                            updateAverageRating(location._id);
                            sendJsonResponse(res, 204, null);
                        }
                    });
                }
            } else {
                sendJsonResponse(res, 404, {
                    "message": "No review to delete"
                });
            }
        }
    );
};