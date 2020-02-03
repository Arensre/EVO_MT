using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace Eventmanagement4._0.Models.systemsettings
{
    public class AspNetRoles
    {
        public string Id{ get; set; }
        public string Name { get; set; }

        public string NormalizedName { get; set; }
        public string ConcurrencyStamp { get; set; }


    }
}
