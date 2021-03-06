﻿// <auto-generated />
using Eventmanagement4._0.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Eventmanagement4._0.Migrations
{
    [DbContext(typeof(Main_Items))]
    partial class Main_ItemsModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Eventmanagement4._0.Models.items.main_items", b =>
                {
                    b.Property<int>("id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("discription")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("item_name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("manufacturer")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("id");

                    b.ToTable("main_items");
                });
#pragma warning restore 612, 618
        }
    }
}
