
function makeChart(data,stylename,media,plotpadding,legAlign,yAlign){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d != 'date'; });
    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this chart
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });

    margin=margin[0].margin[0]
    var maxVal=d3.max(data, function(d){return +d.value})
    var minVal=d3.min(data, function(d){return +d.value})

    var colours = d3.scale.linear()
    .range(["white", stylename.fillcolours[0]])
    .domain([minVal, maxVal]);

    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    var cellSize = plotWidth/54; // cell size

    
    var xDomain = d3.extent(data, function(d) {return d.date;});
    var startYear=xDomain[0].getFullYear();
    var endYear=xDomain[1].getFullYear();

    var percent = d3.format(".1%");
    var format = d3.time.format("%Y-%m-%d");
    var toolDate = d3.time.format("%d/%b/%y");

    //console.log(data)

    var plotData=d3.nest()
        .key(function(d){return d.date.getFullYear();})
        .entries(data)




    //console.log(values)
    console.log(plotData)

    var calendar = plot.selectAll("g")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id",function(d) {return d.key+"-"+d.value})
        .attr("transform",function(d,i){
                 return "translate("+(0)+","+i*(cellSize*7+yOffset*2)+")"
            })
    .call(function(parent){

        parent.append("text")
            .attr("class", media+"subtitle")
            .attr("y",yOffset)
            .text(function(d) {return d.key})

        //create day labels
        var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var dayLabels=parent.append('g').attr('id','dayLabels')
        days.forEach(function(d,i)    {
            dayLabels.append('text')
            .attr('class',media+'subtitle')
            .attr('x',0)
            .attr('y',function(d) { return yOffset*1.4+(i * cellSize); })
            .attr('dy','0.9em')
            .text(d);
        })

        var rects = parent.append('g')
        .attr("transform",function(d,i){
                 return "translate("+(0)+","+yOffset*1.5+")"
            })
            .attr('id','alldays')
            .selectAll('.day')
            .data(function(d) { 
                return d.values
                //return d3.time.days(new Date(parseInt(d.key), 0, 1), new Date(parseInt(d.key) + 1, 0, 1));
            })
            .enter().append('rect')
            .attr('id',function(d) {
                return '_'+format(d.date);
                //return toolDate(d.date)+':\n'+d.value+' dead or missing';
            })
            .attr('class', media+'day')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('x', function(d) {
                return (d3.time.weekOfYear(d.date) * cellSize+margin.left);
            })
            .attr('y', function(d) { return (d.date.getDay() * cellSize); })
            .style("fill",function(d) {return colours(d.value)})
            //.datum(format);

            //add montly outlines for calendar
            parent.append('g')
            .attr('id',media+'monthOutlines')
            .selectAll('.month')
            .data(function(d) { 
                return d3.time.months(new Date(parseInt(d.key), 0, 1),
                                      new Date(parseInt(d.key) + 1, 0, 1)); 
            })
            .enter().append('path')
            .attr('class', media+'month')
            .attr('transform','translate('+(margin.left)+','+(yOffset*1.5)+')')
            .attr('d', monthPath);

            //retreive the bounding boxes of the outlines
            var BB = new Array();
            var mp = document.getElementById(media+'monthOutlines').childNodes;
            for (var i=0;i<mp.length;i++){
                BB.push(mp[i].getBBox());
            }
            var monthX = new Array();
            BB.forEach(function(d,i){
                boxCentre = d.width/2;
                monthX.push(d.x+boxCentre);
            })

            //create centred month labels around the bounding box of each month path
            //create day labels
            var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
            var monthLabels=parent.append('g').attr('id','monthLabels')
            months.forEach(function(d,i)    {
                monthLabels.append('text')
                .attr('class',media+'subtitle')
                .attr('x',monthX[i])
                .attr('y',yOffset)
                .text(d);
            })





            //pure Bostock - compute and return monthly path data for any year
            function monthPath(t0) {
              var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                  d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
                  d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
              return 'M' + (w0 + 1) * cellSize + ',' + d0 * cellSize
                  + 'H' + w0 * cellSize + 'V' + 7 * cellSize
                  + 'H' + w1 * cellSize + 'V' + (d1 + 1) * cellSize
                  + 'H' + (w1 + 1) * cellSize + 'V' + 0
                  + 'H' + (w0 + 1) * cellSize + 'Z';
    }


    })

    

}