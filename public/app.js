$.get("/scrape", function(data){
    console.log(data);
    $.getJSON("/articles", function(data) {
      for (var i = 0; i < data.length; i++) {
        $("#articles").append(
          "<div class='news' data-id='" + data[i]._id + "'>" 
            + "<p> Title: " + data[i].title + "</p>"
            + "<p> Sumamry: " + data[i].summary + "</p>"
            + "<p> Link: " + data[i].link + "<p>"
            + "</div>");
        if (i !== data.length - 1){
          $("#articles").append("<hr>");
        }
      }
    });
})


$(document).on("click", ".news", function() {

  $("#comments").empty();

  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })

    .then(function(data) {
      console.log(data);

      $("#comments").append("<h2>" + data.title + "</h2>");
      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#comments").append("<button data-id='" + data._id + "' class='savecomment'>Add Comment</button>");

      if (data.comment) {
        $("#bodyinput").val(data.comment);
      }
    });
});

$(document).on("click", ".savecomment", function(){
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {comment: $("#bodyinput").val()}
  })
})

