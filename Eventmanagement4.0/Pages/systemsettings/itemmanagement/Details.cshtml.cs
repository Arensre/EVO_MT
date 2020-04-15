using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.items;

namespace Eventmanagement4._0.Pages.systemsettings.itemmanagement
{
    public class DetailsModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.itemgroupsContext _context;

        public DetailsModel(Eventmanagement4._0.Data.itemgroupsContext context)
        {
            _context = context;
        }

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
    }
}
