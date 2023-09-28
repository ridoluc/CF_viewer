import { CFXTable } from "./UI/CFXTable.js";
import { Scrollbar } from "./UI/scrollbar.js";
import "./styles.scss";

let testdata = [
	{
		name: "First Line",
		cf: [
			{ date: "2023-02-23", value: -10000 },
			{ date: "2023-04-01", value: 10 },
			{ date: "2023-04-01", value: 10 },
			{ date: "2023-09-03", value: 10 },
			{ date: "2023-09-18", value: 10 },
			{ date: "2024-03-03", value: 10 },
			{ date: "2024-07-17", value: 1000 },
			{ date: "2025-09-03", value: 2500 },
			{ date: "2025-10-23", value: 2500 },
		],
	},
	{
		name: "Second Line",
		cf: [
			{ date: "2023-03-23", value: -1000 },
			{ date: "2023-05-01", value: 10 },
			{ date: "2023-04-01", value: 10 },
			{ date: "2023-09-03", value: 10 },
			{ date: "2023-10-18", value: 100 },
			{ date: "2024-01-12", value: -10 },
			{ date: "2024-06-10", value: -500 },
			{ date: "2025-10-03", value: 300 },
			{ date: "2026-01-12", value: 2000 },
		],
	},
];

let Table, scrollbar;

$(document).ready(function () {
	Table = new CFXTable();
	Table.dataset.addLine(testdata[0].name, testdata[0].cf);
	Table.dataset.addLine(testdata[1].name, testdata[1].cf);
	Table.create();
	scrollbar = new Scrollbar(
		document.getElementById("scroll-wrapper"),
		document.getElementsByClassName("cf")[0]
	);
	scrollbar.setCursorWidth(Table.column.cf.width());
});
