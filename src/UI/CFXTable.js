import { CFDataSet } from "../CFEngine/CFDataset.js";
import { CFLine } from "../CFEngine/Line.js";
import { CFDate } from "../CFEngine/CFDate.js";
import { updateHeader } from "./header.js";
import "./table_style.scss"

export class CFXTable {
	constructor() {
		this._table = $("#CFXTable");
		this.dataset = new CFDataSet();
		this.id_counter = 0;

		this.time_interval = CFDate.time_interval.quarter;
		// this.d_start = new CFDate(CFDate.parse("2023-01-05"));
		// this.dataset.datesRange.max = CFDate.parse("2027-11-12");

		this.cf_column_count;

		this.column = {
			row_head: $(".row-head"),
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
			.addClass("row")
			// .attr("data-rowid", newid)
			.html(
				'<div class="row-start-cell">' +
					'<div class="row-select"></div>' +
					'<div class="add-row"></div>' +
					"</div>" +
					'<div class="row-name">Line Name</div>' +
					'<div class="row-command row-delete" ><i class="bi bi-x row-head-details"></i></div>' +
					'<div class="row-command row-edit"><i class="bi bi-three-dots-vertical row-head-details"></i></div>'+
               '<div class="total"><span>0</span></div>'
			);

		row_head.find(".row-delete")[0].addEventListener("click", (event) => {
			const row_id = parseInt(
				$(event.currentTarget.parentNode).attr("data-rowid")
			);
			this.rowDelete(row_id);
		});

		row_head.find(".add-row")[0].addEventListener("click", (event) => {
			this.rowNew();
		});


		let cf_html = "";
		for (let i = 0; i < this.cf_column_count; i++) {
			cf_html += '<div class="col cell"><span>0</span></div>';
		}

		const cf = $("<div>").addClass("row row-cf").html(cf_html);

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

		return {
			row_head: row_head,
			cf: cf,
		};
	}

	rowAdd(line_data) {
		let new_row = this.rowCreate();
		this.rowUpdate(new_row, line_data);

		this.column.row_head.append(new_row.row_head);
		this.column.cf.append(new_row.cf);
	}

	rowNew() {
		let last_line = this.dataset.addLine("New Row Name", null);
		this.rowAdd(last_line);

		this.cellEvents();
	}

	/**
	 * Update the data of a table row
	 * @param {Object} row object with components of a row
	 * @param {CFLine} line_data data of the cf line
	 */
	rowUpdate(row, line_data) {
		let id = line_data.id;

		row.row_head.attr("data-rowid", id);
		row.cf.attr("data-rowid", id);

		row.row_head.find(".row-name").text(line_data.line_name);

		let cf_html = "";
		line_data
			.getValues(
				new CFDate(this.dataset.datesRange.min),
				new CFDate(this.dataset.datesRange.max),
				this.time_interval
			)
			.forEach((element) => {
				cf_html +=
					'<div class="col cell"><span>' +
					CFXTable.numberFormatting(element) +
					"</span></div>";
			});

		row.cf[0].innerHTML = cf_html;

		return row;
	}

	rowDelete(id) {
		this.rowSelect(id).remove();
		this.dataset.removeLine(id);
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
		updateHeader(dates);
		this.cf_column_count = dates.length;

		for (const i of this.dataset.CFlines) {
			this.rowAdd(i);
		}

		this.cellEvents();
	}



	static numberFormatting(n) {
		return n.toLocaleString();
	}
}
