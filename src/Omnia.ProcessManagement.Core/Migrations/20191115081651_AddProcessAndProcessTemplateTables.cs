using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class AddProcessAndProcessTemplateTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EnterprisePropertyComputedColumnMappings",
                columns: table => new
                {
                    EnterprisePropertyId = table.Column<Guid>(nullable: false),
                    TableName = table.Column<string>(nullable: true),
                    EnterprisePropertyInternalName = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "EntityExistedQuery",
                columns: table => new
                {
                    Result = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "Processes",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OPMProcessId = table.Column<Guid>(nullable: false),
                    JsonValue = table.Column<string>(nullable: true),
                    EnterpriseProperties = table.Column<string>(nullable: true),
                    CheckedOutBy = table.Column<string>(nullable: true),
                    VersionType = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Processes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcessTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JsonValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcessContents",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RootProcessId = table.Column<Guid>(nullable: false),
                    LanguageTag = table.Column<int>(nullable: false),
                    Title = table.Column<string>(nullable: true),
                    Content = table.Column<string>(nullable: true),
                    Hash = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessContents", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
                    table.ForeignKey(
                        name: "FK_ProcessContents_Processes_RootProcessId",
                        column: x => x.RootProcessId,
                        principalTable: "Processes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProcessMetadata",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RootProcessId = table.Column<Guid>(nullable: false),
                    JsonValue = table.Column<string>(nullable: true),
                    Hash = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessMetadata", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
                    table.ForeignKey(
                        name: "FK_ProcessMetadata_Processes_RootProcessId",
                        column: x => x.RootProcessId,
                        principalTable: "Processes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessContents_ClusteredId",
                table: "ProcessContents",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcessContents_RootProcessId",
                table: "ProcessContents",
                column: "RootProcessId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessMetadata_ClusteredId",
                table: "ProcessMetadata",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcessMetadata_RootProcessId",
                table: "ProcessMetadata",
                column: "RootProcessId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EnterprisePropertyComputedColumnMappings");

            migrationBuilder.DropTable(
                name: "EntityExistedQuery");

            migrationBuilder.DropTable(
                name: "ProcessContents");

            migrationBuilder.DropTable(
                name: "ProcessMetadata");

            migrationBuilder.DropTable(
                name: "ProcessTemplates");

            migrationBuilder.DropTable(
                name: "Processes");
        }
    }
}
