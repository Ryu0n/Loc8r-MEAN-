angular.module('loc8rApp', []);

var locationListCtrl = function ($scope, loc8rData) {
    loc8rData
        .then(function(data) {
            $scope.data = { locations: loc8rData};
        })
        .catch(function(e) {
            console.log(e);
        });

};

var loc8rData = function($http) {
    // return [{
    //     name: 'Burger Queen',
    //     address: '125 High Street, Reading, RG6 1PS',
    //     rating: 3,
    //     facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //     distance: '0.296456',
    //     _id: '5370a35f2536f6785f8dfb6a'
    // },{
    //     name: 'Costy',
    //     address: '125 High Street, Reading, RG6 1PS',
    //     rating: 5,
    //     facilities: ['Hot drinks', 'Food', 'Alcoholic drinks'],
    //     distance: '0.7865456',
    //     _id: '5370a35f2536f6785f8dfb6b'
    // }]
    return $http.get('/api/locations?lng=-0.79&lat=51.3&maxDistance=20');
}

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

var ratingStars = function () {
    return {
        scope: {
            thisRating : '=rating'
        },
        // template : "{{ thisRating }}"
        templateUrl: '/angular/rating-stars.html'
    };
};

angular
.module('loc8rApp')
.controller('locationListCtrl', locationListCtrl)
.filter('formatDistance', formatDistance)
.directive('ratingStars', ratingStars)
.service('log8rData', loc8rData);