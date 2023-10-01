import { CFDataSet } from "../CFEngine/CFDataset.js";
import { CFDate } from "../CFEngine/CFDate.js";
import { updateHeader } from "./header.js";
import { Scrollbar } from "./scrollbar.js";
import { numberFormatting } from "./utils.js";

import { rowCreate, updateRow } from "./row.js";
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
			let new_row = rowCreate(line.id, this);

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
		updateHeader(dates, this.time_interval);

		// Update CF
		for (const line of this.dataset.CFlines) {
			let row = this.rowSelect(line.id);
			let lineData = this.dataset.getLineData(
				line.id,
				this.time_interval
			);
			updateRow(row, lineData, dates);
		}

		// Update Totals
		this.updateTotals();

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

		let new_row = rowCreate(last_line.id, this);

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

		cells.dblclick((e) => {
			addInput(e, this);
		});

		editable.dblclick((e) => {
			addInput(e, this);
		});

		editable.keypress((e) => {
			if (e.which == 13) {
				if (e.target.nodeName == "INPUT") deleteInput(e, this);
			}
		});

		cells.keypress((e) => {
			if (e.which == 13) {
				if (e.target.nodeName == "INPUT") deleteInput(e, this);
				// TO DO: enter edit mode
			}
		});

		function addInput(e, context) {
			const cell = e.currentTarget;

			//if there is already an input ignore
			if (cell.firstChild.nodeName == "INPUT") return;

			var input = $("<input>", { type: "text" })
				.val(cell.textContent)
				.focusout(() => deleteInput(e, context));

			$(cell).html(input);
			input.focus();
		}

		function deleteInput(elm, context) {

			const edit_cell = elm.currentTarget;
			let input = $(edit_cell).find("input")[0];

			if(!input) return;
			$(input).off("focusout");
			
			let input_val;

			let row_id, col_id;

			const span = document.createElement("span");

				if (edit_cell.classList.contains("editable")) {
					if (edit_cell.parentNode)
						row_id = parseInt(
							edit_cell.parentNode.getAttribute("data-rowid")
						);

					input_val = input.value ? input.value : "Name";
					span.textContent = input_val;

					context.dataset.setLineData(row_id, {
						line_name: input_val,
					});
				} else {
					if (edit_cell.parentNode){

					
						row_id = parseInt(
							edit_cell.parentNode.getAttribute("data-rowid")
						);
						
						col_id = parseInt(
							edit_cell.getAttribute("data-columnid")
						);
					}

					input_val = parseFloat(input.value.replaceAll(",", ""));
					if (!input_val) input_val = 0;

					context.dataset.setCellValue(row_id, col_id, context.time_interval, input_val );

					span.textContent = numberFormatting(input_val);
					if (input_val < 0) span.classList.add("negative-number");
				}

				edit_cell.innerHTML = '';
				edit_cell.appendChild(span);

				context.update();
		}
	}

	commandsEventsHandler(event) {
		// Check if the clicked element has a "data-command" attribute

		const clickedElement = event.target.closest("[data-command]");

		if (!clickedElement) return;

		const action = clickedElement.getAttribute("data-command");

		if (action !== null) {
			// The clicked element has a data-action attribute
			// Perform your desired action based on the data attribute value
			switch (action) {
				case "month":
					console.log("month");
					if (this.time_interval == CFDate.time_interval.month)
						return;
					this.time_interval = CFDate.time_interval.month;
					break;

				case "quarter":
					console.log("quarter");
					if (this.time_interval == CFDate.time_interval.quarter)
						return;
					this.time_interval = CFDate.time_interval.quarter;
					break;

				case "year":
					console.log("year");
					if (this.time_interval == CFDate.time_interval.year) return;
					this.time_interval = CFDate.time_interval.year;
					break;

				case "scrollbar":
					console.log("scrollbar");
					const scrollbar_container =
						document.getElementById("scroll-section");
					scrollbar_container.classList.toggle("hidden");
					// scrollbar_container.style.toggle('hidden');
					break;

				case "chart":
					console.log("chart");

					break;

				case "add-line":
					console.log("add line");
					this.addRow();
					break;

				default:
					break;
			}

			this.update();
		}
	}

	/**
	 * Update the "total" div for each row in a tabular interface based on a calculation function.
	 *
	 * @param {function} calculateTotal - A function that calculates the total value based on a given row_id.
	 */
	updateTotals() {
		// Select all rows with the "row" class
		const rows = document.querySelectorAll(".row-head .row");

		// Iterate through each row and update the "total" div
		rows.forEach((row) => {
			// Get the row_id from the "data-rowid" attribute
			const row_id = parseInt(row.getAttribute("data-rowid"));

			// Find the "total" div within the current row
			const totalDiv = row.querySelector(".total");

			// Update the content of the "total" div with the calculated total
			const value = this.dataset.getLine(row_id).calculateTotal();

			const span = document.createElement("span");
			span.textContent = numberFormatting(value);
			if (value < 0) span.classList.add("negative-number");
			totalDiv.replaceChildren(span);
		});
	}
}
