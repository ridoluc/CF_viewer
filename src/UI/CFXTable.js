import { CFDataSet } from "../CFEngine/CFDataset.js";
import { CFDate } from "../CFEngine/CFDate.js";
import { updateHeader } from "./header.js";
import { Scrollbar } from "./scrollbar.js";

import { rowCreate } from "./row.js";
import "./table_style.scss";

export class CFXTable {
	constructor() {
		this._table = $("#CFXTable");
		this.dataset = new CFDataSet();

		this.time_interval = CFDate.time_interval.month;
		// this.d_start = new CFDate(CFDate.parse("2023-01-05"));
		// this.dataset.datesRange.max = CFDate.parse("2027-11-12");

		this.column = {
			row_head: $(".row-head"),
			cf: $(".cf"),
		};

		this.commands_panel = document.getElementById("command-panel");
		this.commands_panel.addEventListener("click", (event) => {
			this.commandsEventsHandler(event);
		});



		this.scrollbar;
	}

	create() {
		// Update CF
		for (const line of this.dataset.CFlines) {
			let new_row = this.rowCreate(line.id);

			this.column.row_head.append(new_row.row_head);
			this.column.cf.append(new_row.cf);
		}


		this.scrollbar = new Scrollbar(
			document.getElementById("scroll-wrapper"),
			document.getElementsByClassName("cf")[0]
		);

		this.update();


	}

	update() {
		// Recalculate Dataset
		// TO DO

		// Update Header
		let dates = this.dataset.getDates(this.time_interval);
		updateHeader(dates,this.time_interval);

		// Update CF
		for (const line of this.dataset.CFlines) {
			let row = this.rowSelect(line.id);
			let lineData = this.dataset.getLineData(
				line.id,
				this.time_interval
			);
			updateRow(row, lineData);
		}

		// Update Totals
		// To DO

		// Attach events
		this.attachEvents();

		// Adjust scollbar
		this.scrollbar.setCursorWidth();

	}

	rowSelect(id) {
		return {
			row_head: $('.row-head .row[data-rowid="' + id + '"]'),
			cf: $('.row.row-cf[data-rowid="' + id + '"]'),
		};
	}

	getRowByPosition(position) {
		return {
			row_head: $(".row-head")[position],
			cf: $(".cf")[position],
		};
	}

	addRow() {
		let last_line = this.dataset.addLine("New Row Name", null);

		// this.rowAdd(last_line);

		let new_row = this.rowCreate(last_line.id);

		this.column.row_head.append(new_row.row_head);
		this.column.cf.append(new_row.cf);

		this.update();
	}

	rowDelete(id) {
		let row = this.rowSelect(id);
		row.cf.remove();
		row.row_head.remove();
		this.dataset.removeLine(id);

		this.update();
	}

	attachEvents() {
		const cells = this.column.cf.find(".cell");
		const editable = this.column.row_head.find(".editable");

		cells.click(function (e) {
			$(".cf").find(".selected").removeClass("selected");

			$(this).addClass("selected");
		});

		cells.dblclick(addInput);

		editable.dblclick(addInput);

		editable.keypress(function (e) {
			if (e.which == 13) {
				if (e.target.nodeName == "INPUT") deleteInput(e);
			}
		});

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
			let input_val;
			if (
				input[0].parentNode &&
				input[0].parentNode.classList.contains("editable")
			) {
				input_val = input.val() ? input.val() : "Name";

				// let row_id = parseInt(input[0].parentNode.parentNode.getAttribute('data-rowid'));
				// this.dataset.setLineData(row_id,{line_name:input_val});
			} else {
				input_val = parseFloat(input.val().replaceAll(",", ""));
				if (!input_val) input_val = 0;
				input_val = CFXTable.numberFormatting(input_val);
			}
			input.parent().html($("<span>").text(input_val));
		}
	}

	static numberFormatting(n) {
		if (n == 0) return "-";
		return n.toLocaleString();
	}

	rowCreate(row_id) {
		const row_head = $("<div>")
			.addClass("row")
			.attr("data-rowid", row_id)
			.html(
				'<div class="row-start-cell">' +
					'<div class="row-select"></div>' +
					'<!-- <div class="add-row"></div> -->' +
					"</div>" +
					'<div class="row-name editable"><span>Line Name</span></div>' +
					'<div class="row-command row-delete" ><i class="bi bi-x row-head-details"></i></div>' +
					'<div class="row-command row-edit"><i class="bi bi-three-dots-vertical row-head-details"></i></div>' +
					'<div class="total"><span>0</span></div>'
			);

		const cf = $("<div>").addClass("row row-cf").attr("data-rowid", row_id);

		[row_head, cf].forEach((i) =>
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

		row_head.find(".row-delete").on("click", (event) => {
			const row_id = parseInt(
				$(event.currentTarget.parentNode).attr("data-rowid")
			);
			this.rowDelete(row_id);
		});

		row_head.find(".add-row").on("click", (event) => {
			this.addRow();
		});

		return {
			row_head: row_head,
			cf: cf,
		};
	}

	commandsEventsHandler(event) {
		// Check if the clicked element has a "data-command" attribute

		const clickedElement = event.target.closest('[data-command]');

		if (!clickedElement) return;

		const action = clickedElement.getAttribute("data-command");

		if (action !== null) {
			// The clicked element has a data-action attribute
			// Perform your desired action based on the data attribute value
			switch (action) {
				case "month":
					console.log("month");
					if(this.time_interval == CFDate.time_interval.month) return;
					this.time_interval = CFDate.time_interval.month
					break;

				case "quarter":
					console.log("quarter");
					if(this.time_interval == CFDate.time_interval.quarter) return;
					this.time_interval = CFDate.time_interval.quarter
					break;
				
				case "year":
					console.log("year");
					if(this.time_interval == CFDate.time_interval.year) return;
					this.time_interval = CFDate.time_interval.year
					break;

				case "scrollbar":
					console.log("scrollbar");
					const scrollbar_container = document.getElementById('scroll-section');
					scrollbar_container.classList.toggle('hidden');
					// scrollbar_container.style.toggle('hidden');
					break;

				case "chart":
					console.log("chart");
				
					break;

				case "add-line":
					console.log("add line");
					this.addRow()
					break
				
				default:
					
					break;
			}

			this.update();
		}
	}
}

/**
 * Update the data of a table row
 * @param {Object} row object with components of a row
 * @param {CFLine} line_data data of the cf line
 */
function updateRow(row, line_data) {
	row.row_head.attr("data-rowid", line_data.id);
	row.cf.attr("data-rowid", line_data.id);

	row.row_head.find(".row-name").text(line_data.name);

	let cf_list = []
	line_data.values.forEach((value) => {
		const div = document.createElement('div');
		div.classList.add('col', 'cell');
		
		const span = document.createElement('span');
		span.textContent = CFXTable.numberFormatting(value);
		if(value<0) span.classList.add('negative-number');
		
		div.appendChild(span);
		cf_list.push(div);
	 });

	row.cf[0].replaceChildren(...cf_list);

	return row;
}
