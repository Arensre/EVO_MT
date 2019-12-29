using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.items;

namespace Eventmanagement4._0.Pages.items
{
    public class CreateModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Main_Items _context;

        public CreateModel(Eventmanagement4._0.Data.Main_Items context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public main_items main_items { get; set; }

        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.main_items.Add(main_items);
            await _context.SaveChangesAsync();

            TempData["create_success"] = "true";

            return RedirectToPage("./Index");
        }
    }
}
