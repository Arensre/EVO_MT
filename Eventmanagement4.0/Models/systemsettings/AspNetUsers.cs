using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace Eventmanagement4._0.Models.systemsettings
{
    public class AspNetUsers
    {
        [Display(Name = "BenutzerId")]
        public string ID { get; set; }

        [Display(Name ="Benutzername")]
        public string UserName { get; set; }
        
        public string NormalizedUserName { get; set; }

        [Display(Name ="Email Adresse")]
        public string Email { get; set; }

        public string NormalizedEmail { get; set; }

        public bool EmailConfirmed { get; set; }

        [Display(Name ="PhoneNumber")]
        public string PhoneNumber { get; set; }

        [Display(Name ="Kennwort")]
        public string PasswordHash { get; set; }

        public string SecurityStamp { get; set; }
        public string ConcurrencyStamp { get; set; }

        public bool PhoneNumberConfirmed { get; set; }

        public bool TwoFactorEnabled { get; set; }
        public bool LockoutEnabled { get; set; }
       // public DateTime LockoutEnd { get; set; }
        public int AccessFailedCount { get; set; }


    }
}
