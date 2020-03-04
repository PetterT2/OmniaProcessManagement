﻿using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class LightProcess
    {
        public Guid OPMProcessId { get; set; }
        public int OPMProcessIdNumber { get; set; }
        public MultilingualString Title { get; set; }
    }
}
