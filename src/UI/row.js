import { numberFormatting } from "./utils";

/**
 * Creates and configures a row in a tabular interface with interactive elements.
 *
 * @param {number} row_id - The unique identifier for the row.
 * @param {function} addRowHandler - The event handler function for adding a new row.
 * @param {function} rowDeleteHandler - The event handler function for deleting the row.
 * @returns {Object} An object containing references to the created row elements: row_head and cf.
 */
export function rowCreate(row_id, context) {
	// Create row head element
	const row_head = $("<div>")
	  .addClass("row")
	  .attr("data-rowid", row_id)
	  .html(`
		 <div class="row-start-cell">
			<div class="row-select"></div>
			<!-- <div class="add-row"></div> -->
		 </div>
		 <div class="row-name editable"><span>Line Name</span></div>
		 <div class="row-command row-delete"><i class="bi bi-x row-head-details"></i></div>
		 <div class="row-command row-edit"><i class="bi bi-three-dots-vertical row-head-details"></i></div>
		 <div class="total"><span>0</span></div>
	  `);
 
	// Create cf element
	const cf = $("<div>").addClass("row row-cf").attr("data-rowid", row_id);
 
	// Hover effect handlers
	const hoverInHandler = function () {
	  const row_id = parseInt($(this).attr("data-rowid"));
	  const row_columns = $('.row[data-rowid="' + row_id + '"]');
	  row_columns.addClass("hovered");
	};
 
	const hoverOutHandler = function () {
	  const row_id = parseInt($(this).attr("data-rowid"));
	  const row_columns = $('.row [data-rowid="' + row_id + '"]');
	  row_columns.removeClass("hovered");
	};
 
	[row_head, cf].forEach((i) => i.hover(hoverInHandler, hoverOutHandler));
 
	// Click event for row delete
	row_head.find(".row-delete").on("click", (event) => {
	  const row_id = parseInt($(event.currentTarget).parent().attr("data-rowid"));
	  context.rowDelete(row_id);
	});
 
	// Click event for adding a row
	row_head.find(".add-row").on("click", (event) => {
	  context.addRow();
	});
 
	return {
	  row_head: row_head,
	  cf: cf,
	};
 }



/**
 * Update the data of a table row
 * @param {Object} row object with components of a row
 * @param {CFLine} line_data data of the cf line
 */
export function updateRow(row, line_data, dates) {
	row.row_head.attr("data-rowid", line_data.id);
	row.cf.attr("data-rowid", line_data.id);

	row.row_head.find(".row-name").text(line_data.name);

	let cf_list = []
	for(let i = 0; i < line_data.values.length; i++){
		let value = line_data.values[i];
		const div = document.createElement('div');
		div.classList.add('col', 'cell');

		div.setAttribute("data-rowid", line_data.id);
		div.setAttribute("data-columnid", dates[i]);


		const span = document.createElement('span');
		span.textContent = numberFormatting(value);
		if(value<0) span.classList.add('negative-number');
		
		div.appendChild(span);
		cf_list.push(div);
	 }

	row.cf[0].replaceChildren(...cf_list);

	return row;
}
