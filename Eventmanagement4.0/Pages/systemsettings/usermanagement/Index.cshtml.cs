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
using System.Data.Entity;

namespace Eventmanagement4._0.Pages.systemsettings.usermanagement
{
    [Authorize]

    public class IndexModel : PageModel
    {
        private Eventmanagement4._0.Data.UserContext _context;


        public IndexModel(Eventmanagement4._0.Data.UserContext context)
        {
            _context = context;
        }
        [BindProperty]
        public bool base_data { get; set; }
        [BindProperty]
        public bool base_data_customer { get; set; }
        [BindProperty]
        public bool base_data_customer_edit { get; set; }
        [BindProperty]
        public bool base_data_customer_cd { get; set; }


        [BindProperty]
        public bool base_data_item { get; set; }
        [BindProperty]
        public bool base_data_item_edit { get; set; }
        [BindProperty]
        public bool base_data_item_cd { get; set; }

        public global_functions.PaginatedList<AspNetUserRoles> AspNetUserRoles { get; set; }
        public global_functions.PaginatedList<AspNetUsers> AspNetUsers { get; set; }
        public async Task<IActionResult> OnGetAsync(string UserId, string searchString, int? pageIndex, int? pagesize)
        {
            IQueryable<AspNetUsers> user = from s in _context.AspNetUsers select s;

            IQueryable<AspNetUserRoles> roles = from r in _context.AspNetUserRoles select r;


            if (!String.IsNullOrEmpty(searchString))
            {
                user = user.Where(s => s.UserName.Contains(searchString));
            }

            if (!String.IsNullOrEmpty(UserId))
            {
                TempData["nores"] = true;

                //read roles base data customer for user
                var base_data_search = roles.Where(s => s.UserId == UserId && s.RoleId == "1").FirstOrDefault();
                var base_data_customer_search = roles.Where(s => s.UserId == UserId && s.RoleId == "2").FirstOrDefault();
                var base_data_customer_edit_search = roles.Where(s => s.UserId == UserId && s.RoleId == "4").FirstOrDefault();
                var base_data_customer_cd_search = roles.Where(s => s.UserId == UserId && s.RoleId == "5").FirstOrDefault();

                //read roles base data items for user
                var base_data_item_search = roles.Where(s => s.UserId == UserId && s.RoleId == "6").FirstOrDefault();
                var base_data_item_edit_search = roles.Where(s => s.UserId == UserId && s.RoleId == "7").FirstOrDefault();
                var base_data_item_cd_search = roles.Where(s => s.UserId == UserId && s.RoleId == "8").FirstOrDefault();

                //check if user has roles "base data customer"
                if (base_data_search != null)
                {
                    base_data = true;
                }
                else
                {
                    base_data = false;
                }
                if (base_data_customer_search != null)
                {
                    base_data_customer = true;
                }
                else
                {
                    base_data_customer = false;
                }
                if (base_data_customer_edit_search != null)
                {
                    base_data_customer_edit = true;
                }
                else
                {
                    base_data_customer_edit = false;
                }
                if (base_data_customer_cd_search != null)
                {
                    base_data_customer_cd = true;
                }
                else
                {
                    base_data_customer_cd = false;
                }

                //check if user has roles "base data items"
                if (base_data_item_search != null)
                {
                    base_data_item = true;
                }
                else
                {
                    base_data_item = false;
                }
                if (base_data_item_edit_search != null)
                {
                    base_data_item_edit = true;
                }
                else
                {
                    base_data_item_edit = false;
                }
                if (base_data_item_cd_search != null)
                {
                    base_data_item_cd = true;
                }
                else
                {
                    base_data_item_cd = false;
                }

            }

            AspNetUsers = await global_functions.PaginatedList<AspNetUsers>.CreateAsync(user, pageIndex ?? 1, pagesize ?? 25);





            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string UserId)
        {
            TempData["nores"] = true;

            try
            {
                //user right for base data
                SQLupdate(base_data, UserId, "1");

                //user rights for  customer section
                SQLupdate(base_data_customer, UserId, "2");
                SQLupdate(base_data_customer_edit, UserId, "4");
                SQLupdate(base_data_customer_cd, UserId, "5");

                // user rights for item section
                SQLupdate(base_data_item, UserId, "6");
                SQLupdate(base_data_item_edit, UserId, "7");
                SQLupdate(base_data_item_cd, UserId, "8");


                await _context.SaveChangesAsync();
                TempData["save_success"] = true;
            }
            catch
            {
                TempData["save_success"] = false;
            }
            return RedirectToPage("./Index", new { UserId = UserId });

        }

        private void SQLupdate(bool checkbox, string UserId, string roleid)
        {
            if (checkbox is true)
            {
                if (!roleExists(UserId, roleid))
                {
                    _context.Database.ExecuteSqlRaw("insert into AspNetUserRoles (UserId,RoleId) Values ('" + UserId + "', '" + roleid + "')");
                }
            }
            else
            {
                if (roleExists(UserId, roleid))
                {
                    _context.Database.ExecuteSqlRaw("Delete from AspNetUserRoles Where UserId = '" + UserId + "' and RoleId ='" + roleid + "'");
                }
            }
            _context.SaveChangesAsync();
        }

        private bool roleExists(string UserId, string role)
        {
            return _context.AspNetUserRoles.Any(s => s.UserId == UserId && s.RoleId == role);
        }
    }
}

