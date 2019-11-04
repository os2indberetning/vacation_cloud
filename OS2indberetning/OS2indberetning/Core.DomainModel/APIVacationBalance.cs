using System;
using System.Collections.Generic;
using System.Text;

namespace Core.DomainModel
{
    public class APIVacationBalance
    {
        public int VacationEarnedYear { get; set; }
        public int? FreeVacationHoursTotal { get; set; }
        public int? TransferredVacationHours { get; set; }
        public int? VacationHoursWithPay { get; set; }
    }
}
