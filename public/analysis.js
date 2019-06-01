var chartColors = ["#207c85", "#7cb7c2", "#ceb752", "#cca052", "#8f9c46", "#6f7459", "#7e526c", "#522728", "#4a2750", "#39284e", "#cc6227", "#a03924", "#073439", "#979f92", "#b2b793", "#207c85", "#7cb7c2", "#ceb752", "#cca052", "#8f9c46", "#6f7459", "#7e526c", "#522728", "#4a2750", "#39284e", "#cc6227", "#a03924", "#073439", "#979f92", "#b2b793", "#207c85", "#7cb7c2", "#ceb752", "#cca052", "#8f9c46", "#6f7459", "#7e526c", "#522728", "#4a2750", "#39284e", "#cc6227", "#a03924", "#073439", "#979f92", "#b2b793"];

var filters = {};
filters["questions"] = {};
filters["emailRecipientLists"] = [];
filters["SMSRecipientLists"] = [];

var activeFilters = {};

function buildLineChart(questionId, stats){

  var column = ["data"];
  var labels = [];
  var total = 0;
  var maxPercent = 0;

  for(var label in stats.frequencies){
    total = total + stats.frequencies[label];
  }

  for(var label in stats.frequencies){
    if(stats.frequencies[label] > 0){
      column.push(stats.frequencies[label]/total);
      labels.push(label);
      if(maxPercent < stats.frequencies[label]/total)
	  maxPercent = stats.frequencies[label]/total;
    }
  }

  var yTickValues = [];
  var percent = 0;
  var yMax = maxPercent;
  for(; percent*10 < maxPercent*100; percent++){
      yTickValues.push(percent*10/100);
      yMax = percent*10/100
  }

  if(percent*10 >= maxPercent*100){
      yTickValues.push(percent*10/100);
      yMax = percent*10/100;
  }
  

  var colors = [];
  colors["data"] = chartColors[0];

  c3.generate({
    interaction: {
      enabled: true
    },
    bindto: "#chart-" + questionId,
    data: {
      columns: [column],
      type : "line",
      colors: colors
    },
    point: {
      show: true
    },
    legend: {
      show: false
    },
    tooltip: {
      format: {
        title: function(d){
          return ""; 
        },
        name: function(name, ratio, id, index){
          var format = d3.format(',');
          return "Frequency: " + format(column[index + 1]*total);
        },
        value: function(value, ratio, id, index){
          var format = d3.format('%');
          return "Percent: " + format(column[index + 1]);
        }
      }
    },
    axis: {
      x: {
        type: "category",
        categories: labels
      },
      y: {
	  tick:{
	      format: d3.format('%'),
	      values : yTickValues
	  },
	  padding:{
	      top: 0,
	      bottom: 0
	  },
	  max: yMax,
	  min: 0
      }
    }
  });
}

