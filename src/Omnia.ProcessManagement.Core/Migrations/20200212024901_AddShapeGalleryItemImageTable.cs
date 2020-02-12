using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class AddShapeGalleryItemImageTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShapeGalleryItemImages",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShapeGalleryItemId = table.Column<Guid>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    FileName = table.Column<string>(nullable: true),
                    Content = table.Column<byte[]>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShapeGalleryItemImages", x => new { x.Id, x.ShapeGalleryItemId });
                    table.ForeignKey(
                        name: "FK_ShapeGalleryItemImages_ShapeGalleryItems_ShapeGalleryItemId",
                        column: x => x.ShapeGalleryItemId,
                        principalTable: "ShapeGalleryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShapeGalleryItemImages_ShapeGalleryItemId",
                table: "ShapeGalleryItemImages",
                column: "ShapeGalleryItemId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShapeGalleryItemImages");
        }
    }
}
