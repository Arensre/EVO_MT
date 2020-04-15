using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.items;

namespace Eventmanagement4._0.Pages.systemsettings.itemmanagement
{
    public class EditModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.itemgroupsContext _context;

        public EditModel(Eventmanagement4._0.Data.itemgroupsContext context)
        {
            _context = context;
        }

        [BindProperty]
        public item_groups item_groups { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            item_groups = await _context.item_groups.FirstOrDefaultAsync(m => m.id == id);

            if (item_groups == null)
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

            _context.Attach(item_groups).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!item_groupsExists(item_groups.id))
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

        private bool item_groupsExists(int id)
        {
            return _context.item_groups.Any(e => e.id == id);
        }
    }
}
