using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Models.systemsettings;

namespace Eventmanagement4._0.Data
{
    public class UserContext : DbContext
    {
        public UserContext (DbContextOptions<UserContext> options)
            : base(options)
        {
        }

        public DbSet<Eventmanagement4._0.Models.systemsettings.AspNetUsers> AspNetUsers { get; set; }
        public DbSet<Eventmanagement4._0.Models.systemsettings.AspNetUserRoles> AspNetUserRoles { get; set; }
        public DbSet<Eventmanagement4._0.Models.systemsettings.AspNetRoles> AspNetRoles { get; set; }
    }
}
