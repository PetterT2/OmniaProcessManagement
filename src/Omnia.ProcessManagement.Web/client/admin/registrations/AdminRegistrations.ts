import { FontAwesomeIcon, AdminNavigationBuiltInCategory } from '@omnia/fx/models';
import { Topics } from '@omnia/fx';


Topics.Admin.registerNavigationNode.publish({
    title: '$Localize:OPM.Admin.ProcessManagement;',
    category: AdminNavigationBuiltInCategory.Tenant,
    elementToRender: "opm-admin-journey",
    icon: new FontAwesomeIcon("fal fa-angle-double-right"),
    tooltip: 'Process Management',
    weight: 1100
});