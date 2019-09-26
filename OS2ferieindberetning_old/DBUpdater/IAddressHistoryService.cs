﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.DomainModel;

namespace DBUpdater
{
    public interface IAddressHistoryService
    {
        void UpdateAddressHistories();
        void CreateNonExistingHistories();
    }
}
