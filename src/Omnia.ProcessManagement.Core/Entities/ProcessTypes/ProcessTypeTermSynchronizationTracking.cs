using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.ProcessTypes
{
    internal class ProcessTypeTermSynchronizationTracking : AuditingEntityBase
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>
        /// Since we will only sync particular data of document type to TermSet
        /// So we will store and compare the hash of particular data of document type to know if there is any updates need to sync
        /// </summary>
        public string Hash { get; set; }

        public ProcessTypeTermSynchronizationStatus.Statuses Status { get; set; }

        [Column(Order = 4)]
        public bool SyncFromSharePoint { get; set; }

        [Column(Order = 5)]
        public string Message { get; set; }

        /// <summary>
        /// How long this synchronization process took
        /// </summary>
        [Column(Order = 6)]
        public long Milliseconds { get; set; }

        /// <summary>
        /// Document Type Root Id
        /// </summary>
        [Column(Order = 7)]
        public Guid ProcessTypeRootId { get; set; }
    }
}
