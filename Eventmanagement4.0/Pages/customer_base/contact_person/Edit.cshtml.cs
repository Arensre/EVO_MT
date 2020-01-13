using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.customer_base;

namespace Eventmanagement4._0
{
    public class EditModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public EditModel(Eventmanagement4._0.Data.Data_customer context)
        {
            _context = context;
        }

        [BindProperty]
        public contact_person contact_person { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id, int? customer)
        {
            if (id == null)
            {
                return NotFound();
            }

            contact_person = await _context.contact_person.FirstOrDefaultAsync(m => m.ID == id);

            if (contact_person == null)
            {
                return NotFound();
            }
            ViewData["customer_number"] = customer;

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

            _context.Attach(contact_person).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!contact_personExists(contact_person.ID))
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

        private bool contact_personExists(int id)
        {
            return _context.contact_person.Any(e => e.ID == id);
        }
    }
}
