using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Models.systemsettings;

namespace Eventmanagement4._0.Data
{
    public class RoleContext : DbContext
    {
        public RoleContext (DbContextOptions<RoleContext> options)
            : base(options)
        {
        }

        public DbSet<Eventmanagement4._0.Models.systemsettings.AspNetRoles> AspNetRoles { get; set; }
     
    }
}
