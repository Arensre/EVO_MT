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
    public class IndexModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Main_Items _context;

        public int? pagesize { get; set; }

        public IndexModel(Eventmanagement4._0.Data.Main_Items context)
        {
            _context = context;
        }

        public global_functions.PaginatedList<main_items> main_items { get; set; }

        public async Task OnGetAsync(int? pageIndex, int? pagesize)
        {
            IQueryable<main_items> items_number = from s in _context.main_items select s;

            main_items = await global_functions.PaginatedList<main_items>.CreateAsync(
            items_number.AsNoTracking(), pageIndex ?? 1, pagesize ?? 25) ;
        }
    }
}
