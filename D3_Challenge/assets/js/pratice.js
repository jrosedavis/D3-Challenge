//***Step 1: General set up for SVG***

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//***Step 2: Begin to assign data parameters to the SVG objecet***

// Initial Params
var chosenXAxis = "poverty";  //**NOTE: Need to reference the column header of the data for x-axis***
var chosenYAxis = "healthcare";

//Step 3: Upload the data from the csv file
//**NOTE: Not working, looked it up and something about catch error returning */
// Retrieve data from the CSV file and execute everything below
 // Read CSV


  d3.csv("assets/data/healthData.csv").then(function(healthData){

    // parse data
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain(d3.extent(healthData, d => d.poverty))
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d.healthcare)])
      .range([height, 0]);

    // create axes
    var xAxis = d3.axisBottom(xLinearScale);
    var yAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    var yAxis = chartGroup.append("g")
      .call(yAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("g circle")
      .data(healthData)
      .enter()
      .append("g")

    var circlesdata = circlesGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("opacity", ".5")
      .classed("stateCircle", true);

    var circlesNames = circlesGroup.append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis]))
      .classed("stateText", true);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    // var ageLabel = xlabelsGroup.append("text")
    //   .attr("x", 0)
    //   .attr("y", 60)
    //   .attr("value", "age") // value to grab for event listener
    //   .classed("inactive", true)
    //   .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 80)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    //y-axis group and 3 labels
    var ylabelGroup = chartGroup.append("g");

    // append y axis
    var healthcareLabel = ylabelGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare")  //value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    // var smokeLabel = ylabelGroup.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0 - margin.left)
    //   .attr("x", 0 - (height / 2))
    //   .attr("value", "smokes")  //value to grab for event listener
    //   .classed("inactive", true)
    //   .text("Smokes (%)");

    // var obesityLabel = ylabelGroup.append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 0 - margin.left)
    //   .attr("x", 0 - (height / 2))
    //   .attr("value", "obesity")  //value to grab for event listener
    //   .classed("inactive", true)
    //   .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(healthData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderxAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesdata = renderxCircles(circlesdata, xLinearScale, chosenXAxis);

          // updates circles text with new x values
          circlesNames = renderxText(circlesNames, xLinearScale, chosenXAxis)

          // updates tooltips with new info
          circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

          // changes classes to change bold text
          if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);

          }
        }
      });

    // x axis labels event listener
    ylabelGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenXAxis with value
          chosenYAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(healthData, chosenYAxis);

          // updates y axis with transition
          yAxis = renderyAxes(yLinearScale, yAxis);

          // updates circles with new y values
          circlesyGroup = renderyCircles(circlesyGroup, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obsesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);

          }
        }
        })
    });