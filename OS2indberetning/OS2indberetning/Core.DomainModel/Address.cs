﻿
namespace Core.DomainModel
{
#pragma warning disable CS0660 // Type defines operator == or operator != but does not override Object.Equals(object o)
#pragma warning disable CS0661 // Type defines operator == or operator != but does not override Object.GetHashCode()
    public class Address
#pragma warning restore CS0661 // Type defines operator == or operator != but does not override Object.GetHashCode()
#pragma warning restore CS0660 // Type defines operator == or operator != but does not override Object.Equals(object o)
    {
        public int Id { get; set; }
        public string StreetName { get; set; }
        public string StreetNumber { get; set; }
        public int ZipCode { get; set; }
        public string Town { get; set; }
        public string Longitude { get; set; }
        public string Latitude { get; set; }
        public string Description { get; set; }

        public static bool operator ==(Address a, Address b)
        {
            // If both are null, or both are same instance, return true.
            if (ReferenceEquals(a, b))
            {
                return true;
            }

            // If one is null, but not both, return false.
            if (((object)a == null) || ((object)b == null))
            {
                return false;
            }

            // Return true if the fields match:
            return a.StreetName == b.StreetName && a.StreetNumber == b.StreetNumber && a.ZipCode == b.ZipCode && a.Town == b.Town && a.Latitude == b.Latitude && a.Longitude == b.Longitude;
        }

        public static bool operator !=(Address a, Address b)
        {
            return !(a == b);
        }


    }
}
