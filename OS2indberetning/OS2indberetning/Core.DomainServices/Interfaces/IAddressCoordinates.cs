using Core.DomainModel;

namespace Core.DomainServices.Interfaces
{
    public interface IAddressCoordinates
    {
        Address GetAddressFromCoordinates(Address addressCoord);
        Address GetAddressCoordinates(Address address, bool correctAddresses = false);
    }
}
