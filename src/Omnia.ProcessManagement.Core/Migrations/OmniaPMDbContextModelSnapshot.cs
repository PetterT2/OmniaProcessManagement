﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Omnia.ProcessManagement.Core.Repositories;

namespace Omnia.ProcessManagement.Core.Migrations
{
    [DbContext(typeof(OmniaPMDbContext))]
    partial class OmniaPMDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Omnia.Fx.NetCore.EnterpriseProperties.Entities.EnterprisePropertyColumnMapping", b =>
                {
                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<Guid>("EnterprisePropertyId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("EnterprisePropertyInternalName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TableName")
                        .HasColumnType("nvarchar(max)");

                    b.ToTable("EnterprisePropertyComputedColumnMappings");
                });

            modelBuilder.Entity("Omnia.Fx.NetCore.Repositories.EntityFramework.Entities.EntityExistedResult", b =>
                {
                    b.Property<int>("Result")
                        .HasColumnType("int");

                    b.ToTable("EntityExistedQuery");
                });

            modelBuilder.Entity("Omnia.ProcessManagement.Core.Entities.ProcessTemplates.ProcessTemplate", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<long>("ClusteredId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("CreatedBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("DeletedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("JsonValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset>("ModifiedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("ProcessTemplates");
                });

            modelBuilder.Entity("Omnia.ProcessManagement.Core.Entities.Processes.Process", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("CheckedOutBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<long>("ClusteredId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("CreatedBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EnterpriseProperties")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("JsonValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset>("ModifiedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("OPMProcessId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("VersionType")
                        .HasColumnType("int");

                    b.HasKey("Id")
                        .HasAnnotation("SqlServer:Clustered", false);

                    b.HasIndex("ClusteredId")
                        .IsUnique()
                        .HasAnnotation("SqlServer:Clustered", true);

                    b.HasIndex("OPMProcessId", "VersionType")
                        .IsUnique()
                        .HasFilter("[VersionType] != 2");

                    b.ToTable("Processes");
                });

            modelBuilder.Entity("Omnia.ProcessManagement.Core.Entities.Processes.ProcessData", b =>
                {
                    b.Property<Guid>("InternalProcessItemId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("ProcessId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<long>("ClusteredId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTimeOffset>("CreatedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("CreatedBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Hash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("JsonValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset>("ModifiedAt")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ReferenceProcessItemIds")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("InternalProcessItemId", "ProcessId")
                        .HasAnnotation("SqlServer:Clustered", false);

                    b.HasIndex("ClusteredId")
                        .IsUnique()
                        .HasAnnotation("SqlServer:Clustered", true);

                    b.HasIndex("ProcessId");

                    b.ToTable("ProcessData");
                });

            modelBuilder.Entity("Omnia.ProcessManagement.Core.Entities.Processes.ProcessData", b =>
                {
                    b.HasOne("Omnia.ProcessManagement.Core.Entities.Processes.Process", "Process")
                        .WithMany("ProcessData")
                        .HasForeignKey("ProcessId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
