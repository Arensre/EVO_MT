using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.items;

namespace Eventmanagement4._0.Pages.items
{
    public class DeleteModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Main_Items _context;

        public DeleteModel(Eventmanagement4._0.Data.Main_Items context)
        {
            _context = context;
        }

        [BindProperty]
        public main_items main_items { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            main_items = await _context.main_items.FirstOrDefaultAsync(m => m.id == id);

            if (main_items == null)
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

            main_items = await _context.main_items.FindAsync(id);

            if (main_items != null)
            {
                _context.main_items.Remove(main_items);
                await _context.SaveChangesAsync();
            }
            TempData["delete_success"] = "true";
            return RedirectToPage("./Index");
        }
    }
}
