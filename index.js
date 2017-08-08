// Test task for Yandex Node.js school

$(document).ready(function(){
  
  // Additional validators
  jQuery.validator.addMethod("threeWords", function(value, element) {
    return value.split(" ").length === 3;
  }, jQuery.validator.format("Three words exactly!"));

  jQuery.validator.addMethod("yandexDomain", function(value, element) {
    var domains = ["ya.ru", "yandex.ru", "yandex.ua", "yandex.by", "yandex.kz", "yandex.com"];
    var email_valid = false;
    domains.forEach(function(domain){
      if(value.indexOf(domain, value.length - domain.length - 1) !== -1){
          email_valid = true;
      };
    });
    return email_valid; 
  }, jQuery.validator.format("Valid email address from given list only!"));

  jQuery.validator.addMethod("phoneNumber", function(value, element) {
    var re = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
    return re.test(value);
  }, jQuery.validator.format("Incorrect phone number format!"));

  jQuery.validator.addMethod("phone30", function(value, element) {
    var total = 0;
    value.split("").forEach(function(c) {
      if (/^\d+$/.test(c)) {
        total += +c;
      }
    })
    return (total <= 30);
  }, jQuery.validator.format("Sum of phone digits is too large!"));


  // Submit event handler
  $("form#myForm").on("submit", function(event) {
    event.preventDefault();
    MyForm.submit();
    return false;
  });
});


// Global object
var MyForm = {
  form:       "form#myForm",
  validate:   function() {
                var validator = $(this.form).validate({
                  rules: {
                      onfocusout: false,
                      onkeyup: false,
                      onclick: false,
                      fio: {
                          required: true,
                          threeWords: true
                      },
                      email:{
                          required: true,
                          email: true,
                          yandexDomain: true
                      },
                      phone:{
                          required: true,
                          phoneNumber: true,
                          phone30: true
                      }
                  },
                  errorPlacement: function (error, element) {
                      error.appendTo(element.closest("form"));
                  }
                });

                if ($(this.form).valid()) {
                  return {isValid: true, errorFields: ""};
                } else {
                  var fields = validator.errorList.map(function(item) {
                    return item.element.name;
                  });
                  return {isValid: false, errorFields: fields};
                }
              },

  getData:    function() {
                var data = {}
                $(this.form + " input:text").each(function(index, formField) {
                  data[formField.name] = formField.value;
                })
                return data;
              },

  setData:    function(data) {
                if (data.hasOwnProperty("fio")) {
                  $(this.form + " input[name=fio]").val(data.fio);
                }
                if (data.hasOwnProperty("email")) {
                  $(this.form + " input[name=email]").val(data.email);
                }
                if (data.hasOwnProperty("phone")) {
                  $(this.form + " input[name=phone]").val(data.phone);
                }
              },

  submit:     function() {
                // ajaxPost gets and serializes form data, then sends it to given url
                // When done, calls callback (processResponse)
                var ajaxPost = function (form, callback) {
                  var formData = $(form).serialize();
                  var url = $(form).attr("action");

                  $.ajax({type:    "POST",
                    url:     url,
                    data:    formData,
                    success: function(response) {
                      callback(response);
                    },
                    error:   function(jqXHR, textStatus, errorThrown) {
                          alert("Error, status = " + textStatus + ", " +
                                "error thrown: " + errorThrown
                          )},
                    dataType: "json"
                  })
                }

                // processResponse analyzes server response object
                var processResponse = function(response) {
                  switch (response["status"]) {
                    case "success":
                      $("#resultContainer").addClass("success");
                      $("#resultContainer").text("Success");
                      break;
                    case "error": 
                      $("#resultContainer").addClass("error");
                      $("#resultContainer").text(response.reason);
                      break;
                    case "progress":
                      $("#resultContainer").addClass("progress");
                      setTimeout(ajaxPost("form#myForm", processResponse), response.timeout);
                  }
                }

                // Validates form data and starts ajax posting if valid
                if (MyForm.validate().isValid) {
                  $("#submitButton").prop("disabled", true);
                  ajaxPost("form#myForm", processResponse)
                }
              }
}