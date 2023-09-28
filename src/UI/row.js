

/**
	 * create the visual representation of the CF line
	 * @returns {Object} obj containg the row head, total, cf
	 */
// export function rowCreate(row_id) {

//    const row_head = $("<div>")
//       .addClass("row")
//       .attr("data-rowid", row_id)
//       .html(
//          '<div class="row-start-cell">' +
//             '<div class="row-select"></div>' +
//             '<div class="add-row"></div>' +
//             "</div>" +
//             '<div class="row-name">Line Name</div>' +
//             '<div class="row-command row-delete" ><i class="bi bi-x row-head-details"></i></div>' +
//             '<div class="row-command row-edit"><i class="bi bi-three-dots-vertical row-head-details"></i></div>'+
//             '<div class="total"><span>0</span></div>'
//       );





//    const cf = $("<div>").addClass("row row-cf").attr("data-rowid", row_id);

//    [row_head, cf].forEach((i) =>
//       i.hover(
//          function () {
//             const row_id = parseInt($(this).attr("data-rowid"));
//             const row_columns = $('.row [data-rowid="' + row_id + '"]');
//             row_columns.addClass("hovered");
//          },
//          function (e) {
//             const row_id = parseInt($(this).attr("data-rowid"));
//             const row_columns = $('.row [data-rowid="' + row_id + '"]');
//             row_columns.removeClass("hovered");
//          }
//       )
//    );

//    return {
//       row_head: row_head,
//       cf: cf,
//    };
// }



