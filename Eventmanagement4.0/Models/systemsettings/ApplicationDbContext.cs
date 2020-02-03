using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Eventmanagement4._0.Models.systemsettings
{
    public class ApplicationDbContext :DbContext
    {
        public ApplicationDbContext(DbContextOptions options)
            : base(options)
        {

        }

        public DbSet<AspNetRoles> AspNetRoles { get; set; }

        public DbSet<AspNetUsers> AspNetUsers { get; set; }

        public DbSet<AspNetRoleClaims> AspNetRoleClaims { get; set; }
        public DbSet<AspNetUserClaims> AspNetUserClaims { get; set; }

        public DbSet<AspNetUserTokens> AspNetUserTokens { get; set; }

        public DbSet<AspNetUserRoles> AspNetUserRoles { get; set; }
    }
}
