using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmangement_4._0.Model.customer_base;


namespace Eventmanagement4._0.Pages.customer_base
{
    public class DetailsModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public DetailsModel(Eventmanagement4._0.Data.Data_customer context)
        {
            _context = context;
        }

        public customer customer { get; set; }
        public global_functions.PaginatedList<Eventmanagement4._0.Models.customer_base.contact_person> contact_person { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id,string customer_search_id)
        {

            IQueryable<Eventmanagement4._0.Models.customer_base.contact_person> contact_person_filtered = from s in _context.contact_person select s;


            if (id == null)
            {
                return NotFound();
            }

            customer = await _context.customer.FirstOrDefaultAsync(m => m.ID == id);
        

            if (customer == null)
            {
                return NotFound();
            }

            if (!String.IsNullOrEmpty(customer_search_id))
            {
                contact_person_filtered = contact_person_filtered.Where(s => s.customer_id == customer_search_id);

            }

            contact_person = await  global_functions.PaginatedList<Eventmanagement4._0.Models.customer_base.contact_person>.CreateAsync(contact_person_filtered.AsNoTracking(),1,5);

            return Page();
        }
    }
}
