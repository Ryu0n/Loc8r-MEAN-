var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};
var meterConversion = (function() {
    var mToKm = function(distance) {
        return parseFloat(distance / 1000);
    };
    var kmToM = function(distance) {
        return parseFloat(distance * 1000);
    };
    return {
        mToKm : mToKm,
        kmToM : kmToM
    };
})();


module.exports.locationsCreate = function (req, res) {
    sendJsonResponse(res, 200, {"status" : "success"});
};

module.exports.locationsReadOne = function(req, res) {
    // Loc.findById(req.params.locationId).exec(
    //     function(err, location) {
    //         sendJsonResponse(res, 200, location);
    //     }
    // );
    if (req.params && req.params.locationId) {
        Loc.findById(req.params.locationId).exec(
            function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {
                      'message': 'locationId not found'
                    });
                    return;
                  } else if (err) {
                      sendJsonResponse(res, 400, err);
                      return;
                  }
                  sendJsonResponse(res, 200, location);
            }
        );
    } else {
        sendJsonResponse(res, 404, {
            'message': 'No locationId in request'
          });
    }
};

 module.exports.locationsCreate = function(req, res) {
     Loc.create({
         name: req.body.name,
         address: req.body.address,
         facilities: req.body.facilities.split(","),
         coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
         openingTimes: [{
             days:req.body.days1,
             opening: req.body.opening1,
             closing: req.body.closing1,
             closed:req.body.closed1,
         }, {
             days: req.body.days2,
             opening: req.body.opening2,
             closing: req.body.closing2,
             closed: req.body.closed2,
         }]
        }, function(err, location) {
            if (err) {
                sendJsonResponse(res, 400, err);
            } else {
                sendJsonResponse(res, 201, location);
            }
        });
     };

module.exports.locationsListByDistance = function (req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance);
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };

    // var geoOptions = {
    //     spherical: true,
    //     maxDistance: meterConversion.kmToM(maxDistance),
    //     num: 10
    // };
    

    // if ((!lng || lat !== 0) || (!lat && lat !== 0)) {
    //     sendJsonResponse(res, 404, {
    //         "message": "lng and at query parameters are required"
    //     });
    //     return;
    // }
    if ((!lng || !lat)) {
        sendJsonResponse(res, 404, {
            "message": "lng and at query parameters are required"
        });
        return;
    }

    // geoNear에는 findById 메소드와 달리 exec 메소드가 없다. 
    // 대신 geoNear는 즉시 실행되고, 완료되면 실행될 코드가 콜백을 통해 전송된다.
    // Loc.geoNear(point, geoOptions, function(err, results) {
    //     var locations = [];
    //     if (err) {
    //         sendJsonResponse(res, 404, err);
    //     } else {
    //         results.forEach(function(doc) {
    //             locations.push({
    //                 distance: meterConversion.mToKm(doc.dist.calculated),
    //                 name: doc.obj.name,
    //                 address: doc.obj.address,
    //                 rating: doc.obj.rating,
    //                 facilities: doc.obj.facilities,
    //                 _id: doc.obj._id
    //             });
    //         });
    //         sendJsonResponse(res, 200, locations);
    //     }
    // });



    Loc.aggregate(
        [{
            $geoNear: {
                near: point,
                distanceField: 'dist.calculated',
                maxDistance: meterConversion.kmToM(8917),
                spherical: true,
                num: 10
            }
        }], 
        function(err, results) {
            var locations = [];
            if (err) {
                sendJsonResponse(res, 404, err);
            } else {
                results.forEach(function(doc) {
                    locations.push({
                        distance: meterConversion.mToKm(doc.dist.calculated),
                        name: doc.name,
                        address: doc.address,
                        rating: doc.rating,
                        facilities: doc.facilities,
                        _id: doc._id
                    });
                });
                sendJsonResponse(res, 200, locations);
            }
        });
};


module.exports.locationsUpdateOne = function(req, res) {
    if(!req.parms.locatoinId) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locatoinId is required"
        });
        return;
    }
    Loc
    .findById(req.params.locationId)
    .select('-reviews -rating')
    .exec(
        function(err, locatoin) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationId not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(",");
            location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
            location.openingTimes = [{
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1,
            }, {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2
            }];
            location.save(function(err, location) {
                if(err){
                    sendJsonResponse(res, 404, err);
                } else {
                    updateAverageRating(location._id);
                    sendJsonResponse(res, 200, location);
                }
            });
        }
    );
};

module.exports.locationsDeleteOne = function(req, res) {
    var locationId = req.params.locationId;
    if(locationId) {
        Loc
        .findByIdAndRemove(locationId)
        .exec(
            function(err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 204, null);
            }
        );
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationId"
        });
    }
};