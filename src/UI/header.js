import { CFDate } from "../CFEngine/CFDate";

export function updateHeader(dates) {
   let headerRow = $(".table-header>.row");

   let header_content = "";

   dates.forEach((d) => {
      header_content +=
         '<div class="col date">' +
         "<span>" +
         CFDate.toString(d, "mmm yyyy") +
         "</span></div>";
   });

   headerRow.html(header_content);
}