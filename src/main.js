import { CFXTable } from "./UI/CFXTable.js";
import "./styles.scss";
import { bond_data, pl_data, rent_data, test_data } from "./TestData.js";


let Table;

$(document).ready(function () {
	Table = new CFXTable();

	Table.create(bond_data);

});


function newTable(data){
	$(".cf>.row,.row-head>.row").remove()
	$("#command-panel").off()
		
	Table = new CFXTable();

	Table.create(data);
}

$("#example_data_example").click((e) => {
	newTable(test_data);
})

$("#example_data_bond").click((e) => {
	newTable(bond_data);
})

$("#example_data_pl").click((e) => {
	newTable(pl_data)
})

$("#example_data_turnover").click((e) => {
	newTable(rent_data)
})