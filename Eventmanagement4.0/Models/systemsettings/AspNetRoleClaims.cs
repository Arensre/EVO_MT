using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventmanagement4._0.Models.systemsettings
{
    public class AspNetRoleClaims
    {

        public int Id { get; set; }
        public string RoleId { get; set; }
        public string Claimtype { get; set; }
        public string ClaimValue { get; set; }
    }
}
