using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Settings
{
    internal class Setting : ClusteredIndexAuditingEntityBase
    {
        [Key, Column(Order = 1)]
        public string Key { get; set; }

        [Column(Order = 2)]
        public string Value { get; set; }
    }
}
