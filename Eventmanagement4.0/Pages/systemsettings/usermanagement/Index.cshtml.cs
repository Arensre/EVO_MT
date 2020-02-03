using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Eventmanagement4._0.Models.systemsettings;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace Eventmanagement4._0.Pages.systemsettings.usermanagement
{
    [Authorize]

    public class IndexModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.UserContext _context;

        public IndexModel(Eventmanagement4._0.Data.UserContext context)
        {
            _context = context;
        }

        public IList<AspNetUsers> user { get; set; }

        public async Task OnGetAsync()
        {
            user = await _context.AspNetUsers.ToListAsync();
        }
    }
}
