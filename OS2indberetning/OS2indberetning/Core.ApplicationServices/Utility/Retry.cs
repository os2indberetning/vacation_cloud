using System;
using System.Collections.Generic;
using System.Threading;
using System.Linq;

namespace Core.ApplicationServices.Utility
{
    public static class Retry
    {
        public static void Do(
            Action action,
            TimeSpan retryInterval,
            int maxAttemptCount = 5)
        {
            Do<object>(() =>
            {
                action();
                return null;
            }, retryInterval, maxAttemptCount);
        }

        public static T Do<T>(
            Func<T> action,
            TimeSpan retryInterval,
            int maxAttemptCount = 3)
        {
            var exceptions = new List<Exception>();

            for (int attempted = 0; attempted < maxAttemptCount; attempted++)
            {
                try
                {
                    if (attempted > 0)
                    {
                        Thread.Sleep(retryInterval);
                    }
                    return action();
                }
                catch (Exception ex)
                {
                    exceptions.Add(ex);
                }
            }
            // if all exceptions are the same type, just throw the last/most recent one
            if (exceptions.Select(e => e.GetType()).Distinct().Count() == 1)
            {
                throw exceptions.Last();
            }
            else
            {
                throw new AggregateException(exceptions);
            }
        }
    }
}
