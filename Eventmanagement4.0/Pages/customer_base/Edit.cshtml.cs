using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmangement_4._0.Model.customer_base;
using Microsoft.AspNetCore.Authorization;

namespace Eventmanagement4._0.Pages.customer_base
{
    [Authorize(Roles = "bd_customer_edit")]
    public class EditModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public EditModel(Eventmanagement4._0.Data.Data_customer context)
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

        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(customer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!customerExists(customer.ID))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return RedirectToPage("./Index");
        }

        private bool customerExists(int id)
        {
            return _context.customer.Any(e => e.ID == id);
        }
    }
}
