
let Table;

$(document).ready(function(){
   Table = new CFXTable();
   Table.addRow();
   scrollbar = new Scrollbar( document.getElementById("scroll-wrapper"), 
                              document.getElementsByClassName("cf")[0]
                              )
   scrollbar.setCursorWidth(
         Table.column.cf.width()
   )
});

class CFXTable{
   constructor(){
      this._table = $("#CFXTable");
      this.id_counter = 0;
      this.table_id_list = [];

      this.column = {
         row_head:$(".row-head"),
         total:$(".total-column"),
         cf:$(".cf")
      }
   }

   rowSelect(id){
      return $('.row [data-rowid="'+id+'"]')
   }

   row_hover(id){
      const row_columns = this.rowSelect(id);
      // row_columns.forEach(x => x.hover(
      //    function() {
      //       console.log($(this).attr('data-rowid'))
      //    //   $( this ).addClass( "hovered" );
      //    }, function() {
      //    //   $( this ).removeClass( "hovered" );S
      //    }
      //  ));
   }

   createID(){
      return this.id_counter++;
   }

   addRow(){

      const newid = this.createID();
      this.table_id_list.push(newid);

      const row_head = $('<div>')
                  .addClass('row')
                  .attr("data-rowid", newid)
                  .html('<div class="row-start-cell">'+
                        '<div class="row-select"></div>'+
                        '<div class="add-row" onclick="Table.addRow()"></div>'+
                        '</div>'+
                        '<div class="row-name">New Row</div>'+
                        '<div class="row-command row-delete"><i class="bi bi-x row-head-details"></i></div>'+
                        '<div class="row-command row-edit"><i class="bi bi-three-dots-vertical row-head-details"></i></div>'
                        );
   
      const total_row = $('<div>').addClass('row').addClass('total-row')
                  .attr("data-rowid", newid)
                  .html('0.00');
   
      const cf = $('<div>')
                  .addClass('row')
                  .attr("data-rowid", newid)
                  .html('<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'+
                        '<div class="col cell"><span>0.00</span></div>'
                  );
      
      
      
      [row_head, total_row, cf].forEach(i => i.hover(
         function(){
            const row_id = parseInt($(this).attr('data-rowid'));
            const row_columns = $('.row [data-rowid="'+row_id+'"]');
            row_columns.addClass( "hovered" );
            
         },
         function(e){
            const row_id = parseInt($(this).attr('data-rowid'));
            const row_columns = $('.row [data-rowid="'+row_id+'"]');
            row_columns.removeClass( "hovered" );
         }
      ));
      

      this.column.row_head.append(row_head);
      this.column.total.append(total_row);
      this.column.cf.append(cf);
      
      // this.column.forEach(x => x.mouseenter)

      this.cellEvents();
   }


   // Cells interaction

   selectCell(){
      // Get row and column id 

   }

   editCell(){
   }

   cellEvents(){
      const cells = this.column.cf.find(".cell");

      cells.click(function(e){
         $(".cf").find(".selected").removeClass("selected");

         $(this).addClass("selected");
      });

      cells.dblclick(function () {
         var input = $('<input>', {type: "text"})
          .val($(this).find("span").html())
         $(this).html(input)
         input.focus(); 
      })
   }
}







class CFDataSet{
   constructor(dat){
      this.data = [];
      this.data.push(new CFLine(dat[0]))
   }

}

var testdata =  [
   [
      {"date":"2023-02-23", "value":	-10000},
      {"date":"2023-04-01", "value":	10},
      {"date":"2023-04-01", "value":	10},
      {"date":"2023-09-03", "value":	10},
      {"date":"2023-09-18", "value":	10},
      {"date":"2024-03-03", "value":	10},
      {"date":"2024-07-17", "value":	1000}
   ]
]

class CFLine{
      constructor( _name = "Data name",data){
         this.name = _name;
         this.daily_data;  //daily
         this.EoM_data;    // Monthly
         this.EoQ_data;    // Quarterly
         this.EoY_data;    // Yearly

         if(data)
            this.setData(data);

      }

      setData(data){
         this.daily_data = this.getDataFromJSON(data);
         this.EoM_data = this.aggregateMonthly();
         this.EoQ_data = this.aggregateQuarterly();
         this.EoY_ata = this.aggregateYearly();
      }


      // Private Methods

      getDataFromJSON(_data){
      // Assumes format: [{"date":String(yyyy-mm-dd), "value":Integer}]
         let data_map = new Map();
         _data.forEach(e => {
            let day = CFDate.parse(e.date);
            if(data_map.has(day)) 
               data_map.set(day, data_map.get(day) + e.value);
            else  
               data_map.set(day,e.value);
         });
         return data_map;
      }
   
      aggregate(endPeriodFunc, months_interval){
         let dates = [...this.daily_data.keys()];
         let min_date =endPeriodFunc(Math.min(...dates));
         let max_date = endPeriodFunc(Math.max(...dates));

         let dt = min_date;

         let aggregated_map = new Map();
         while(dt <= max_date){
            aggregated_map.set(dt, 0)
            dt = (new CFDate(dt).addMonths(months_interval));
         }

         for(const [k,v] of this.daily_data){
            let date_updating = endPeriodFunc(k);
            aggregated_map.set(date_updating, aggregated_map.get(date_updating) + v);
         }

         return aggregated_map;
      }
      aggregateMonthly() {return this.aggregate((a) => ((new CFDate(a)).EoMonth()),1)};
      aggregateQuarterly() {return this.aggregate((a) => ((new CFDate(a)).EoQuarter()),3)};
      aggregateYearly() {return this.aggregate((a) => ((new CFDate(a)).EoYear()),12)};
 
}


class CFDate{

   /** Create Date from milliseconds */
   constructor(value){
      this.date_obj = new Date(value);
      this.date_value = this.date_obj.getTime();
   }

   /** Parses from format dd-mm-yyyy */
   static parse(val){
      let d = new Date(val)
      return d.getTime();
   }

   addMonths(n=0){
      let month = this.date_obj.getMonth()+n;
      let year = this.date_obj.getFullYear();
      return (new Date(year,month+1,0)).getTime();
   }

   /** Converts number of days since epoch to a JS Date and milliseconds */
   // static dateFromExcel(val){
   //    let zero = new Date(1970,0,0);
   //    let d = new Date(zero.setDate(+val-1))
   //    return d.getTime();
   // }

   EoMonth(){
      let month = this.date_obj.getMonth();
      let year = this.date_obj.getFullYear();
      return (new Date(year,month+1,0)).getTime();
   }

   EoQuarter(){
      let month = [2,2,2,5,5,5,8,8,8,11,11,11][this.date_obj.getMonth()];
      let year = this.date_obj.getFullYear();
      return (new Date(year,month+1,0)).getTime();
   }

   EoYear(){
      let year = this.date_obj.getFullYear();
      return (new Date(year,12,0)).getTime();
   }


   
}