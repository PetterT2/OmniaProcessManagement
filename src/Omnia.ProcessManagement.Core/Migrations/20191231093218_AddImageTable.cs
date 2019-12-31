using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class AddImageTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcessData_Processes_ProcessId",
                table: "ProcessData");

            migrationBuilder.CreateTable(
                name: "Images",
                columns: table => new
                {
                    ProcessId = table.Column<Guid>(nullable: false),
                    FileName = table.Column<string>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Content = table.Column<byte[]>(nullable: true),
                    Hash = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Images", x => new { x.ProcessId, x.FileName })
                        .Annotation("SqlServer:Clustered", false);
                    table.ForeignKey(
                        name: "FK_Images_Processes_ProcessId",
                        column: x => x.ProcessId,
                        principalTable: "Processes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Images_ClusteredId",
                table: "Images",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcessData_Processes_ProcessId",
                table: "ProcessData",
                column: "ProcessId",
                principalTable: "Processes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProcessData_Processes_ProcessId",
                table: "ProcessData");

            migrationBuilder.DropTable(
                name: "Images");

            migrationBuilder.AddForeignKey(
                name: "FK_ProcessData_Processes_ProcessId",
                table: "ProcessData",
                column: "ProcessId",
                principalTable: "Processes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
