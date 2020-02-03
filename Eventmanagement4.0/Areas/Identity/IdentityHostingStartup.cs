using System;
using Eventmanagement4._0.Areas.Identity.Data;
using Eventmanagement4._0.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

[assembly: HostingStartup(typeof(Eventmanagement4._0.Areas.Identity.IdentityHostingStartup))]
namespace Eventmanagement4._0.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
                services.AddDbContext<IdentityContext>(options =>
                    options.UseSqlServer(
                        context.Configuration.GetConnectionString("IdentityContextConnection")));

                services.AddDefaultIdentity<Eventmanagement4_0User>(options => options.SignIn.RequireConfirmedAccount = true)
                 .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<IdentityContext>();
            });
        }
    }
}