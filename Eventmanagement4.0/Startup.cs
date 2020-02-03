using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Eventmanagement4._0.Data;
using Microsoft.AspNetCore.Identity;
using Eventmanagement4._0.Models.systemsettings;



namespace Eventmanagement4._0
{
    public class Startup
    {


        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
       
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();

            services.AddDbContext<Data_customer>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("Data_customer")));

            services.AddDbContext<Main_Items>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("Main_Items")));

            services.AddDbContext<UserContext>(options =>
                    options.UseSqlServer(Configuration.GetConnectionString("UserContext")));

            services.AddDbContext<ApplicationDbContext>(options => 
            options.UseSqlServer(Configuration.GetConnectionString("UserContext")));

           /* services.AddDefaultIdentity<IdentityUser>()
                .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>();*/

            services.AddControllersWithViews();
            services.AddRazorPages();
            services.AddAuthorization();

        } 

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
           // if (env.IsDevelopment())
            //{
                app.UseDeveloperExceptionPage();
            //}
            /*else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }*/

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
            });
        }

    }
}
