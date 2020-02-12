using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class AddPublishByColumnInProcessTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublishedBy",
                table: "Processes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublishedBy",
                table: "Processes");
        }
    }
}
