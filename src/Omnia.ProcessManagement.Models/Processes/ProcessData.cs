using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.CanvasDefinitions;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessData
    {
        public ProcessData() 
        {
            this.Content = new MultilingualString();
        }
        public CanvasDefinition CanvasDefinition { get; set; }
        public MultilingualString Content { get; set; }
        public object DocumentBlockData { get; set; } //TODO
        public List<Link> Links { get; set; }
        public List<Task> Tasks { get; set; }

        public virtual string CreatedBy { get; set; }
        public virtual string ModifiedBy { get; set; }
        public virtual DateTimeOffset CreatedAt { get; set; }
        public virtual DateTimeOffset ModifiedAt { get; set; }
    }
}
