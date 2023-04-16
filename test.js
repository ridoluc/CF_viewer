import {CFLine, CFDate} from './CFDataset.js'

let testdata = [
		{ date: "2023-02-23", value: -10000 },
		{ date: "2023-04-01", value: 10 },
		{ date: "2023-04-01", value: 10 },
		{ date: "2023-09-03", value: 10 },
		{ date: "2023-09-18", value: 10 },
		{ date: "2024-03-03", value: 10 },
		{ date: "2024-07-17", value: 1000 },
];

let cfline = new CFLine('My new line', testdata);

printData(cfline.getLineData(CFLine.time_interval.year))

function printData(dt){
   dt.forEach(e => {
      console.log(CFDate.toString(e.date)+'      '+e.value);
   });
}