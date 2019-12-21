using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Omnia.ProcessManagement.Core.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProcessConcurrencyLock",
                columns: table => new
                {
                    OPMProcessId = table.Column<Guid>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessConcurrencyLock", x => x.OPMProcessId);
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
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OPMProcessId = table.Column<Guid>(nullable: false),
                    JsonValue = table.Column<string>(nullable: true),
                    EnterpriseProperties = table.Column<string>(nullable: true),
                    CheckedOutBy = table.Column<string>(nullable: true),
                    TeamAppId = table.Column<Guid>(nullable: false),
                    SecurityResourceId = table.Column<Guid>(nullable: false),
                    ProcessWorkingStatus = table.Column<byte>(nullable: false),
                    VersionType = table.Column<byte>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Processes", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
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
                    table.PrimaryKey("PK_ProcessTemplates", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
                });

            migrationBuilder.CreateTable(
                name: "ProcessTypes",
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
                    Title = table.Column<string>(nullable: true),
                    ParentId = table.Column<Guid>(nullable: true),
                    RootId = table.Column<Guid>(nullable: false),
                    Type = table.Column<int>(nullable: false),
                    JsonValue = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessTypes", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
                });

            migrationBuilder.CreateTable(
                name: "ProcessTypeTermSynchronizationTracking",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    Hash = table.Column<string>(nullable: true),
                    Status = table.Column<int>(nullable: false),
                    SyncFromSharePoint = table.Column<bool>(nullable: false),
                    Message = table.Column<string>(nullable: true),
                    Milliseconds = table.Column<long>(nullable: false),
                    ProcessTypeRootId = table.Column<Guid>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessTypeTermSynchronizationTracking", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Key = table.Column<string>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(nullable: true),
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Key)
                        .Annotation("SqlServer:Clustered", false);
                });

            migrationBuilder.CreateTable(
                name: "Workflows",
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
                    Type = table.Column<byte>(nullable: false),
                    CompletedType = table.Column<byte>(nullable: false),
                    DueDate = table.Column<DateTimeOffset>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workflows", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
                });

            migrationBuilder.CreateTable(
                name: "ProcessData",
                columns: table => new
                {
                    ProcessStepId = table.Column<Guid>(nullable: false),
                    ProcessId = table.Column<Guid>(nullable: false),
                    CreatedBy = table.Column<string>(nullable: true),
                    ModifiedBy = table.Column<string>(nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                    ModifiedAt = table.Column<DateTimeOffset>(nullable: false),
                    ClusteredId = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReferenceProcessStepIds = table.Column<string>(nullable: true),
                    JsonValue = table.Column<string>(nullable: true),
                    Hash = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessData", x => new { x.ProcessStepId, x.ProcessId })
                        .Annotation("SqlServer:Clustered", false);
                    table.ForeignKey(
                        name: "FK_ProcessData_Processes_ProcessId",
                        column: x => x.ProcessId,
                        principalTable: "Processes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowTasks",
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
                    WorkflowId = table.Column<Guid>(nullable: false),
                    IsCompleted = table.Column<bool>(nullable: false),
                    Comment = table.Column<string>(nullable: true),
                    AssignedUser = table.Column<string>(nullable: true),
                    SPTaskId = table.Column<int>(nullable: false),
                    TeamAppId = table.Column<Guid>(nullable: false),
                    TaskOutcome = table.Column<byte>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowTasks", x => x.Id)
                        .Annotation("SqlServer:Clustered", false);
                    table.ForeignKey(
                        name: "FK_WorkflowTasks_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProcessData_ClusteredId",
                table: "ProcessData",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcessData_ProcessId",
                table: "ProcessData",
                column: "ProcessId");

            migrationBuilder.CreateIndex(
                name: "IX_Processes_ClusteredId",
                table: "Processes",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_Processes_OPMProcessId_VersionType",
                table: "Processes",
                columns: new[] { "OPMProcessId", "VersionType" },
                unique: true,
                filter: "[VersionType] != 2");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessTemplates_ClusteredId",
                table: "ProcessTemplates",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcessTypes_ClusteredId",
                table: "ProcessTypes",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_ProcessTypes_RootId",
                table: "ProcessTypes",
                column: "RootId",
                unique: true,
                filter: "[ParentId] IS NULL AND [DeletedAt] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Settings_ClusteredId",
                table: "Settings",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_ClusteredId",
                table: "Workflows",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_OPMProcessId",
                table: "Workflows",
                column: "OPMProcessId",
                unique: true,
                filter: "[CompletedType] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowTasks_ClusteredId",
                table: "WorkflowTasks",
                column: "ClusteredId",
                unique: true)
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowTasks_WorkflowId",
                table: "WorkflowTasks",
                column: "WorkflowId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessConcurrencyLock");

            migrationBuilder.DropTable(
                name: "ProcessData");

            migrationBuilder.DropTable(
                name: "ProcessTemplates");

            migrationBuilder.DropTable(
                name: "ProcessTypes");

            migrationBuilder.DropTable(
                name: "ProcessTypeTermSynchronizationTracking");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "WorkflowTasks");

            migrationBuilder.DropTable(
                name: "Processes");

            migrationBuilder.DropTable(
                name: "Workflows");
        }
    }
}
