// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 750 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select(".viz")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class","xAxis-g")
    .attr("transform", "translate(0," + height + ")")

svg.append("g")
    .attr("class","yAxis-g")

svg.select(".yAxis-g")
    .call( g => g.append("text")
        .attr("class","axisTitle-1 page-1"))

svg.select(".yAxis-g")
    .call( g => g.append("text")
        .attr("class","axisTitle-1 page-3"))

svg.select(".yAxis-g")
    .call( g => g.append("text")
        .attr("class","axisTitle-2 page-1"))

d3.select("svg")
    .append("g")
    .attr("class", "annotation-group")

svg.append("path").attr("class", "year-line-2018")
svg.append("path").attr("class", "year-line-2019")
svg.append("path").attr("class", "year-line-2020")

//Read the data
d3.csv("items.csv",

// When reading the csv, I must format variables:
function(d){
    return {
    month: d.month,
    year: +d.year, 
    diff: d.diff.replace("%",""),
    amount : +d.amount.replaceAll(",","")
    }
},
drawViz)

// Now I can use this dataset:
function drawViz(data, type="amount") {
    

    var months =  Array.from(new Set(data.map(d => d.month)))
    var years = [2018 ,2019, 2020]
    // Add X axis
    var x = d3.scaleBand()
    .domain( months )
    .range([ 0, width ]);

    svg.select(".xAxis-g")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return +d.diff; }))
    .range([ height, 0 ])
    .nice()

    var y2 = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return +d.amount; }))
    .range([ height, 0 ])
    .nice()

    // Draw for the initial page
    drawAxes("amount")
    drawLines("amount")
    drawAnnotations(1)
    
    // 2020 line is invisible on page 1
    d3.select("path.year-line-2020").transition().duration(0).style("opacity",0)

    d3.selectAll("button").on("click", loadPage)

function drawLines(type){
    // Draws the corresponding lines based on whether we are using amount or percent difference(diff)
    years.forEach( (yr) => {
        var yearData = data.filter( d => d.year == yr)

        svg.selectAll(`path.year-line-${yr}`)
            .datum(yearData)                
            .attr("transform", `translate(${x.bandwidth() / 2 },0)`)
            .transition()
            .duration(1000)
            .style("opacity",1)
            .attr("fill", "none")
            .attr("stroke", yr=="2020"? "#444": "#999") // 2020 has a thicker + darker line
            .attr("stroke-width", yr=="2020"? 2: 1.3)
            .attr("d", d3.line()
                .x(function(d) { return x(d.month) })
                .y(function(d) { return (type == "amount") ? y2(d.amount): y(d.diff)})
            )
    })
}


function drawAxes(type){

    // Set the Title for the y axes
    if(type == "amount"){
        svg.select(".yAxis-g")
        .transition()
        .call(d3.axisLeft(y2))

        svg.select(".yAxis-g")
            .select(".axisTitle-1.page-1")
            .attr("x", 230)
            .attr("y", 10)
            .attr("fill","#4d4d4d")
            .style("font-size","14px")
            .text("Personal consumption expenditures");
            
        svg.select(".yAxis-g")
            .select(".axisTitle-1.page-3")
            .attr("x", 145)
            .attr("y", 10)
            .attr("fill","#4d4d4d")
            .style("font-size","14px")
            .text("Percentage difference");

        svg.select(".yAxis-g")
            .select(".axisTitle-2.page-1")
            .attr("x", 90)
            .attr("y", 25)
            .attr("fill","#4d4d4d")
            .style("font-size","13px")
            .text("(Millions USD)");
    }
    else{
        svg.select(".yAxis-g")
        .transition()
        .call(d3.axisLeft(y)
        .tickFormat(ytick => ytick+"%"))
    }

    // Selects which of the titles are to be displayed based on current type of graph
    if(type == "diff") { // page 3
        d3.selectAll("text.page-1").style("display", "none")
        d3.selectAll("text.page-3").style("display", "block")
    } 
    else{ // pages 1,2
        d3.selectAll("text.page-1").style("display", "block")
        d3.selectAll("text.page-3").style("display", "none")
    } 
}

function loadPage(page){

    // get chosen page from button's innerHTML
    page = this.innerHTML

    // draw components based on current page
    if(page == 1 ){
        
        drawAxes("amount")
        drawLines("amount")
        drawAnnotations(page)

        d3.select("path.year-line-2020").transition().duration(800).style("opacity",0)
    }
    else if(page ==2){
        
        d3.select("path.year-line-2020").transition().duration(800).style("opacity",1)
        drawAxes("amount")
        drawLines("amount")
        drawAnnotations(page)
        
    }
    else if(page == 3){
        
        d3.select("path.year-line-2020").transition().duration(800).style("opacity",1)
        drawAxes("diff")
        drawLines("diff")
        drawAnnotations(page)

    }

}

function drawAnnotations(page){
    const annotType = d3.annotationLabel

    const annotations = [
    {
        note: {
            title: "The previous years",
            label: "The years preceding 2020 showed similar trends to one another, growing at a steady rate of 4% each year."},
            x: 600,
            y: 5,
            className: "page-1",
    },
    {
        note: {
            title: "What changed in 2020",
            label: "The start of COVID-19 lockdowns caused mass panic-buying resulting to the spike in sales in March 2020."},
            x: 600,
            y: 5,
            className: "page-2",
    },
    {
        note: {
            label: "2019"},
            x: 715,
            y: 265,
            className: "page-2 page-1",
    },
    {
        note: {
            label: "2018"},
            x: 715,
            y: 310,
            className: "page-2 page-1",
    },
    {
        note: {
            label: "2020"},
            x: 715,
            y: 162,
            className: "page-2 bold-annot",
    },
    {
        note: {
            title: "Surge due to panic buying",
            label: "This is the same chart when viewing the percentage differences from the start of the year. This gives us an idea of exactly how much this surge deviated from the normal spending habits."},
            x: 600,
            y: 5,
            className: "page-3",
    },
    {
        note: {
            label: "2019"},
            x: 715,
            y: 205,
            className: "page-3",
    },
    {
        note: {
            label: "2018"},
            x: 715,
            y: 222,
            className: "page-3",
    },
    {
        note: {
            label: "2020"},
            x: 715,
            y: 240,
            className: "page-3 bold-annot",
    },
    ]

    const makeAnnotations = d3.annotation()
        .editMode(false)
        .notePadding(15)
        .type(annotType)
        .disable(["connector"])
        .textWrap(250)
        .annotations(annotations)
    
    d3.select(".annotation-group")
        .call(makeAnnotations)

    // First hide all annotations
    d3.selectAll(".annotation")
    .style("display","none")

    // Displays relevant annotations based on current page.
    if(page == 1 ){
        d3.selectAll(".annotation.page-1").style("display","block")
    }
    else if(page == 2 ){
        d3.selectAll(".annotation.page-2").style("display","block")
    }
    else if(page == 3 ){
        d3.selectAll(".annotation.page-3").style("display","block")
    }

    d3.selectAll("button").style("background","#999")
    d3.select(`button.p${page}-btn`).style("background","#222")

    }


}