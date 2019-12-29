using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventmangement_4._0.Model.customer_base
{
    public class contact_person
    {

        public int ID { get; set; }
    
        public string gender { get; set; }
        public string customer_id { get; set; }
        public string first_name { get; set; }
        public string surname { get; set; }
        public string telephone_number { get; set; }
        public string mobile_number { get; set; }
        public string land { get; set; }
        public string mail_adress { get; set; }
        public string departmend { get; set; }

        public string post_code { get; set; }
        public string place { get; set; }
    }
}
