import { CFDate } from "./CFDate";
import { CFElement } from "./Element";
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
	 * Calculate the cash flows for the line within a specified time interval.
	 *
	 * @param {CFDate} dateStart - The start date.
	 * @param {CFDate} dateEnd - The end date.
	 * @param {CFLine.time_interval} interval - The time interval: CFLine.time_interval.month, CFLine.time_interval.quarter, or CFLine.time_interval.year.
	 *
	 * @returns {Array<number>} - An array of cash flows within the specified interval.
	 */
	getValues(dateStart, dateEnd, interval) {
		const lineData = [];

		if (dateStart.value > dateEnd.value)
			throw new Error("Invalid date interval");

		let dateStart_eop = dateStart.EoPeriod(interval);
		let dateEnd_eop = dateEnd.EoPeriod(interval);

		// Iterate through dates in the specified range
		let currentDate = dateStart_eop;

		while (currentDate.value <= dateEnd_eop.value) {
			const cf_value = this.getValueAtDate(currentDate, interval);
			lineData.push(cf_value);

			currentDate = currentDate.EoPeriod(interval, 1);
		}

		return lineData;
	}

	/**
	 * Returns the value for a specific date
	 * @param {CFDate} date the date
	 * @param {CFDate.time_interval} interval either month, quarter or year
	 * @returns {number} Computed value for this date and time interval
	 */
	getValueAtDate(date, interval) {
		// this should evaluate a function or return a value
		// To be implemented

		let period_end = date.EoPeriod(interval, 0);
		let period_start = date.EoPeriod(interval, -1);

		let aggregatedValue = 0;

		for (let i = 0; i < this.raw_data.length; i++) {
			const dataPoint = this.raw_data[i];
			if (
				dataPoint.date > period_start.value &&
				dataPoint.date < period_end.value
			) {
				aggregatedValue += dataPoint.value;
			}
		}

		return aggregatedValue;
	}

	/**
	 * Sorts an array of CFElement objects by their date property and returns the sorted date values.
	 *
	 * @returns {Date[]} - An array containing the date values sorted in ascending order.
	 */
	getRawDataDates() {
		// Custom comparison function to sort by date
		function compareDates(a, b) {
			return a.date - b.date;
		}

		// Clone the array to avoid modifying the original array
		const clonedElements = [...this.raw_data];

		// Sort the cloned array by date
		clonedElements.sort(compareDates);

		// Extract and return sorted date values
		return clonedElements.map((cfElement) => cfElement.date);
	}

	/**
	 * Finds the minimum and maximum date values in an array of CFElement objects.
	 *
	 * @returns {{ minDate: Date | null, maxDate: Date | null }} - An object containing the minimum and maximum date values, or null if the input array is empty.
	 */
	findMinMaxDates() {
		if (this.raw_data.length === 0) {
			return { minDate: null, maxDate: null };
		}

		// Custom comparison function to find min and max dates
		function compareDates(a, b) {
			return a.date - b.date;
		}

		// Clone the array to avoid modifying the original array
		const clonedElements = [...this.raw_data];

		// Sort the cloned array by date
		clonedElements.sort(compareDates);

		// Get the minimum and maximum dates
		const minDate = clonedElements[0].date;
		const maxDate = clonedElements[clonedElements.length - 1].date;

		return { minDate, maxDate };
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
}
