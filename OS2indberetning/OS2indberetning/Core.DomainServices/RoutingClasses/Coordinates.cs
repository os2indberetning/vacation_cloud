namespace Core.DomainServices.RoutingClasses
{
#pragma warning disable CS0659 // Type overrides Object.Equals(object o) but does not override Object.GetHashCode()
    public class Coordinates
#pragma warning restore CS0659 // Type overrides Object.Equals(object o) but does not override Object.GetHashCode()
    {
        public enum CoordinatesType
        {
            Origin,
            Destination,
            Via,
            Unkown

        }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public CoordinatesType Type { get; set; }

        public override bool Equals(object obj)
        {
            var address = obj as Coordinates; 
            if (address == null)
            {
                return false;
            }
            if (Latitude != address.Latitude || Longitude != address.Longitude || Type != address.Type)
            {
                return false;
            }

            return true;
        }
    }
}
