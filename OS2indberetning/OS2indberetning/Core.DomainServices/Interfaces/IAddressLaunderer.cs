using Core.DomainModel;

namespace Core.DomainServices.Interfaces
{
    public interface IAddressLaunderer
    {
        Address Launder(Address inputAddress);
    }
}
