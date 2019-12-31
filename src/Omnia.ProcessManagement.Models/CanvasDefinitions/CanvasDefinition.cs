﻿using Omnia.ProcessManagement.Models.Images;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.CanvasDefinitions
{
    public class CanvasDefinition
    {
        public ImageRef BackgroundImageRef { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int GridX { get; set; }
        public int GridY { get; set; }
        public List<DrawingShape> DrawingShapes { get; set; }
    }
}
