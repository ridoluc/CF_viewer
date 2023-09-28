import { CFDate } from "./CFDate";
import { CFLine } from "./Line";

export class CFDataSet {
	constructor() {
		this.idCounter = 0;
		this.CFlines = [];
		this.datesRange = { max: null, min: null };
	}

	getDates(time_interval) {
		if (this.CFlines.length == 0) return null;

		const dates = [];

		if (this.datesRange.min == null || this.datesRange.max == null)
			throw new Error("Dates range is null");

		let currentDate = new CFDate(this.datesRange.min);
		currentDate = currentDate.EoPeriod(time_interval, 0);
		let stopDate = new CFDate(this.datesRange.max);
		stopDate = stopDate.EoPeriod(time_interval, 0);

		while (currentDate.value <= stopDate.value) {
			dates.push(currentDate.value);
			currentDate = currentDate.EoPeriod(time_interval, 1);
		}

		return dates;
	}

	getLine(id) {
		return this.CFlines.find((e) => e.id == id);
	}

	getLineData(id, time_interval) {
		let line = this.getLine(id); //<<------- this is WRONG. update with proper positioning

		return {
			id: line.id,
			name: line.line_name,
			values: line.getValues(
				new CFDate(this.datesRange.min),
				new CFDate(this.datesRange.max),
				time_interval
			),
		};
	}

	addLine(name, data) {
		let new_line = new CFLine(this.idCounter++, name, data);
		this.CFlines.push(new_line);
		this.updateDatesRange();

		return new_line;
	}

	removeLine(id) {
		let idx = this.CFlines.findIndex((e) => e.id === id);
		if (idx !== -1) {
			this.CFlines.splice(idx, 1);
		}
	}

	/**
	 * Updates the range of dates for each line
	 */
	updateDatesRange() {
		let min = this.datesRange.min;
		let max = this.datesRange.max;

		// Find Min and max
		this.CFlines.forEach((line) => {
			const line_date_range = line.findMinMaxDates();
			if (
				line_date_range.minDate != null &&
				(min == null || line_date_range.minDate < min)
			) {
				min = line_date_range.minDate;
			}

			if (
				line_date_range.maxDate != null &&
				(max == null || line_date_range.maxDate > max)
			) {
				max = line_date_range.maxDate;
			}
		});

		this.datesRange.max = max;
		this.datesRange.min = min;
	}
}
