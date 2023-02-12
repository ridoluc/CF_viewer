
$(document).ready(function(){

});

function createRow(){
   let new_line  = $("<div>")
}



function createTable(){
   let elem = document.getElementById("CFTable");

   let table = document.createElement('table');
   table.classList.add('cf-table');
   
   let table_header = document.createElement('thead');
   table_header.append(document.createElement('th').innerText('First'));

   
   let ds = new CFDataSet(testdata);

   let tbody = document.createElement('tbody');

   ds.data.forEach(function(row){
      let table_row = document.createElement('tr');
      
      
      tbody.append(document.createElement('th').innerText(row.name));

   });

   
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