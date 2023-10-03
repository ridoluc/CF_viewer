import { CFDate } from "./CFDate";
import { CFElement } from "./Element";
import { CFLine } from "./Line";

export class CFDataSet {
	constructor() {
		this.idCounter = 0;
		this.CFlines = [];
		this.datesRange = { max: null, min: null };
		this.setName = "";
	}

	/**
	 * Calculates an array of date values in milliseconds based on a specified time interval.
	 *
	 * @param {CFDate.time_interval} time_interval The interval time of the cash flows.
	 * @returns {Array<number>|null} An array of date values in milliseconds, or null if no cash flows are available.
	 * @throws {Error} Throws an error if the dates range is null.
	 */
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
			style:line.style,
			values: line.getValues(
				new CFDate(this.datesRange.min),
				new CFDate(this.datesRange.max),
				time_interval
			),
		};
	}

	addLine(name, data, style) {
		let new_line = new CFLine(this.idCounter++, name, data, style);
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

	setLineData(line_id, data) {
		const line = this.getLine(line_id);

		// Loop through the updates object and apply changes
		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				line[key] = data[key];
			}
		}
	}

	setCellValue(row_id, col, time_interval, new_period_value){
		const line = this.getLine(row_id);

		const old_period_value = line.getValueAtDate(new CFDate(col),time_interval);

		// Search if the date has associated raw data 
		const raw_value = line.raw_data.find((entry) => entry.date === col);

		if(raw_value){
			raw_value.value = new_period_value - (old_period_value - raw_value.value);
		}
		else{
			const new_date_value = new_period_value - old_period_value;

			line.add(new CFElement(col, new_date_value));
		}

	}

}
