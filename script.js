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

class CFDataSet {
	constructor(dat) {
		this.data = [];
		this.data.push(new CFLine(dat[0]));
	}
}

var testdata = [
	[
		{ date: "2023-02-23", value: -10000 },
		{ date: "2023-04-01", value: 10 },
		{ date: "2023-04-01", value: 10 },
		{ date: "2023-09-03", value: 10 },
		{ date: "2023-09-18", value: 10 },
		{ date: "2024-03-03", value: 10 },
		{ date: "2024-07-17", value: 1000 },
	],
];

/**
 * Cash flow defined by date and value
 * - Date expressed in milliseconds
 */
class CFElement {
	constructor(_date, _value) {
		this.date = _date;
		this.value = _value;
	}
}

/**
 * Dataset containing data of one line of CFs
 * The data is specified in days, months, quarters, years
 * Data is organised in arrays
 *
 *
 * Improvements:
 * - put M,Q,Y data into a map accessible with date_type
 */
class CFLine {
	constructor(_name = "Data name", data) {
		this.line_name = _name;
		this.raw_data = []; //daily
		this.EoM_data = []; // Monthly
		this.EoQ_data = []; // Quarterly
		this.EoY_data = []; // Yearly

		/** Range of data in months */
		this.range = { max: null, min: null };

		if (data) this.setData(data);
	}

	static time_interval = { day: 0, month: 1, quarter: 2, year: 3 };


	/**
	 * Adjust the range of dates based on a new date 
	 *
	 * @param {number} date expressed in millisec
	 */
	updateDateRange(date) {
		// The new date is already in the line range
		if (date >= this.range.min && date <= this.range.max) return;

		let d = new CFDate(date);
		let n = 0;

		const m = (i) => d.EoMonth(i).value;
		const q = (i) => d.EoQuarter(i).value;
		const y = (i) => d.EoYear(i).value;

		// if there is no data yet
		if (this.EoM_data.length == 0) {
			this.range.min = m(0);
			this.range.max = m(0);

			this.EoM_data.push(new CFElement(m(n), 0));
			this.EoQ_data.push(new CFElement(q(n), 0));
			this.EoY_data.push(new CFElement(y(n), 0));
		} else if (date < this.range.min) {
			this.range.min = m(0);
			n = 0;
			while (m(n) < this.EoM_data[0].date) {
				this.EoM_data.push(new CFElement(m(n), 0));
				n++;
			}
			n = 0;
			while (q(n) < this.EoQ_data[0].date) {
				this.EoQ_data.push(new CFElement(q(n), 0));
				n++;
			}

			n = 0;
			while (y(n) < this.EoY_data[0].date) {
				this.EoY_data.push(new CFElement(y(n), 0));
				n++;
			}

			// sort
			this.EoM_data.sort((a, b) => {
				a.date - b.date;
			});
			this.EoQ_data.sort((a, b) => {
				a.date - b.date;
			});
			this.EoY_data.sort((a, b) => {
				a.date - b.date;
			});
		} else {
			this.range.max = m(0);

			let new_values = [];

         // Months
			n = 0;
			while (m(n) > this.EoM_data[this.EoM_data.length - 1].date) {
				new_values.push(new CFElement(m(n), 0));
				n--;
			}
			this.EoM_data.push(...new_values);
				
         // Quarters
			n = 0;
			while (q(n) > this.EoQ_data[this.EoQ_data.length - 1].date) {
				new_values.push(new CFElement(q(n), 0));
				n--;
			}
			this.EoQ_data.push(...new_values);
				
         // Years
			n = 0;
			while (y(n) > this.EoY_data[this.EoY_data.length - 1].date) {
				new_values.push(new CFElement(y(n), 0));
				n--;
			}
			this.EoY_data.push(...new_values);


			// Sort
			this.EoM_data.sort((a, b) => {
				a.date - b.date;
			});
			this.EoQ_data.sort((a, b) => {
				a.date - b.date;
			});
			this.EoY_data.sort((a, b) => {
				a.date - b.date;
			});
		}

	}

	selectDateInterval(interval) {
		switch (interval) {
			case CFLine.time_interval.month:
				return this.EoM_date;
				break;
			case CFLine.time_interval.quarter:
				return this.EoQ_data;
				break;
			case CFLine.time_interval.year:
				return this.EoY_data;
				break;
			default:
				return this.daily_data;
				break;
		}
	}

	getValueAtDate(date, date_type) {
		let data = this.selectDateType(date_type);
		let ret_value = data.has(date);

		if (ret_value) return ret_value;
		else return 0;
	}

