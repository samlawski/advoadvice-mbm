$( 'form#kreditwiderrufen' ).submit(function ( e ) {
    disableSubmit();
    hideApiError();
    e.preventDefault();

    var form = document.querySelector("#kreditwiderrufen");
    var formdata = new FormData(form);
    var url = 'http://localhost:3000/api/contacts';
    // var url = 'http://staging-auto.kanzlei-fuer-widerruf.de/api/contacts';
    var documents = document.querySelector("#documents");
    var files = documents.files
    for (var i = 0; i < files.length; i++) {
        formdata.append('contact[documents][]', files[i], files[i]['name']);
    }

    fetch(url, {
        method: "POST",
        // headers: { 'Content-Type':'multipart/form-data' },
        body: formdata,
    }).then(function(response){
        return response.json().then(json => {
          return {
            body: json,
            status: response.status
          }
        })
    })
    .then(function(data) {
        if (data['status'] == 200) {
          showSuccess();
        }
        else if (data['status'] == 422) {
          highlightErrors(data['body']);
        } else {
          throw "Unexpected API answer"
        }
    })
    .catch(function(error) {
        showApiError();
        enableSubmit();
        removeErrors();
    });
});

function hideApiError() {
  $("#api-error").addClass('hide');
}

function showApiError() {
  $("#api-error").removeClass('hide');
}

function disableSubmit() {
  $("input[type=submit]").attr("disabled", "disabled");
  $(".loader").removeClass('hide');
}

function enableSubmit() {
  $("input[type=submit]").removeAttr("disabled");
  $(".loader").addClass('hide');
}

function showSuccess() {
  enableSubmit();
  removeErrors();
  window.location.href = '/danke/kreditwiderrufen';
}

function removeErrors() {
  $( ".form-group" ).each( function( index, el ) {
      $( el ).removeClass( "has-error" );
      $( el ).children('.help-block').first().text('');
  });
}

function highlightErrors(body) {
  enableSubmit();
  removeErrors();

  $.each(body['errors'], function(key, value) {
    formgroup = $('.form-group.' + key).first();
    if (formgroup) {
      formgroup.addClass('has-error');
      formgroup.children('.help-block').first().text(value[0]);
    }
  })
}
