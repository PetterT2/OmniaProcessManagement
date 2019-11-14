using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Processes
{
    public class CustomLinkProcessItem : ProcessItem
    {
        public override ProcessItemTypes Type => ProcessItemTypes.CustomLink;
        public string CustomLink { get; set; }
    }
}
