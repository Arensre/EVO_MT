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
    public class DetailsModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Main_Items _context;

        public DetailsModel(Eventmanagement4._0.Data.Main_Items context)
        {
            _context = context;
        }

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
    }
}
