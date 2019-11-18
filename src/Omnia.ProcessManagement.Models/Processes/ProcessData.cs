using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.CanvasDefinitions;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessData
    {
        public MultilingualString Content { get; set; }
        public CanvasDefinition CanvasDefinition { get; set; }
        public object Documents { get; set; } //TODO
        public object Links { get; set; } //TODO
        public object Tasks { get; set; }// TODO
    }
}
