import { CFDate } from "../CFEngine/CFDate";

export function updateHeader(dates, interval) {
   let headerRow = $(".table-header>.row");

   let header_content = "";

   dates.forEach((d) => {
      header_content +=
         '<div class="col date">' +
         dateFormat(d,interval)+
         '</div>';
   });

   headerRow.html(header_content);
}


function dateFormat(date, interval) {
	let str;

	switch (interval) {
		case CFDate.time_interval.quarter:
			str =
				'<div class="year">' +
				CFDate.toString(date, "yyyy") +
				'</div><div class="date-period">' +
				CFDate.toString(date, "QQ") +
				"</div>";
			break;

		case CFDate.time_interval.year:
			str =
				'<div class="year"></div><div class="date-period">' +
				CFDate.toString(date, "yyyy") +
				"</div>";
			break;

		default:
			str =
				'<div class="year">' +
				CFDate.toString(date, "yyyy") +
				'</div><div class="date-period">' +
				CFDate.toString(date, "mmmm") +
				"</div>";
			break;
	}

	return str;
}