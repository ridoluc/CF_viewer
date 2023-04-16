let Table;

$(document).ready(function () {
	Table = new CFXTable();
	Table.addRow();
	scrollbar = new Scrollbar(
		document.getElementById("scroll-wrapper"),
		document.getElementsByClassName("cf")[0]
	);
	scrollbar.setCursorWidth(Table.column.cf.width());
});

class CFXTable {
	constructor() {
		this._table = $("#CFXTable");
		this.id_counter = 0;
		this.table_id_list = [];

		this.column = {
			row_head: $(".row-head"),
			total: $(".total-column"),
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

	createID() {
		return this.id_counter++;
	}

	addRow() {
		const newid = this.createID();
		this.table_id_list.push(newid);

		const row_head = $("<div>")
			.addClass("row")
			.attr("data-rowid", newid)
			.html(
				'<div class="row-start-cell">' +
					'<div class="row-select"></div>' +
					'<div class="add-row" onclick="Table.addRow()"></div>' +
					"</div>" +
					'<div class="row-name">New Row</div>' +
					'<div class="row-command row-delete"><i class="bi bi-x row-head-details"></i></div>' +
					'<div class="row-command row-edit"><i class="bi bi-three-dots-vertical row-head-details"></i></div>'
			);

		const total_row = $("<div>")
			.addClass("row")
			.addClass("total-row")
			.attr("data-rowid", newid)
			.html("0.00");

		const cf = $("<div>")
			.addClass("row")
			.attr("data-rowid", newid)
			.html(
				'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>' +
					'<div class="col cell"><span>0.00</span></div>'
			);

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

		this.column.row_head.append(row_head);
		this.column.total.append(total_row);
		this.column.cf.append(cf);

		// this.column.forEach(x => x.mouseenter)

		this.cellEvents();
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

		cells.keypress(function(e){
			if(e.which == 13){
				if(e.target.nodeName == "INPUT")	deleteInput(e);
				// TO DO: enter edit mode
			}
		});


		function addInput(e){
			var input = $("<input>", { type: "text" }).val(
				$(this).find("span").html()
			)
			.focusout(deleteInput);

			$(this).html(input);
			input.focus();
		};

		function deleteInput(elm){
			let input = $(elm.target);
			let value = input.val() =='' ? '0':input.val();
			input.parent().html($("<span>").text(value));
		};


	}
}
