$('#addReview').submit(function (e) {
    $('.alert.alert-danger').hide();
    if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {
        if ($('.alert.alert-danger').length) {
            $('.alert.alert-danger').show();
        } else {
            $(this).prepend('<div role="alert" class="alert alert-danger">All fields required, please try again</div>');
        }
        return false;
    }
});


// 'use strict';

// (function($) {
//   $('#addReview').on('submit', function(event) {
//     var $alert = $('.alert.alert-danger'),
//       $this = $(this);

//     $alert.hide();
//     if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {
//       event.preventDefault();
//       if ($alert.length) {
//         $alert.show();
//       } else {
//         $this.prepend('<div class="alert alert-danger" role="alert">All fields required, please try again.</div>');
//       }
//     }
//   });
// })(jQuery);