using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.systemsettings;

namespace Eventmanagement4._0.Pages.systemsettings.usermanagement
{
    public class EditModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.UserContext _context;

        public EditModel(Eventmanagement4._0.Data.UserContext context)
        {
            _context = context;
        }

        [BindProperty]
        public AspNetUsers user { get; set; }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            user = await _context.AspNetUsers.FirstOrDefaultAsync(m => m.ID == id);

            if (user == null)
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

            _context.Attach(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!userExists(user.ID))
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

        private bool userExists(string id)
        {
            return _context.AspNetUsers.Any(e => e.ID == id);
        }
    }
}
