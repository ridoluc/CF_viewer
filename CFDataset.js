
class CFDataSet {
	constructor(dat) {
		this.data = [];
		this.data.push(new CFLine(dat[0]));
	}
}


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
export class CFLine {
	constructor(_name = "Data name", data) {
		this.line_name = _name;
		this.raw_data = []; //daily
		this.EoM_data = []; // Monthly
		this.EoQ_data = []; // Quarterly
		this.EoY_data = []; // Yearly

		/** Range of dates (end of months) expressed in millisec */
		this.range = { max: null, min: null };

		if (data) this.setDataFromJSON(data);
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
		} 
      // new date less than earliest date in the range
      else if (date < this.range.min) {
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
			this.EoM_data.sort((a, b) => a.date - b.date);
			
         this.EoQ_data.sort((a, b) => a.date - b.date);
			
         this.EoY_data.sort((a, b) => a.date - b.date);


		} 
      // the new date is larger than latest date in the array
      else {
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
         new_values = [];

			while (q(n) > this.EoQ_data[this.EoQ_data.length - 1].date) {
				new_values.push(new CFElement(q(n), 0));
				n--;
			}
			this.EoQ_data.push(...new_values);
				
         // Years
			n = 0;
         new_values = [];
         
			while (y(n) > this.EoY_data[this.EoY_data.length - 1].date) {
				new_values.push(new CFElement(y(n), 0));
				n--;
			}
			this.EoY_data.push(...new_values);


			// Sort
			this.EoM_data.sort((a, b) => a.date - b.date);
			
         this.EoQ_data.sort((a, b) => a.date - b.date);
			
         this.EoY_data.sort((a, b) => a.date - b.date);
		}

	}

	selectDateInterval(interval) {
		switch (interval) {
			case CFLine.time_interval.month:
				return this.EoM_data;
				break;
			case CFLine.time_interval.quarter:
				return this.EoQ_data;
				break;
			case CFLine.time_interval.year:
				return this.EoY_data;
				break;
			default:
				return this.raw_data;
				break;
		}
	}

	getValueAtDate(date, time_interval) {
		let data = this.selectDateInterval(time_interval);
		let ret_value = data.has(date);

		if (ret_value) return ret_value;
		else return 0;
	}

   /**
    * Get date range in month, quarters, years
    * @param {CFLine.time_interval} date_type frequency of data
    * @returns Array of the dates in the range of this dataset
    */
	getDates(time_interval) {
		const data = this.selectDateInterval(time_interval);
		const dates = data.map(e => e.date);

		return dates;
	}

	getValues(time_interval) {
		const data = this.selectDateInterval(time_interval);
		const values = data.map(e => e.value);

		return values;
	}

   getLineData(time_interval){
		const data = this.selectDateInterval(time_interval);
      return data;
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
      m = (new CFDate(cf.date)).EoMonth().value;
      idx = this.EoM_data.findIndex(e => e.date == m);
      if(idx != -1){
         this.EoM_data[idx].value += cf.value; 
      } else throw 'monthly array missing date'

      // Add value to quarterly data
      q = (new CFDate(cf.date)).EoQuarter().value;
      idx = this.EoQ_data.findIndex(e => e.date == q);
      if(idx != -1){
         this.EoQ_data[idx].value += cf.value; 
      } else throw 'quarterly array missing date'

      // Add value to yearly data
      y = (new CFDate(cf.date)).EoYear().value;
      idx = this.EoY_data.findIndex(e => e.date == y);
      if(idx != -1){
         this.EoY_data[idx].value += cf.value; 
      } else throw 'yearly array missing date'


      return this;
	}

	/**
	 * Fill the CFLine dataset with data from json object 
	 * @param {object} _data Assumes format: [{"date":String(yyyy-mm-dd), "value":Integer}]
	 * @returns this
	 */
	setDataFromJSON(_data) {
		_data.forEach((e) => {
			let day = CFDate.parse(e.date);
			let value = e.value;
			
			this.add(new CFElement(day, value));
		});
		return this;
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

export class CFDate {
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

   static toString(value, format = 'dd/mm/yyyy'){
      let dt = new Date(value);
      let date = dt.getDate();
      let month_numb = dt.getMonth();
      let month = ['January','February','March','April','June','July','August','September','October','November','December'][month_numb];
      let year = dt.getFullYear();

      switch (format) {
         case 'yyyy':
            return ''+ year;
         case 'mmm yyyy':
            return month.slice(0,2) + ' ' + year;
         case 'mm/yyyy':
            return   ('0'+(month_numb+1)).slice(-2) +'/'
                     + year;
         default:
            return   ('0'+date).slice(-2) +'/'
                     +('0'+(month_numb+1)).slice(-2)+'/'
                     +year;
      }
   }
}


