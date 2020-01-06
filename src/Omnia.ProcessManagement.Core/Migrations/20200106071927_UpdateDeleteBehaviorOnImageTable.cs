using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class UpdateDeleteBehaviorOnImageTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ImageReferences_Images_ImageId",
                table: "ImageReferences");

            migrationBuilder.AddForeignKey(
                name: "FK_ImageReferences_Images_ImageId",
                table: "ImageReferences",
                column: "ImageId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ImageReferences_Images_ImageId",
                table: "ImageReferences");

            migrationBuilder.AddForeignKey(
                name: "FK_ImageReferences_Images_ImageId",
                table: "ImageReferences",
                column: "ImageId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
