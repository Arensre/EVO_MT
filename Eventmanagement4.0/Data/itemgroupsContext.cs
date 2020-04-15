using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Models.items;

namespace Eventmanagement4._0.Data
{
    public class itemgroupsContext : DbContext
    {
        public itemgroupsContext (DbContextOptions<itemgroupsContext> options)
            : base(options)
        {
        }

        public DbSet<Eventmanagement4._0.Models.items.item_groups> item_groups { get; set; }
    }
}
