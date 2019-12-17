﻿using Omnia.Fx.Models.Language;
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
        public object Documents { get; set; } //TODO
        public List<Link> Links { get; set; } //TODO
        public object Tasks { get; set; }// TODO

        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset ModifiedAt { get; set; }
    }
}
