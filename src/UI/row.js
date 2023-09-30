/**
 * Creates and configures a row in a tabular interface with interactive elements.
 *
 * @param {number} row_id - The unique identifier for the row.
 * @param {function} addRowHandler - The event handler function for adding a new row.
 * @param {function} rowDeleteHandler - The event handler function for deleting the row.
 * @returns {Object} An object containing references to the created row elements: row_head and cf.
 */
function rowCreate(row_id, addRowHandler, rowDeleteHandler) {
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
	  const row_columns = $('.row [data-rowid="' + row_id + '"]');
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
	  rowDeleteHandler(row_id);
	});
 
	// Click event for adding a row
	row_head.find(".add-row").on("click", (event) => {
	  addRowHandler();
	});
 
	return {
	  row_head: row_head,
	  cf: cf,
	};
 }