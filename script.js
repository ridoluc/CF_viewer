// import {CFDataSet, CFDate} from './CFDataset.js'

let testdata = [
	{
		name: "test name",
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
];

let Table;

$(document).ready(function () {
	Table = new CFXTable();
	Table.dataset.addLine(new CFLine(0, testdata[0].name, testdata[0].cf));
	Table.update();
	scrollbar = new Scrollbar(
		document.getElementById("scroll-wrapper"),
		document.getElementsByClassName("cf")[0]
	);
	scrollbar.setCursorWidth(Table.column.cf.width());
});

class CFXTable {
	constructor() {
		this._table = $("#CFXTable");
		this.dataset = new CFDataSet();
		this.id_counter = 0;

		this.time_interval = CFLine.time_interval.quarter;
		this.cf_column_count;

		this.column = {
			row_head: $(".column-row-head"),
			total: $(".column-total"),
			cf: $(".cf"),
		};
	}

	rowSelect(id) {
		return $('.row [data-rowid="' + id + '"]');
	}

	row_hover(id) {
		const row_columns = this.rowSelect(id);
		// row_columns.forEach(x => x.hover(
		//    function() {
		//       console.log($(this).attr('data-rowid'))
		//    //   $( this ).addClass( "hovered" );
		//    }, function() {
		//    //   $( this ).removeClass( "hovered" );S
		//    }
		//  ));
	}

	/**
	 * create the visual representation of the CF line
	 * @returns {Object} obj containg the row head, total, cf
	 */
	rowCreate() {
		// const newid = line_data.id;

		const row_head = $("<div>")
			.addClass("row row-head")
			// .attr("data-rowid", newid)
			.html(
				'<div class="row-start-cell">' +
					'<div class="row-select"></div>' +
					'<div class="add-row" onclick="Table.addRow()"></div>' +
					"</div>" +
					'<div class="row-name">Line Name</div>' +
					'<div class="row-command row-delete"><i class="bi bi-x row-head-details"></i></div>' +
					'<div class="row-command row-edit"><i class="bi bi-three-dots-vertical row-head-details"></i></div>'
			);

		const total_row = $("<div>")
			.addClass("row row-total")
			// .attr("data-rowid", newid)
			.html("0.00");

		let interval = this.time_interval;

		let cf_html = "";
		for (let i = 0; i < this.cf_column_count; i++) {
			cf_html += '<div class="col cell"><span>0</span></div>';
		}

		const cf = $("<div>").addClass("row row-cf").html(cf_html);

		[row_head, total_row, cf].forEach((i) =>
			i.hover(
				function () {
					const row_id = parseInt($(this).attr("data-rowid"));
					const row_columns = $('.row [data-rowid="' + row_id + '"]');
					row_columns.addClass("hovered");
				},
				function (e) {
					const row_id = parseInt($(this).attr("data-rowid"));
					const row_columns = $('.row [data-rowid="' + row_id + '"]');
					row_columns.removeClass("hovered");
				}
			)
		);

		return {
			row_head: row_head,
			total_row: total_row,
			cf: cf,
		};
	}

	rowAdd(new_row) {
		this.column.row_head.append(new_row.row_head);
		this.column.total.append(new_row.total_row);
		this.column.cf.append(new_row.cf);
	}

	/**
	 * Update the data of a table row
	 * @param {Object} row object with components of a row
	 * @param {CFLine} line_data data of the cf line
	 */
	rowUpdate(row, line_data) {
		let id = line_data.id;
		let cf = line_data.getValues;
		let cf_count = cf.length;

		row.row_head.attr("data-rowid", id);
		row.total_row.attr("data-rowid", id);
		row.cf.attr("data-rowid", id);

		row.row_head.find(".row-name")[0].text = line_data.line_name;

		let cf_html = "";
		line_data.getValues(this.time_interval).forEach((element) => {
			cf_html +=
				'<div class="col cell"><span>' +
				CFXTable.numberFormatting(element) +
				"</span></div>";
		});

		row.cf[0].innerHTML = cf_html;

		return row;
	}

	// Cells interaction

	selectCell() {
		// Get row and column id
	}

	editCell() {}

	cellEvents() {
		const cells = this.column.cf.find(".cell");

		cells.click(function (e) {
			$(".cf").find(".selected").removeClass("selected");

			$(this).addClass("selected");
		});

		cells.dblclick(addInput);

		cells.keypress(function (e) {
			if (e.which == 13) {
				if (e.target.nodeName == "INPUT") deleteInput(e);
				// TO DO: enter edit mode
			}
		});

		function addInput(e) {
			//if there is already an input ignore
			if (this.firstChild.nodeName == "INPUT") return;

			var input = $("<input>", { type: "text" })
				.val($(this).find("span").text())
				.focusout(deleteInput);

			$(this).html(input);
			input.focus();
		}

		function deleteInput(elm) {
			let input = $(elm.target);
			let input_val = parseFloat(input.val().replaceAll(",", ""));
			if (!input_val) input_val = 0;
			input_val = CFXTable.numberFormatting(input_val);

			input.parent().html($("<span>").text(input_val));
		}
	}

	update() {
		let dates = this.dataset.getDates(this.time_interval);
		this.updateHeader(dates);
		this.cf_column_count = dates.length;
		let new_row = this.rowCreate();
		this.rowUpdate(new_row, this.dataset.CFlines[0]);
		this.rowAdd(new_row);
		this.cellEvents();
	}

	updateHeader(dates) {
		let headerRow = $(".column-header>.row");

		let header_content = "";

		dates.forEach((d) => {
			header_content +=
				'<div class="col date">' +
				"<span>" +
				CFDate.toString(d, "mmm yyyy") +
				"</span></div>";
		});

		headerRow.html(header_content);
	}

	updateRow(row, values) {
		let row_content = "";

		values.forEach((d) => {
			row_content +=
				'<div class="col cell">' + "<span>" + d + "</span></div>";
		});

		row.html(row_content);
	}

	static numberFormatting(n) {
		return n.toLocaleString();
	}
}
