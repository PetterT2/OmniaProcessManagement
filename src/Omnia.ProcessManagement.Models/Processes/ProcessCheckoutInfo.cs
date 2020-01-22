using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class ProcessCheckoutInfo
    {
        public bool CanCheckout { get; set; }
        public string CheckedOutBy { get; set; }
    }
}
