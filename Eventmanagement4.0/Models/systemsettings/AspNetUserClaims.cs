using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Eventmanagement4._0.Models.systemsettings
{
    public class AspNetUserClaims
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string ClaimType { get; set; }
        public string ClaimValue { get; set; }
    }
}
