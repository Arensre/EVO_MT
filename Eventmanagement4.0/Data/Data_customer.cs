using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Eventmangement_4._0.Model.customer_base;
using Eventmanagement4._0.Models.customer_base;

namespace Eventmanagement4._0.Data
{
    public class Data_customer : DbContext
    {
        public Data_customer (DbContextOptions<Data_customer> options)
            : base(options)
        {
        }

        public DbSet<Eventmangement_4._0.Model.customer_base.customer> customer { get; set; }

        public DbSet<Eventmanagement4._0.Models.customer_base.contact_person> contact_person { get; set; }
    }
}
