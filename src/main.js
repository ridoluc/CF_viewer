import { CFXTable } from "./UI/CFXTable.js";
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
	{
		name: "Third Line",
		cf: [
		  { date: "2023-03-23", value: 500 },
		  { date: "2023-05-01", value: -10 },
		  { date: "2023-04-01", value: 20 },
		  { date: "2023-09-03", value: -50 },
		  { date: "2023-10-18", value: 200 },
		  { date: "2024-01-12", value: 100 },
		  { date: "2024-06-10", value: 250 },
		  { date: "2025-10-03", value: -300 },
		  { date: "2026-01-12", value: -1500 },
		],
	 },
	{
		name: "Fourth Line",
		cf: [
		  { date: "2023-03-23", value: 100 },
		  { date: "2023-05-01", value: 50 },
		  { date: "2023-04-01", value: -30 },
		  { date: "2023-09-03", value: -70 },
		  { date: "2023-10-18", value: 300 },
		  { date: "2024-01-12", value: 200 },
		  { date: "2024-06-10", value: -50 },
		  { date: "2025-10-03", value: 400 },
		  { date: "2026-01-12", value: -1000 },
		],
	 }
	 
	 
	 
	 
	 
	 
];

let Table;

$(document).ready(function () {
	Table = new CFXTable();

	Table.dataset.addLine(testdata[0].name, testdata[0].cf);
	Table.dataset.addLine(testdata[1].name, testdata[1].cf);
	Table.dataset.addLine(testdata[2].name, testdata[2].cf);
	Table.dataset.addLine(testdata[3].name, testdata[3].cf);

	Table.create();

});
