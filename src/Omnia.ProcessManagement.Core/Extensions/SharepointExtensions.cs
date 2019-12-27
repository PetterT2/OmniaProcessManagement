using Microsoft.SharePoint.Client;
using System;
using System.Linq;
using System.Linq.Expressions;

namespace Omnia.ProcessManagement.Core.Extensions
{
    public static class SharepointExtensions
    {
        public static bool IsPropertyAvailableOrInstantiated<T>(this T clientObject, Expression<Func<T, object>> property) where T : ClientObject
        {
            string propName;

            var body = property.Body as MemberExpression;
            if (body != null)
                propName = body.Member.Name;
            else
            {
                var op = ((UnaryExpression)property.Body).Operand;
                propName = ((MemberExpression)op).Member.Name;
            }

            var isCollection = typeof(ClientObjectCollection).IsAssignableFrom(property.Body.Type);
            return isCollection ? clientObject.IsObjectPropertyInstantiated(propName) : clientObject.IsPropertyAvailable(propName);
        }

        public static bool PropertyInstantiationNeeded<T>(this T clientObject, params Expression<Func<T, object>>[] properties) where T : ClientObject
        {
            if (properties == null || !properties.Any())
                return false;

            var loadNeeded = false;

            foreach (var prop in properties)
            {
                if (clientObject.IsPropertyAvailableOrInstantiated(prop))
                    continue;

                clientObject.Context.Load(clientObject, prop);
                loadNeeded = true;
            }

            return loadNeeded;
        }
    }
}
