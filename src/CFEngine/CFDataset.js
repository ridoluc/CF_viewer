import { CFDate } from "./CFDate";
import { CFElement } from "./Element";
import { CFLine } from "./Line";


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

	getLineData(id){

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
