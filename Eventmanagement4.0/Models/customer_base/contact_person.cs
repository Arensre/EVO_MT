using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Eventmanagement4._0.Models.customer_base
{
    public class contact_person
        {

            public int ID { get; set; }

        [Display(Name ="Geschlecht")]
            public string gender { get; set; }
            public string customer_id { get; set; }

        [Display(Name = "Vorname")]
            public string first_name { get; set; }

        [Display(Name = "Nachname")]
            public string surname { get; set; }

        [Display(Name = "Telefonnummer")]
            public string telephone_number { get; set; }
        [Display(Name = "Mobilfunknummer")]
            public string mobile_number { get; set; }

        [Display(Name ="Land")]
            public string land { get; set; }

        [Display(Name ="Mail Adresse")]
            public string mail_adress { get; set; }

        [Display(Name = "Abteilung")]
            public string departmend { get; set; }

        [Display(Name = "Postleitzahl")]
            public string post_code { get; set; }

        [Display(Name = "Ort")]
            public string place { get; set; }
    }
}
