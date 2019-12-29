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
    public class DeleteModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public DeleteModel(Eventmanagement4._0.Data.Data_customer context)
        {
            _context = context;
        }

        [BindProperty]
        public customer customer { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            customer = await _context.customer.FirstOrDefaultAsync(m => m.ID == id);

            if (customer == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            customer = await _context.customer.FindAsync(id);

            if (customer != null)
            {
                _context.customer.Remove(customer);
                await _context.SaveChangesAsync();
            }
            TempData["delete_success"] = "true";
            return RedirectToPage("./Index");
        }
    }
}
