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
    public class DeleteModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public DeleteModel(Eventmanagement4._0.Data.Data_customer context)
        {
            _context = context;
        }

        [BindProperty]
        public contact_person contact_person { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
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
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            contact_person = await _context.contact_person.FindAsync(id);

            if (contact_person != null)
            {
                _context.contact_person.Remove(contact_person);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
