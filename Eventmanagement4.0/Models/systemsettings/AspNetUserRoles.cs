using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Eventmanagement4._0.Models.systemsettings
{
    public class AspNetUserRoles
    {
        [Key]
        public string UserId { get; set; }

        public string RoleId { get; set; }
    }
}