function buildPieChart(questionId, stats){

  var columns = [];
  var stockColors = [];
  var total = 0;

  for(var i = 0; i < stats.length; i++){

    if(stats[i].frequency > 0){
        
        var slice = [stats[i].label, stats[i].frequency];
        total = total + stats[i].frequency;
  
        columns.push(slice);
        stockColors.push(chartColors[i]);

    }

  }

  var i = 0;
  var colors = [];

  c3.generate({
    bindto: "#chart-" + questionId,
    data: {
      columns: columns,
      type : "donut",
      color: function(color, d){
        if(d.id != null){
          return;
        }
        if(colors[d] == null){
          colors[d] = stockColors[i++];
        }
        return colors[d];
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      format: {
        name: function(name, ratio, id, index){
          var f1 = d3.format(',');
          return "Frequency: " + f1(columns[index][1]);
        },
        value: function(value, ratio, id, index){
          var f2 = d3.format('%');
          return "Percent: " + f2(columns[index][1] / total);
        }
      }
    },
    donut: {
      label: {
        format: function(value, ratio, id){
          return value;
        }
      }
    }
  });

}

function buildGroupPieChart(questionId, stats){

  var columns = [];
  var stockColors = [];
  var total = 0;

  for(var i = 0; i < stats.length; i++){

    if(stats[i].mean > 0){
        
        var slice = [stats[i].label, stats[i].mean.toFixed(2)];
        total = total + stats[i].frequency;
  
        columns.push(slice);
        stockColors.push(chartColors[i]);

    }

  }

  var i = 0;
  var colors = [];

  c3.generate({
    bindto: "#chart-" + questionId,
    data: {
      columns: columns,
      type : "donut",
      color: function(color, d){
        if(d.id != null){
          return;
        }
        if(colors[d] == null){
          colors[d] = stockColors[i++];
        }
        return colors[d];
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      format: {
        name: function(name, ratio, id, index){
          var f1 = d3.format(',');
          return "Mean: " + f1(columns[index][1]);
        },
        value: function(value, ratio, id, index){
          var f2 = d3.format('%');
          return "Percent: " + f2(ratio);
        }
      }
    },
    donut: {
      label: {
        format: function(value, ratio, id){
          return value;
        }
      }
    }
  });

}

function buildStackedBarChart(questionId, stats){

  var frequencies = {};
  var groups = [];
  var categories = [];

  var total = 0;
  for(var label in stats.labelsFrequencies){
    for(var value in stats.labelsFrequencies[label]){
      total = total + stats.labelsFrequencies[label][value];
    }
    break;
  }

  for(var label in stats.labelsFrequencies){

    categories.push(label);

    for(var value in stats.labelsFrequencies[label]){

      if(frequencies[value] == null){
        
        frequencies[value] = [value];

        groups.push(value);

      }

      var frequency = stats.labelsFrequencies[label][value];

      frequencies[value].push(frequency/total);

    }

  }

  var yTickValues = []
  for(var i = 0; i <= 10; i++){
      yTickValues.push(i*10/100);
  }


  var columns = [];

  for(var value in frequencies){
    columns.push(frequencies[value]);
  }

  var colors = [];

  c3.generate({
    interaction: {
      enabled: true
    },
    bindto: "#chart-" + questionId,
    data: {
      columns: columns,
      groups: [groups],
      type: "bar",
      labels: false,
      color: function(color, d){

        if(d.index == null){
          return;
        }

        if(colors[d.index] == null){
          colors[d.index] = 0;
        }else{
          colors[d.index]++;
        }

        var i = colors[d.index];

        return chartColors[i];

      }
    },
    legend: {
      show: false
    },
    tooltip: {
      format: {
        title: function(d){
          return ""; 
        },
        name: function(name, ratio, id){
          return 'Rank: ' + name;
        },
        value: function(value, ratio, id){
          var format = d3.format(',');
          return 'Frequency: ' + format(value*total);
        }
      }
    },
    axis: {
      x: {
        type: "category",
        categories: categories
      },
      y: {
	  tick:{
	      format: d3.format('%'),
	      values: yTickValues
	  },
	  padding:{
	      top: 0,
	      bottom: 0
	  },
	  max: 1,
	  min:0
      }
    }
  });

}

function buildBarChart(questionId, responsesCount, stats){

  var column = ["data"];
  var categories = [];
  var yTickValues = [];

  var maxXAxisLength = 8 * 16;
  var totalXLabelLength = 0;
  var maxPercent = 0;
  var maxXLabelLength = 0;

  var counter = 0
  for(var i = 0; i < stats.length; i++){

    if(stats[i].frequency > 0){
      column.push(stats[i].frequency/responsesCount);
      categories.push(stats[i].label);
      totalXLabelLength = totalXLabelLength + stats[i].label.length;
      if(maxXLabelLength < stats[i].label.length)
	  maxXLabelLength = stats[i].label.length;
      counter = counter + 1;
    }

    if(maxPercent < stats[i].frequency/responsesCount)
	maxPercent = stats[i].frequency/responsesCount;

  }

  var percent = 0;
  var yMax = maxPercent;
  for(; percent*10 < maxPercent*100; percent++){
      yTickValues.push(percent*10/100);
      yMax = percent*10/100;
  }

  if(percent*10 >= maxPercent*100){
      yTickValues.push(percent*10/100);
      yMax = percent*10/100;
  }

  
  var xLabelRotate = 0;
  var xTickNo = counter;

  var xHeight = 30;

  if(totalXLabelLength > maxXAxisLength){
      xLabelRotate = 15;
      xTickNo = xTickNo + 1;
      
      xHeight = Math.floor(maxXLabelLength/3) * 8;
  }

  c3.generate({
    bindto: "#chart-" + questionId,
    data: {
      columns: [column],
      type: "bar",
      labels: {
	  format: function (v, id, i, j) {
	      return v*responsesCount;
          }
      },
      color: function(color, d) {
        return chartColors[d.index];
      },

    },
    legend: {
      show: false
    },
    tooltip: {
      format: {
        title: function(d){
          return ""; 
        },
        name: function(name, ratio, id, index){
          var format = d3.format(',');
          return "Frequency: " + format(column[index + 1]*responsesCount);
        },
        value: function(value, ratio, id, index){
          var format = d3.format('%');
          return "Percent: " + format(column[index + 1]);
        }
      }
    },
    axis: {
      x: {
        type: "category",
        categories: categories,
	tick:{
	    rotate: xLabelRotate,
	    multiline: false
	},
	max: xTickNo-1,
	height: xHeight
      },
      y: {
	  tick:{
	      format: d3.format('%'),
	      values : yTickValues
	  },
	  padding:{
	      top: 0,
	      bottom: 0
	  },
	  max: yMax,
	  min: 0
      }

    },
    bar: {
      width: {
        ratio: 0.7
      }
    },
  });
}

function buildGroupBarChart(questionId, stats){

  var column = ["data"];
  var categories = [];
  var max = 0;
  var total = 0;

  for(var i = 0; i < stats.length; i++){
    if(max < stats[i].mean){
      max = stats[i].mean;
    }
    total = total + stats[i].frequency;
  }

  for(var i = 0; i < stats.length; i++){

    if(stats[i].mean > 0){
      column.push(stats[i].mean.toFixed(2)/max);
      categories.push(stats[i].label);
    }
  }

  var yTickValues = []
  var percent = 0;
  var yMax = 0;
  for(; percent*10 <=100; percent++){
      yTickValues.push(percent*10/100);
      yMax = percent*10/100
  }

  c3.generate({
    bindto: "#chart-" + questionId,
    data: {
      columns: [column],
      type: "bar",
      labels: true,
      color: function(color, d) {
        return chartColors[d.index];
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      format: {
        title: function(d){
          return ""; 
        },
        name: function(name, ratio, id, index){
          var format = d3.format(',');
          return "Mean: " + format(column[index + 1]*max);
        },
        value: function(value, ratio, id, index){
          var format = d3.format('%');
          return "Percent: " + format(column[index + 1]);
        }
      }
    },
    axis: {
      x: {
        type: "category",
        categories: categories
      },
      y: {
	  tick:{
	      format: d3.format('%'),
	      values : yTickValues
	  },
	  padding:{
	      top: 0,
	      bottom: 0
	  },
	  max: yMax,
	  min: 0
      }
    },
    bar: {
      width: {
        ratio: 0.7
      }
    }
  });

}

function buildPieLegend(questionId, statsList){

  var container = $("<div class=\"legend\"></div>");
  $("#chart-" + questionId).append(container);

  var column1 = $("<div class=\"column-1\"></div>");
  container.append(column1);

  var column2 = $("<div class=\"column-2\"></div>");
  container.append(column2);

  var limit = 10;

  if(statsList.length > 20){
    limit = Math.ceil(statsList.length / 2);
  }

  var counter = 0;

  for(var i = 0; i < statsList.length; i++){
    
    if((statsList[i].frequency != null && statsList[i].frequency > 0) || (statsList[i].mean != null && statsList[i].mean > 0)){
      
      if(counter < limit){
        column1.append($("<div class=\"legend-label\" style=\"white-space:nowrap\"><div class=\"legend-text\">" + statsList[i].label + "</div><div style=\"background-color:" + chartColors[i] + "\" class=\"square\"></div></div>"));
      }else{
        column2.append($("<div class=\"legend-label\" style=\"white-space:nowrap\"><div style=\"background-color:" + chartColors[i] + "\" class=\"square\"></div><div class=\"legend-text\">" + statsList[i].label + "</div></div>"));
      }

      counter = counter + 1;

    }

  }

}

function addFilterContainer(id, isInit){

  $("#filters .content #active").css("display", "block");

  var title;
  var options;
  var maxOptionsPerColumn;

  if(id.indexOf("question-") > -1){

    var questionId = id.replace("question-", "");

    title = filters["questions"][questionId]["title"];
    options = filters["questions"][questionId]["options"];
    maxOptionsPerColumn = Math.round(options.length / 2);

  }else if(id.indexOf("email-recipient-lists") > -1){

    title = "Email Recipient Lists";
    options = filters["emailRecipientLists"];
    maxOptionsPerColumn = Math.round(Object.keys(options).length / 2);

  }else if(id.indexOf("sms-recipient-lists") > -1){ 

    title = "SMS Recipient Lists";
    options = filters["SMSRecipientLists"];
    maxOptionsPerColumn = Math.round(Object.keys(options).length / 2);

  }
  
  content = "<div class=\"answers\" id=\"filter-" + id + "\">";
  content += "  <div class=\"title\">";
  
  if(isInit){
    content += "  <button class=\"expand\" closed=\"true\">";
    content += "    <i class=\"fa fa-caret-right\"></i>";
  }else{
    content += "  <button class=\"expand\" closed=\"false\">";
    content += "    <i class=\"fa fa-caret-down\"></i>";
  }

  content += "      " + title;
  content += "    </button>";
  content += "    <button class=\"remove\">X</button>";
  content += "  </div>";

  if(isInit){
    content += "<div class=\"columns hidden\">";
  }else{
    content += "<div class=\"columns\">";
  }

  content += "    <div class=\"column-1\"></div>";
  content += "    <div class=\"column-2\"></div>";
  content += "  </div>";
  content += "</div>";

  $("#selected").append(content);

  var count = 0;

  for(var i = 0; i < options.length; i++){

    var column;

    if(count++ < maxOptionsPerColumn){
      column = $("#filter-" + id + " .columns .column-1");
    }else{
      column = $("#filter-" + id + " .columns .column-2");
    }

    if(isInit && $.inArray(parseInt(options[i].id), activeFilters[id]) > -1){
      column.append("<label><input checked type=\"checkbox\" value=\"" + id + "-" + options[i].id + "\">" + options[i].name + "</label>");
    }else{
      column.append("<label><input type=\"checkbox\" value=\"" + id + "-" + options[i].id + "\">" + options[i].name + "</label>");
    }

  }

}

function bindFilters(){

  $("#selected .answers .expand").unbind();
  $("#selected .answers .expand").click(function(){

    $(this).find("i").remove();

    if($(this).attr("closed") == "false"){

      $(this).attr("closed", "true");
      $(this).prepend("<i class=\"fa fa-caret-right\"></i>");
      $(this).parent().parent().find(".columns").addClass("hidden");

    }else{

      $(this).attr("closed", "false");
      $(this).prepend("<i class=\"fa fa-caret-down\"></i>");
      $(this).parent().parent().find(".columns").removeClass("hidden");

    }
    
  });

  $("#selected .answers .remove").unbind();
  $("#selected .answers .remove").click(function(){

    $(this).parent().parent().remove();

    buildSelection();

  });

}

function buildSelection(){

  var active = [];

  $("#selected .answers").each(function(){

    var id = $(this).attr("id").replace("filter-", "");
    
    active.push(id);

  });

  $("#selection").html("<option value=\"\">Choose one of your variables to filter:</option>");

  if(filters["emailRecipientLists"].length > 0 && $.inArray("email-recipient-lists", active) == -1){
    $("#selection").append("<option value=\"email-recipient-lists\">Email Recipient Lists</option>");
  }

  if(filters["SMSRecipientLists"].length > 0 && $.inArray("sms-recipient-lists", active) == -1){
    $("#selection").append("<option value=\"sms-recipient-lists\">SMS Recipient Lists</option>");
  }

  for(var questionId in filters["questions"]){

    if($.inArray("question-" + questionId, active) == -1){
      $("#selection").append("<option value=\"question-" + questionId + "\">" + filters["questions"][questionId]["title"] + "</option>");
    }

  }

  if($("#selected .answers").size() == 0){
    $("#filters .content #active").css("display", "none");
  }

}

function setupCharts(questionType, questionId, stats){

  if(questionType == "multiple-choice-text" || questionType == "multiple-choice-image" || questionType == "grid-scale-grouped" || questionType == "group-analysis"){

    changeCharts("bar", questionType, questionId, stats)
  
  }else if(questionType == "sliding-scale" || questionType == "grid-scale"){

    changeCharts("line", questionType, questionId, stats);
  
  }else if(questionType == "rank-order"){

    changeCharts("stacked", questionType, questionId, stats);

  }

}

function changeCharts(chartType, questionType, questionId, stats){

  $("#chart-" + questionId).html("");

  var container = $("#chart-" + questionId).parent();

//  container.find(".y-axis").remove();
  
  if(chartType == "pie"){
    
    var height = container.find(".chart").css("height");

    container.find(".chart").css("width", height);
    container.find(".chart").css("float", "left");

    if(questionType == "multiple-choice-text" || questionType == "multiple-choice-image"){
      
      buildPieChart(questionId, stats.statsList);
      buildPieLegend(questionId, stats.statsList);
    
    }else if(questionType == "grid-scale-grouped"){
      
      buildPieChart(questionId, stats.consolidatedStats);
      buildPieLegend(questionId, stats.consolidatedStats);
    
    }else if(questionType == "group-analysis"){

      buildGroupPieChart(questionId, stats.optionsCalculations);
      buildPieLegend(questionId, stats.optionsCalculations);

    }

    var legendHeight = $("#chart-" + questionId + " .legend").position().top + $("#chart-" + questionId + " .legend").height();
    $("#chart-" + questionId).parent().css("height", legendHeight);

    container.find(".chart").css("width", 500);

  }else if(chartType == "bar"){

    container.find(".chart").css("width", "905px");
    container.find(".chart").css("float", "right");

   if(questionType == "multiple-choice-text" || questionType == "multiple-choice-image"){
      
      buildBarChart(questionId, stats.calculations.responsesCount, stats.statsList);
    
    }else if(questionType == "grid-scale-grouped"){
      
      buildBarChart(questionId, stats.consolidatedCalculations.responsesCount, stats.consolidatedStats);
    
    }else if(questionType == "group-analysis"){

      buildGroupBarChart(questionId, stats.optionsCalculations);

    }

    var height = container.find(".chart").height();
    $("#chart-" + questionId).parent().css("height", height);
  
  }else if(chartType == "line"){

    container.find(".chart").css("width", "905px");
    container.find(".chart").css("float", "right");

    buildLineChart(questionId, stats);

    var height = container.find(".chart").height();
    $("#chart-" + questionId).parent().css("height", height);
  
  }else if(chartType == "stacked"){

    container.find(".chart").css("width", "100%");
    container.find(".chart").css("float", "right");

    buildStackedBarChart(questionId, stats);

    var height = container.find(".chart").height();
    $("#chart-" + questionId).parent().css("height", height);

  }

}

function reload(){

  var selection = {};

  $("#selected .answers").each(function(){

    var id = $(this).attr("id").replace("filter-", "").toString();

    selection[id] = [];

    $(this).find("input:checked").each(function(){

      var optionId = parseInt($(this).val().replace(id + "-", ""));

      selection[id].push(optionId);

    });

  });

  var _location = window.location.href;

  if(_location.indexOf("?") > -1){

    var end = _location.indexOf("?");

    _location = _location.substring(0, end);

  }

  if(Object.keys(selection).length){
    window.location.href = _location + "?filters=" + JSON.stringify(selection);
  }else{
    window.location.href = _location;
  }

}

function prepareFilters(){

  $("div[chart-data]").each(function(){

    var data = JSON.parse($(this).attr("chart-data"));

    if(data.questionType == "multiple-choice-text"){

      filters["questions"][data.questionId] = {};
      filters["questions"][data.questionId]["title"] = data.questionTitle;
      filters["questions"][data.questionId]["options"] = [];

      for(var i = 0; i < data.question.config.options.length; i++){

        var option = {};
        option["name"] = data.question.config.options[i].label;
        option["id"] = data.question.config.options[i].position; 

        filters["questions"][data.questionId]["options"].push(option);   

      }

    }

  });

  var emailRecipientListsData = JSON.parse($("#emailRecipientListsData").html()).lists;

  for(var i = 0; i < emailRecipientListsData.length; i++){

    var option = {};
    option["name"] = emailRecipientListsData[i]["name"];
    option["id"] = emailRecipientListsData[i]["id"];

    filters["emailRecipientLists"].push(option);

  }

  var SMSRecipientListsData = JSON.parse($("#SMSRecipientListsData").html()).lists;

  for(var i = 0; i < SMSRecipientListsData.length; i++){

    var option = {};
    option["name"] = SMSRecipientListsData[i]["name"];
    option["id"] = SMSRecipientListsData[i]["id"];

    filters["SMSRecipientLists"].push(option);

  }

}

function parseFilters(){

  var _location = window.location.href;

  if(_location.indexOf("?") > -1){

    var txt = "filters=";
    var ini = _location.indexOf(txt) + txt.length;

    activeFilters = decodeURI(_location.substring(ini, _location.length));
    activeFilters = JSON.parse(activeFilters);

    for(id in activeFilters){
      addFilterContainer(id, true);
    }

    bindFilters();

  }

}

function setDownloadButton(){

  var _location = window.location.href;

  if(_location.indexOf("analysis/questions") > -1){

    _location = _location.replace("analysis/questions", "analysis/questions/export");

  }else if(_location.indexOf("analysis/group") > -1){

    _location = _location.replace("analysis/group", "analysis/group/export");

  }

  _location = _location.replace("projects/#/", "api/projects/");

  $("#export-btn").click(function(){

    window.open(_location, '_blank');

  });

}

$(function() {

    var loadInterval = setInterval(function(){

        var data = $("#SMSRecipientListsData").html();

        // if this is true, it means that angular 
        // hasnt finish doing all the things it needs to do...
        if(data.indexOf("| json}}") == -1){

            clearInterval(loadInterval);

            start();

        }

    }, 50);

});

function start(){

  setDownloadButton();

  $("div[chart-data]").each(function(){

    if($(this).find(".chart").size() > 0){
    
      var questionId = $(this).find(".chart").attr("id").replace("chart-", "");
      
      var data = $(this).attr("chart-data");
      var stats = JSON.parse(data);
      var questionType = stats.questionType;

      setupCharts(questionType, questionId, stats);

    }

  });

  $("#selection").change(function(){

    var id = $(this).val();

    if(id != ""){

      addFilterContainer(id, false);
      
      bindFilters();

      $("#selection option:selected").remove();

    }

  });

  $("#statistics #filters .content #buttons #apply-filters").click(function(){
    reload();
  });

  $("#statistics #filters .content #buttons #refresh-stats").click(function(){
    window.location.reload();
  });

  $(".chart-container .option").click(function(){

    var parent = $(this).parent();

    var enabled = parent.find("button:enabled");
    var disabled = parent.find("button:disabled");

    enabled.prop("disabled", true);
    disabled.prop("disabled", false);

    var chartType = $(this).attr("id");
    var questionId = parent.parent().find(".chart").attr("id").replace("chart-", "");
    var questionType = $("div[question-id=" + questionId + "]").attr("question-type");
    var data = $("div[question-id=" + questionId + "]").attr("chart-data");
    var stats = JSON.parse(data);

    changeCharts(chartType, questionType, questionId, stats);

  });

  prepareFilters();
  parseFilters();
  buildSelection();

}
