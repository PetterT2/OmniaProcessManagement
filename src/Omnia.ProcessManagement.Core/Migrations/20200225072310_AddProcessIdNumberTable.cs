using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class AddProcessIdNumberTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcessIdNumbers",
                columns: table => new
                {
                    OPMProcessIdNumber = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OPMProcessId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessIdNumbers", x => x.OPMProcessIdNumber);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessIdNumbers_OPMProcessId",
                table: "ProcessIdNumbers",
                column: "OPMProcessId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessIdNumbers");
        }
    }
}
