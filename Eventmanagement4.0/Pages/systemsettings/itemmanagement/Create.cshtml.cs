using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.items;

namespace Eventmanagement4._0.Pages.systemsettings.itemmanagement
{
    public class CreateModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.itemgroupsContext _context;

        public CreateModel(Eventmanagement4._0.Data.itemgroupsContext context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public item_groups item_groups { get; set; }

        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.item_groups.Add(item_groups);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
