using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Models.items;

namespace Eventmanagement4._0.Data
{
    public class Main_Items : DbContext
    {
        public Main_Items (DbContextOptions<Main_Items> options)
            : base(options)
        {
        }

        public DbSet<Eventmanagement4._0.Models.items.main_items> main_items { get; set; }

    }
}
