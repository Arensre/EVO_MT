using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Eventmangement_4._0.Model.customer_base
{
    public class customer
    {
        [Display(Name = "Kundennummer")]
        public int ID { get; set; }

        [Display(Name = "Kundennummer")]
        public string customer_id { get; set; }
        [Display(Name = "Land")]
        public string land { get; set; }
        [Display(Name = "Name")]
        public string customer_name { get; set; }
        [Display(Name = "Straße")]
        public string street { get; set; }
        [Display(Name = "Telefon Nummer")]
        public string telefphone_number { get; set; }
        [Display(Name = "Webseite")]
        public string website { get; set; }
        [Display(Name = "Postleitzahl")]
        public string post_code { get; set; }
        [Display(Name = "Ort")]
        public string place { get; set; }

       }
}
