using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Eventmangement_4._0.Model.customer_base;
using Microsoft.AspNetCore.Authorization;

namespace Eventmanagement4._0.Pages.customer_base
{


    [Authorize(Roles ="bd_customer")]
    public class IndexModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.Data_customer _context;

        public IndexModel(Eventmanagement4._0.Data.Data_customer context)
        {
            _context = context;
        }

        public string numbersort { get; set; }
        public string namesort { get; set; }
        public string CurrentFilter { get; set; }
        public string CurrentSort { get; set; }
        public string numberpages { get; set; }
        public int? pagesize { get; set; }

        public global_functions.PaginatedList<customer> customer { get; set; }

        public async Task OnGetAsync(string sortOrder, string currentFilter, string searchString, int? pageIndex, int? pagesize)
        {

            CurrentSort = sortOrder;

            namesort = String.IsNullOrEmpty(sortOrder) ? "name_desc" : "";
            numbersort = String.IsNullOrEmpty(sortOrder) ? "number_desc" : "";
            CurrentFilter = searchString;
            IQueryable<customer> customer_number = from s in _context.customer select s;

            if (!String.IsNullOrEmpty(searchString))
            {
                customer_number = customer_number.Where(s => s.customer_id.Contains(searchString));
                                       
            }

            switch (sortOrder)
            {
                case "name_desc":
                    customer_number = customer_number.OrderByDescending(s => s.customer_name);
                    break;
                case "number_desc":
                    customer_number = customer_number.OrderBy(s => s.customer_id);
                    break;
                
                default:
                    customer_number = customer_number.OrderBy(s => s.customer_id);
                    break;
            }

            customer = await global_functions.PaginatedList<customer>.CreateAsync(
            customer_number.AsNoTracking(), pageIndex ?? 1, pagesize ?? 25) ;
        }
    }

}
