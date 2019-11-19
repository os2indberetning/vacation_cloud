using System;

namespace Core.DomainModel
{
    public class APIVacationBalance
    {
        public int VacationEarnedYear { get; set; }
        public double? FreeVacationHoursTotal { get; set; }
        public double? TransferredVacationHours { get; set; }
        public double? VacationHoursWithPay { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
