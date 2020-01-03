using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class Task
    {
        public Guid Id { get; set; }
        public MultilingualString Title { get; set; }
    }
}
