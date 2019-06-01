var apiURL;
var selectedQuestionId = null;

function addOption(number, questionId, position, title){

  var _title = number + "." + position + ". " + title;

  var option = "<div class=\"option-dropped\"";
  option += " number=\"" + number + "\""; 
  option += " questionId=\"" + questionId + "\"";
  option += " position=\"" + position + "\"";
  option += " title=\"" + title + "\">";
  option += _title;
  option += "<span class=\"remove-option-btn\">X</span>";
  option += "</div>";

  $(".comparison-container").find(".options-container").append(option);

  if($(".options-container").find(".option-dropped").size() >= 2){
    hideNotice();
  }

  bind();

}

function bind(){

  $(".option-drop").droppable({
    over: function(event, ui){

      $(this).css("background-color", "#ccc");

      var questionId = $(ui.draggable).attr("questionId");

      if(selectedQuestionId != null){

        if(questionId != selectedQuestionId){
          showError();
        }

      }

    },
    out: function(event, ui){

      $(this).css("background-color", "#fff");

      hideError();

    },
    drop: function(event, ui){
       
      $(this).css("background-color", "#fff");

      var questionId = $(ui.draggable).attr("questionId");

      if(selectedQuestionId == null || questionId == selectedQuestionId){

        var number = $(ui.draggable).attr("number");
        var position = $(ui.draggable).attr("position");
        var title = $(ui.draggable).attr("title");

        addOption(number, questionId, position, title);

        selectedQuestionId = questionId;

      }

      hideError();

    }

  });

  $(".options-container").sortable(
    {
      containment: "parent",
      placeholder: "highlight",
      start: function(event, ui) {
          ui.item.css("background-color", "transparent");
    }
  });

  $(".remove-option-btn").click(function(){

    $(this).parent().remove();

    if($(".option-dropped").size() == 0){
      selectedQuestionId = null;  
    }

  });

  $(".question-option").draggable({
    revert: "invalid",
    revertDuration: 0,
    helper: "clone",
    appendTo: "body",
    zIndex: 10000
  }); 

}

function showError() {
  $("#cantMix").removeClass("hidden");
}

function hideError() {
  $("#cantMix").addClass("hidden");
}

function parseJSON(data){

  parseQuestions(data.questions);

  parseConfiguration(data.configuration);

}

function parseQuestions(questions){

  var html = $(".question-option").get(0).outerHTML;

  for(var i = 0; i < questions.length; i++){

    var number = i + 1;

    var title = "<h4 class=\"title-no-border\">" + questions[i].title + "</h4>";

    $("#questions-options").append(title);

    var questionId = questions[i].id;

    for(var a = 0; a < questions[i].config.options.length; a++){

      var position = questions[i].config.options[a].position;
      var title = questions[i].config.options[a].label;
      var _title = number + "." + position + ". " + title;

      var option = $(html);
      option.removeClass("hidden");

      option.attr("number", number);
      option.attr("questionId", questionId);
      option.attr("position", position);
      option.attr("title", title);

      option.html(_title);

      $("#questions-options").append(option);

    }

    $("#questions-options").append("<br>");

  }

  bind();

}

function parseConfiguration(configuration){

  for(var i = 0; i < configuration.length; i++){

    var number = configuration[i].number;
    var questionId = configuration[i].questionId;
    var position = configuration[i].position;
    var title = configuration[i].title;

    addOption(number, questionId, position, title);

    selectedQuestionId = questionId;

  }

}

function save(_continue){

  var comparisons = [];

  $(".options-container").find(".option-dropped").each(function(){

    var comparison = {};
    comparison["number"] = $(this).attr("number");
    comparison["questionId"] = $(this).attr("questionId");
    comparison["position"] = $(this).attr("position");
    comparison["title"] = $(this).attr("title");

    comparisons.push(comparison);

  });

  $.ajax({
    type: "PUT",
    url: apiURL,
    data: "configuration=" + JSON.stringify(comparisons),
    success: function(data){
      if(_continue){
        window.location.href = "/projects/#/" + $(".projectId").html() + "/analysis/comparison";
      }
    }
  });

}

$(function() {

    var loadInterval = setInterval(function(){

        var data = $(".projectId").html();

        // if this is true, it means that angular 
        // hasnt finish doing all the things it needs to do...
        if(data.indexOf("}}") == -1){

            clearInterval(loadInterval);

            start();

        }

    }, 50);

});

function start(){

  apiURL = "http://staging.frontier7.com/api/projects/" + $(".projectId").html() + "/analysis/comparison/configure";

  $("#comparison-save-btn").click(function(){
    save(false);
  });

  $("#go-to-questions-btn").click(function(){

    if($(".options-container").find(".option-dropped").size() < 2){

      showNotice();

    }else{

      save(true);

    }

  });

  $.ajax({
    type: "GET",
    url: apiURL,
    success: function(data){
      parseJSON(data);
    }
  });

}

function showNotice(){
  $("#notice").removeClass("hidden");
}

function hideNotice(){
  $("#notice").addClass("hidden");
}