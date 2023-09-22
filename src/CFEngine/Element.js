

/**
 * Cash flow defined by date and value
 * - Date expressed in milliseconds
 */
export class CFElement {
	constructor(_date, _value) {
		this.date = _date;
		this.value = _value;
	}
}