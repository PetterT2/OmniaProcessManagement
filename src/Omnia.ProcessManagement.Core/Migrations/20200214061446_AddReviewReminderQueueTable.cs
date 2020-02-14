using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class AddReviewReminderQueueTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReviewReminderQueues",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    OPMProcessId = table.Column<Guid>(nullable: false),
                    ReviewDate = table.Column<DateTimeOffset>(nullable: false),
                    ReviewReminderDate = table.Column<DateTimeOffset>(nullable: false),
                    Pending = table.Column<bool>(nullable: false),
                    Log = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewReminderQueues", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReviewReminderQueues_OPMProcessId_Pending",
                table: "ReviewReminderQueues",
                columns: new[] { "OPMProcessId", "Pending" },
                unique: true,
                filter: "[Pending] = 1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReviewReminderQueues");
        }
    }
}
