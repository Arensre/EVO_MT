using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.customer_base;

namespace Eventmanagement4._0
{
    public class IndexModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public IndexModel(Eventmanagement4._0.Data.Data_customer context)
        {
            _context = context;
        }

        public IList<contact_person> contact_person { get;set; }

        public async Task OnGetAsync()
        {
            contact_person = await _context.contact_person.ToListAsync();
        }
    }
}
