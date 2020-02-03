using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.systemsettings;

namespace Eventmanagement4._0.Pages.systemsettings.usermanagement
{
    public class DetailsModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.UserContext _context;

        public DetailsModel(Eventmanagement4._0.Data.UserContext context)
        {
            _context = context;
        }

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
    }
}
