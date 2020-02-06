using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ShapeGalleryItems
{
    public class ShapeGalleryItem
    {
        public ShapeGalleryItem()
        {
            Id = Guid.NewGuid();
        }
        public Guid Id { get; set; }
        public bool BuiltIn { get; set; }
        public ShapeGalleryItemSettings Settings { get; set; }
    }
}
