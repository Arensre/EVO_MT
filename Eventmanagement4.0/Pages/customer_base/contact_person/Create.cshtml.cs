using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.customer_base;

namespace Eventmanagement4._0
{
    public class CreateModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public CreateModel(Eventmanagement4._0.Data.Data_customer context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public contact_person contact_person { get; set; }

        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.contact_person.Add(contact_person);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
