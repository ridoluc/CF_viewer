import {CFLine, CFDate, CFDataSet} from './CFDataset.js'

let testdata = [[
		{ date: "2023-02-23", value: -10000 },
		{ date: "2023-04-01", value: 10 },
		{ date: "2023-04-01", value: 10 },
		{ date: "2023-09-03", value: 10 },
		{ date: "2023-09-18", value: 10 },
		{ date: "2024-03-03", value: 10 },
		{ date: "2024-07-17", value: 1000 },
		{ date: "2025-09-03", value: 2500 },
]];

let cfds = new CFDataSet();

cfds.addLine('My new line', testdata[0]);
cfds.addLine('Second line');

console.log("line 1:"+cfds.getLine(0).line_name)

printData(cfds.getLine(0).getLineData(CFLine.time_interval.year));

console.log("line 2:"+cfds.getLine(1).line_name);
printData(cfds.getLine(1).getLineData(CFLine.time_interval.year));


function printData(dt){
   dt.forEach(e => {
      console.log(CFDate.toString(e.date, 'mmm yyyy')+'      '+e.value);
   });
}

