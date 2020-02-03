using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Eventmanagement4._0.Areas.Identity.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;

namespace Eventmanagement4._0.Pages.systemsettings.usermanagement
{
    public class CreateModel : PageModel
    {
        private readonly Eventmanagement4._0.Data.UserContext _context;
        private readonly UserManager<Eventmanagement4_0User> _userManager;

        public CreateModel(
            Eventmanagement4._0.Data.UserContext context,
            UserManager<Eventmanagement4_0User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [BindProperty]
        public InputModel Input { get; set; }

        public class InputModel
        {
            [Required]
            [EmailAddress]
            [Display(Name = "Benutzername")]
            public string email{ get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Password")]
            public string password { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Password bestätigen")]
            [Compare("password", ErrorMessage = "The password and confirmation password do not match.")]
            public string confirmpassword { get; set; }

        }

      
        public IActionResult OnGet()
        {
            return Page();
        }

        // To protect from overposting attacks, please enable the specific properties you want to bind to, for
        // more details see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (ModelState.IsValid)
            {
                var user = new Eventmanagement4_0User { UserName = Input.email, Email = Input.email, EmailConfirmed = true };
                var result = await _userManager.CreateAsync(user, Input.password);
                if (result.Succeeded)
                {
                    TempData["create_success"] = "true";
                }
                else
                {
                    TempData["create_success"] = "false";
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(string.Empty, error.Description);
                    }
                    return Page();
                }

            }


            //await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
