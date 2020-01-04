using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Images;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessActions
{
    public class ProcessWithImagesActionModel : ProcessActionModel
    {
        [JsonIgnore]
        public List<ImageReference> ImageReferences { get; set; }
    }
}
