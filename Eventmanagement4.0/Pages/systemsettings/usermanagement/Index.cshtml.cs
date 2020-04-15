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

        //base data rights
        [BindProperty]
        public bool base_data { get; set; }

        //base data customer rights
        [BindProperty]
        public bool base_data_customer { get; set; }
        [BindProperty]
        public bool base_data_customer_edit { get; set; }
        [BindProperty]
        public bool base_data_customer_cd { get; set; }

        //base data item rights
        [BindProperty]
        public bool base_data_item { get; set; }
        [BindProperty]
        public bool base_data_item_edit { get; set; }
        [BindProperty]
        public bool base_data_item_cd { get; set; }


        //systemsettings rights
        [BindProperty]
        public bool systemsettings { get; set; }

        //systemsettings user rights
        [BindProperty]
        public bool systemsettings_user { get; set; }
        [BindProperty]
        public bool systemsettings_user_edit { get; set; }
        [BindProperty]
        public bool systemsettings_user_cd { get; set; }

        //systemsettings item rights
        [BindProperty]
        public bool systemsettings_item { get; set; }
        [BindProperty]
        public bool systemsettings_item_edit { get; set; }
        [BindProperty]
        public bool systemsettings_item_cd { get; set; }

        public global_functions.PaginatedList<AspNetUserRoles> AspNetUserRoles { get; set; }
        public global_functions.PaginatedList<AspNetUsers> AspNetUsers { get; set; }
        public async Task<IActionResult> OnGetAsync(string UserId, string searchString, int? pageIndex, int? pagesize)
        {
            IQueryable<AspNetUsers> user = from s in _context.AspNetUsers select s;

            IQueryable<AspNetUserRoles> roles = from r in _context.AspNetUserRoles select r;

            if (UserId == null)
            {
                TempData["userid"] = "empty";
            }
            else
            {
                TempData["userid"] = UserId;
            }


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

                //read roles systemsettings user for user
                var systemsettings_search = roles.Where(s => s.UserId == UserId && s.RoleId == "9").FirstOrDefault();
                var systemsettings_user_search = roles.Where(s => s.UserId == UserId && s.RoleId == "10").FirstOrDefault();
                var systemsettings_user_edit_search = roles.Where(s => s.UserId == UserId && s.RoleId == "11").FirstOrDefault();
                var systemsettings_user_cd_search = roles.Where(s => s.UserId == UserId && s.RoleId == "12").FirstOrDefault();

                //read roles systemsettings user for item
                var systemsettings_item_search = roles.Where(s => s.UserId == UserId && s.RoleId == "13").FirstOrDefault();
                var systemsettings_item_edit_search = roles.Where(s => s.UserId == UserId && s.RoleId == "14").FirstOrDefault();
                var systemsettings_item_cd_search = roles.Where(s => s.UserId == UserId && s.RoleId == "15").FirstOrDefault();

                //check if user has roles "base data customer"
                base_data = check_role(base_data_search);
                base_data_customer = check_role(base_data_customer_search);
                base_data_customer_edit = check_role(base_data_customer_edit_search);
                base_data_customer_cd = check_role(base_data_customer_cd_search);

                //check if user has roles "base data items"
                base_data_item = check_role(base_data_item_search);
                base_data_item_edit = check_role(base_data_item_edit_search);
                base_data_item_cd = check_role(base_data_item_cd_search);

                //check if user has roles "systemsettings user"
                systemsettings = check_role(systemsettings_search);
                systemsettings_user = check_role(systemsettings_user_search);
                systemsettings_user_edit = check_role(systemsettings_user_edit_search);
                systemsettings_user_cd = check_role(systemsettings_user_cd_search);

                //check if user has roles "systemsettings item"
                systemsettings_item = check_role(systemsettings_item_search);
                systemsettings_item_edit = check_role(systemsettings_item_edit_search);
                systemsettings_item_cd = check_role(systemsettings_item_cd_search);

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

                //user rights for systemsettings
                SQLupdate(systemsettings, UserId, "9");

                // user rights for systemsettings_user section
                SQLupdate(systemsettings_user, UserId, "10");
                SQLupdate(systemsettings_user_edit, UserId, "11");
                SQLupdate(systemsettings_user_cd, UserId, "12");

                //user rights for systemsettings_item section
                SQLupdate(systemsettings_item, UserId, "13");
                SQLupdate(systemsettings_item_edit, UserId, "14");
                SQLupdate(systemsettings_item_cd, UserId, "15");


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

        private bool check_role(AspNetUserRoles searchstring)
        {
            bool binding;
            if (searchstring != null)
            {
                binding = true;
            }
            else
            {
                binding = false;
            }
            return binding;
        }

        private bool roleExists(string UserId, string role)
        {
            return _context.AspNetUserRoles.Any(s => s.UserId == UserId && s.RoleId == role);
        }
    }
}

