using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Eventmanagement4._0.Models.items
{
    public class main_items
    {

        public int id { get; set; }

      
        

        [Display(Name = "Artikelbezeichnung")]
        public string item_name {get;set;}

        [Display(Name = "Hersteller")]
        public string manufacturer { get; set; }

        [Display(Name = "Bezeichnung")]
        public string discription { get; set; }

        
    }
}
