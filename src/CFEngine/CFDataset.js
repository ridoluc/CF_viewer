import { CFDate } from "./CFDate";

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

export class CFDataSet {
	constructor() {
		this.idCounter = 0;
		this.CFlines = [];
		this.datesRange = { max: null, min: null };
	}

	getDates(time_interval) {
		if (this.CFlines.length > 0)
			return this.CFlines[0].getDates(time_interval);
		else return null;
	}

	getLine(id) {
		return this.CFlines.find((e) => e.id == id);
	}

	addLine(name, data) {
		let new_line = new CFLine(this.idCounter++, name, data);
		this.CFlines.push(new_line);
		this.updateDatesRange();

		return new_line;
	}

	removeLine(id) {
		let idx = this.CFlines.indexOf((e) => (e.id = id));
		this.CFlines.splice(idx, 1);
	}

	/**
	 * Updates the range of dates for each line
	 */
	updateDatesRange() {
		let min, max;

		// Find Min
		this.CFlines.forEach((line) => {
			if (line.range.min != null && (min == null || line.range.min < min))
				min = line.range.min;
		});

		// Find Max
		this.CFlines.forEach((line) => {
			if (max == null || line.range.max > max) max = line.range.max;
		});

		this.datesRange.max = max;
		this.datesRange.min = min;

		// Update all
		this.CFlines.forEach((line) => {
			line.updateDateRange(max);
			line.updateDateRange(min);
		});
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
	static time_interval = { day: 0, month: 1, quarter: 2, year: 3 };

	constructor(_id = 0, _name = "Data name", data = null) {
		this.id = _id;
		this.line_name = _name;
		this.raw_data = []; //daily
		this.EoM_data = []; // Monthly
		this.EoQ_data = []; // Quarterly
		this.EoY_data = []; // Yearly

		/** Range of dates (end of months) expressed in millisec */
		this.range = { max: null, min: null };

		if (data) this.setDataFromJSON(data);
	}

	/**
	 * Adjust the range of dates based on a new date
	 *
	 * @param {number} date expressed in millisec
	 * @returns Object {max:number, min:number} range of dates in the dataset
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

		return this.range;
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
		const dates = data.map((e) => e.date);

		return dates;
	}

	getValues(time_interval) {
		const data = this.selectDateInterval(time_interval);
		const values = data.map((e) => e.value);

		return values;
	}

	getLineData(time_interval) {
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
		m = new CFDate(cf.date).EoMonth().value;
		idx = this.EoM_data.findIndex((e) => e.date == m);
		if (idx != -1) {
			this.EoM_data[idx].value += cf.value;
		} else throw "monthly array missing date";

		// Add value to quarterly data
		q = new CFDate(cf.date).EoQuarter().value;
		idx = this.EoQ_data.findIndex((e) => e.date == q);
		if (idx != -1) {
			this.EoQ_data[idx].value += cf.value;
		} else throw "quarterly array missing date";

		// Add value to yearly data
		y = new CFDate(cf.date).EoYear().value;
		idx = this.EoY_data.findIndex((e) => e.date == y);
		if (idx != -1) {
			this.EoY_data[idx].value += cf.value;
		} else throw "yearly array missing date";

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

	/*	aggregate(endPeriodFunc, months_interval) {
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
*/
}
