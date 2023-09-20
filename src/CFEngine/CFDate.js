
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
      let month = ['January','February','March','April','May','June','July','August','September','October','November','December'][month_numb];
      let year = dt.getFullYear();

      switch (format) {
         case 'yyyy':
            return ''+ year;
         case 'mmm yyyy':
            return month.slice(0,3) + ' ' + year;
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