   /**
    * Get date range in month, quarters, years
    * @param {CFLine.time_interval} date_type frequency of data
    * @returns Array of the dates in the range of this dataset
    */
	getDates(date_type) {
		const data = this.selectDateType(date_type);
		const dates = [];

		data.forEach((e) => {
			dates.push(e);
		});

		return dates;
	}

	getValues(date_type) {
		const data = this.selectDateType(date_type);
		const dates = [];

		return [...data.keys()];
	}

	/**
	 * Insert a CF element in the dataset
	 * @param {CFElement} cf CFElement
    * @return {CFLine} this dataset
	 */
	add(cf) {
		this.raw_data.push(cf);
		this.raw_data.sort((a, b) => {
			a.date - b.date;
		});

      this.updateDateRange(cf.date);

      let idx, m, q, y;

      // Add value to monthly data
      m = (new CFDate(cf.date)).EoMonth();
      idx = this.EoM_data.indexOf(({date}) => date == m);
      if(idx != -1){
         this.EoM_data[m].value += cf.value; 
      }

      // Add value to quarterly data
      q = (new CFDate(cf.date)).EoQuarter();
      idx = this.EoQ_data.indexOf(({date}) => date == q);
      if(idx != -1){
         this.EoQ_data[q].value += cf.value; 
      }

      // Add value to yearly data
      y = (new CFDate(cf.date)).EoYear();
      idx = this.EoY_data.indexOf(({date}) => date == y);
      if(idx != -1){
         this.EoY_data[y].value += cf.value; 
      }


      return this;
	}

	setData(data) {
		this.daily_data = this.setDataFromJSON(data);
		this.EoM_data = this.aggregateMonthly();
		this.EoQ_data = this.aggregateQuarterly();
		this.EoY_ata = this.aggregateYearly();
	}

	setDataFromJSON(_data) {
		// Assumes format: [{"date":String(yyyy-mm-dd), "value":Integer}]
		let data_map = new Map();
		_data.forEach((e) => {
			let day = CFDate.parse(e.date);
			if (data_map.has(day))
				data_map.set(day, data_map.get(day) + e.value);
			else data_map.set(day, e.value);
		});
		return data_map;
	}

	aggregate(endPeriodFunc, months_interval) {
		let dates = [...this.daily_data.keys()];
		let min_date = endPeriodFunc(Math.min(...dates));
		let max_date = endPeriodFunc(Math.max(...dates));

		let dt = min_date;

		let aggregated_map = new Map();
		while (dt <= max_date) {
			aggregated_map.set(dt, 0);
			dt = new CFDate(dt).addMonths(months_interval).value;
		}

		for (const [k, v] of this.daily_data) {
			let date_updating = endPeriodFunc(k);
			aggregated_map.set(
				date_updating,
				aggregated_map.get(date_updating) + v
			);
		}

		return aggregated_map;
	}

	aggregateMonthly() {
		return this.aggregate((a) => new CFDate(a).EoMonth(), 1);
	}
	aggregateQuarterly() {
		return this.aggregate((a) => new CFDate(a).EoQuarter(), 3);
	}
	aggregateYearly() {
		return this.aggregate((a) => new CFDate(a).EoYear(), 12);
	}
}

class CFDate {
	/** Create Date from milliseconds */
	constructor(value) {
		this.date_obj = new Date(value);
		this.value = this.date_obj.getTime();
	}

	/** Parses from format yyyy-mm-dd */
	static parse(val) {
		let d = new Date(val);
		return d.getTime();
	}

	addMonths(n = 0) {
		let month = this.date_obj.getMonth() + n;
		let year = this.date_obj.getFullYear();
		let new_date = new Date(year, month + 1, 0).getTime();
		return new CFDate(new_date);
	}

	/** Converts number of days since epoch to a JS Date and milliseconds */
	// static dateFromExcel(val){
	//    let zero = new Date(1970,0,0);
	//    let d = new Date(zero.setDate(+val-1))
	//    return d.getTime();
	// }

	EoMonth(n = 0) {
		let month = this.date_obj.getMonth() + n;
		let year = this.date_obj.getFullYear();
		let new_date = new Date(year, month + 1, 0).getTime();
		return new CFDate(new_date);
	}

	EoQuarter(n = 0) {
		let new_date = this.EoMonth(n * 3);
		let month = [2, 2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11][
			new_date.date_obj.getMonth()
		];
		let year = new_date.date_obj.getFullYear();

		let ret = new Date(year, month + 1, 0).getTime();
		return new CFDate(ret);
	}

	EoYear(n = 0) {
		let year = this.date_obj.getFullYear() + n;
		let new_date = new Date(year, 12, 0).getTime();
		return new CFDate(new_date);
	}
}
