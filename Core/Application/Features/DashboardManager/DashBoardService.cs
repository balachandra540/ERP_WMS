using Application.Features.DashboardManager.Queries;


namespace Application.Features.DashboardManager
{
    public interface IDashBoardService
    {
        (DateTime? From, DateTime? To) GetDateRange(string? filterType, DateTime? fromDate, DateTime? toDate);
    }
    public class DateRangeService : IDashBoardService
    {
        public (DateTime? From, DateTime? To) GetDateRange(string? filterType, DateTime? fromDate, DateTime? toDate)
        {
            var today = DateTime.UtcNow.Date;

            switch (filterType)
            {
                case "Today":
                    return (today, today.AddDays(1).AddTicks(-1));

                case "Yesterday":
                    var y = today.AddDays(-1);
                    return (y, y.AddDays(1).AddTicks(-1));

                case "ThisWeek":
                    var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
                    return (startOfWeek, today.AddDays(1).AddTicks(-1));

                case "LastWeek":
                    var lastWeekStart = today.AddDays(-(int)today.DayOfWeek - 6);
                    return (lastWeekStart, lastWeekStart.AddDays(7).AddTicks(-1));

                case "ThisMonth":
                    var monthStart = new DateTime(today.Year, today.Month, 1);
                    return (monthStart, today.AddDays(1).AddTicks(-1));

                case "LastMonth":
                    var lastMonthStart = new DateTime(today.Year, today.Month, 1).AddMonths(-1);
                    return (lastMonthStart, lastMonthStart.AddMonths(1).AddTicks(-1));

                case "Last7Days":
                    return (today.AddDays(-6), today.AddDays(1).AddTicks(-1));

                case "Last30Days":
                    return (today.AddDays(-29), today.AddDays(1).AddTicks(-1));

                case "ThisQuarter":
                    int currentQuarter = (today.Month - 1) / 3 + 1;
                    var quarterStart = new DateTime(today.Year, (currentQuarter - 1) * 3 + 1, 1);
                    return (quarterStart, today.AddDays(1).AddTicks(-1));

                case "LastQuarter":
                    int lastQuarter = ((today.Month - 1) / 3);
                    if (lastQuarter == 0)
                    {
                        var prevYearQ4 = new DateTime(today.Year - 1, 10, 1);
                        return (prevYearQ4, prevYearQ4.AddMonths(3).AddTicks(-1));
                    }
                    var lastQStart = new DateTime(today.Year, (lastQuarter - 1) * 3 + 1, 1);
                    return (lastQStart, lastQStart.AddMonths(3).AddTicks(-1));

                case "ThisYear":
                    return (new DateTime(today.Year, 1, 1), today.AddDays(1).AddTicks(-1));

                case "LastYear":
                    var lastYear = today.Year - 1;
                    return (new DateTime(lastYear, 1, 1), new DateTime(lastYear, 12, 31, 23, 59, 59));

                case "ThisFY":
                    var fyStart = today.Month >= 4
                        ? new DateTime(today.Year, 4, 1)
                        : new DateTime(today.Year - 1, 4, 1);
                    return (fyStart, today.AddDays(1).AddTicks(-1));

                case "LastFY":
                    var lastFyStart = today.Month >= 4
                        ? new DateTime(today.Year - 1, 4, 1)
                        : new DateTime(today.Year - 2, 4, 1);
                    return (lastFyStart, lastFyStart.AddYears(1).AddTicks(-1));

                case "Custom":
                    return (fromDate, toDate);

                default:
                    return (null, null);
            }
        }


        //public (DateTime? from, DateTime? to) GetDateRange(GetCardsDashboardRequest request)
        //{
        //    var today = DateTime.UtcNow.Date;

        //    switch (request.DateFilterType)
        //    {
        //        case "Today":
        //            return (today, today.AddDays(1).AddTicks(-1));

        //        case "Yesterday":
        //            var y = today.AddDays(-1);
        //            return (y, y.AddDays(1).AddTicks(-1));

        //        case "ThisWeek":
        //            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        //            return (startOfWeek, today.AddDays(1).AddTicks(-1));

        //        case "LastWeek":
        //            var lastWeekStart = today.AddDays(-(int)today.DayOfWeek - 6);
        //            var lastWeekEnd = lastWeekStart.AddDays(7).AddTicks(-1);
        //            return (lastWeekStart, lastWeekEnd);

        //        case "ThisMonth":
        //            var monthStart = new DateTime(today.Year, today.Month, 1);
        //            return (monthStart, today.AddDays(1).AddTicks(-1));

        //        case "LastMonth":
        //            var lastMonthStart = new DateTime(today.Year, today.Month, 1).AddMonths(-1);
        //            var lastMonthEnd = lastMonthStart.AddMonths(1).AddTicks(-1);
        //            return (lastMonthStart, lastMonthEnd);

        //        case "Last7Days":
        //            return (today.AddDays(-6), today.AddDays(1).AddTicks(-1));

        //        case "Last30Days":
        //            return (today.AddDays(-29), today.AddDays(1).AddTicks(-1));

        //        case "ThisQuarter":
        //            int currentQuarter = (today.Month - 1) / 3 + 1;
        //            var quarterStart = new DateTime(today.Year, (currentQuarter - 1) * 3 + 1, 1);
        //            return (quarterStart, today.AddDays(1).AddTicks(-1));

        //        case "LastQuarter":
        //            int lastQuarter = ((today.Month - 1) / 3);
        //            if (lastQuarter == 0)
        //            {
        //                var prevYearQ4 = new DateTime(today.Year - 1, 10, 1);
        //                return (prevYearQ4, prevYearQ4.AddMonths(3).AddTicks(-1));
        //            }
        //            var lastQStart = new DateTime(today.Year, (lastQuarter - 1) * 3 + 1, 1);
        //            return (lastQStart, lastQStart.AddMonths(3).AddTicks(-1));

        //        case "ThisYear":
        //            return (new DateTime(today.Year, 1, 1), today.AddDays(1).AddTicks(-1));

        //        case "LastYear":
        //            var lastYear = today.Year - 1;
        //            return (new DateTime(lastYear, 1, 1), new DateTime(lastYear, 12, 31, 23, 59, 59));

        //        case "ThisFinancialYear":
        //            var fyStart = today.Month >= 4
        //                ? new DateTime(today.Year, 4, 1)
        //                : new DateTime(today.Year - 1, 4, 1);
        //            return (fyStart, today.AddDays(1).AddTicks(-1));

        //        case "LastFinancialYear":
        //            var lastFyStart = today.Month >= 4
        //                ? new DateTime(today.Year - 1, 4, 1)
        //                : new DateTime(today.Year - 2, 4, 1);
        //            return (lastFyStart, lastFyStart.AddYears(1).AddTicks(-1));

        //        case "Custom":
        //            return (request.FromDate, request.ToDate);

        //        default:
        //            return (null, null);
        //    }
        //}


        //public (DateTime? from, DateTime? to) GetDateRange(GetPurchaseDashboardRequest request)
        //{
        //    var today = DateTime.UtcNow.Date;

        //    switch (request.DateFilterType)
        //    {
        //        case "Today":
        //            return (today, today.AddDays(1).AddTicks(-1));

        //        case "Yesterday":
        //            var y = today.AddDays(-1);
        //            return (y, y.AddDays(1).AddTicks(-1));

        //        case "ThisWeek":
        //            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        //            return (startOfWeek, today.AddDays(1).AddTicks(-1));

        //        case "LastWeek":
        //            var lastWeekStart = today.AddDays(-(int)today.DayOfWeek - 6);
        //            var lastWeekEnd = lastWeekStart.AddDays(7).AddTicks(-1);
        //            return (lastWeekStart, lastWeekEnd);

        //        case "ThisMonth":
        //            var monthStart = new DateTime(today.Year, today.Month, 1);
        //            return (monthStart, today.AddDays(1).AddTicks(-1));

        //        case "LastMonth":
        //            var lastMonthStart = new DateTime(today.Year, today.Month, 1).AddMonths(-1);
        //            var lastMonthEnd = lastMonthStart.AddMonths(1).AddTicks(-1);
        //            return (lastMonthStart, lastMonthEnd);

        //        case "Last7Days":
        //            return (today.AddDays(-6), today.AddDays(1).AddTicks(-1));

        //        case "Last30Days":
        //            return (today.AddDays(-29), today.AddDays(1).AddTicks(-1));

        //        case "ThisQuarter":
        //            int currentQuarter = (today.Month - 1) / 3 + 1;
        //            var quarterStart = new DateTime(today.Year, (currentQuarter - 1) * 3 + 1, 1);
        //            return (quarterStart, today.AddDays(1).AddTicks(-1));

        //        case "LastQuarter":
        //            int lastQuarter = ((today.Month - 1) / 3);
        //            if (lastQuarter == 0)
        //            {
        //                var prevYearQ4 = new DateTime(today.Year - 1, 10, 1);
        //                return (prevYearQ4, prevYearQ4.AddMonths(3).AddTicks(-1));
        //            }
        //            var lastQStart = new DateTime(today.Year, (lastQuarter - 1) * 3 + 1, 1);
        //            return (lastQStart, lastQStart.AddMonths(3).AddTicks(-1));

        //        case "ThisYear":
        //            return (new DateTime(today.Year, 1, 1), today.AddDays(1).AddTicks(-1));

        //        case "LastYear":
        //            var lastYear = today.Year - 1;
        //            return (new DateTime(lastYear, 1, 1), new DateTime(lastYear, 12, 31, 23, 59, 59));

        //        case "ThisFinancialYear":
        //            var fyStart = today.Month >= 4
        //                ? new DateTime(today.Year, 4, 1)
        //                : new DateTime(today.Year - 1, 4, 1);
        //            return (fyStart, today.AddDays(1).AddTicks(-1));

        //        case "LastFinancialYear":
        //            var lastFyStart = today.Month >= 4
        //                ? new DateTime(today.Year - 1, 4, 1)
        //                : new DateTime(today.Year - 2, 4, 1);
        //            return (lastFyStart, lastFyStart.AddYears(1).AddTicks(-1));

        //        case "Custom":
        //            return (request.FromDate, request.ToDate);

        //        default:
        //            return (null, null);
        //    }
        //}

        //public (DateTime? from, DateTime? to) GetDateRange(GetSalesDashboardRequest request)
        //{
        //    var today = DateTime.UtcNow.Date;

        //    switch (request.DateFilterType)
        //    {
        //        case "Today":
        //            return (today, today.AddDays(1).AddTicks(-1));

        //        case "Yesterday":
        //            var y = today.AddDays(-1);
        //            return (y, y.AddDays(1).AddTicks(-1));

        //        case "ThisWeek":
        //            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        //            return (startOfWeek, today.AddDays(1).AddTicks(-1));

        //        case "LastWeek":
        //            var lastWeekStart = today.AddDays(-(int)today.DayOfWeek - 6);
        //            var lastWeekEnd = lastWeekStart.AddDays(7).AddTicks(-1);
        //            return (lastWeekStart, lastWeekEnd);

        //        case "ThisMonth":
        //            var monthStart = new DateTime(today.Year, today.Month, 1);
        //            return (monthStart, today.AddDays(1).AddTicks(-1));

        //        case "LastMonth":
        //            var lastMonthStart = new DateTime(today.Year, today.Month, 1).AddMonths(-1);
        //            var lastMonthEnd = lastMonthStart.AddMonths(1).AddTicks(-1);
        //            return (lastMonthStart, lastMonthEnd);

        //        case "Last7Days":
        //            return (today.AddDays(-6), today.AddDays(1).AddTicks(-1));

        //        case "Last30Days":
        //            return (today.AddDays(-29), today.AddDays(1).AddTicks(-1));

        //        case "ThisQuarter":
        //            int currentQuarter = (today.Month - 1) / 3 + 1;
        //            var quarterStart = new DateTime(today.Year, (currentQuarter - 1) * 3 + 1, 1);
        //            return (quarterStart, today.AddDays(1).AddTicks(-1));

        //        case "LastQuarter":
        //            int lastQuarter = ((today.Month - 1) / 3);
        //            if (lastQuarter == 0)
        //            {
        //                var prevYearQ4 = new DateTime(today.Year - 1, 10, 1);
        //                return (prevYearQ4, prevYearQ4.AddMonths(3).AddTicks(-1));
        //            }
        //            var lastQStart = new DateTime(today.Year, (lastQuarter - 1) * 3 + 1, 1);
        //            return (lastQStart, lastQStart.AddMonths(3).AddTicks(-1));

        //        case "ThisYear":
        //            return (new DateTime(today.Year, 1, 1), today.AddDays(1).AddTicks(-1));

        //        case "LastYear":
        //            var lastYear = today.Year - 1;
        //            return (new DateTime(lastYear, 1, 1), new DateTime(lastYear, 12, 31, 23, 59, 59));

        //        case "ThisFinancialYear":
        //            var fyStart = today.Month >= 4
        //                ? new DateTime(today.Year, 4, 1)
        //                : new DateTime(today.Year - 1, 4, 1);
        //            return (fyStart, today.AddDays(1).AddTicks(-1));

        //        case "LastFinancialYear":
        //            var lastFyStart = today.Month >= 4
        //                ? new DateTime(today.Year - 1, 4, 1)
        //                : new DateTime(today.Year - 2, 4, 1);
        //            return (lastFyStart, lastFyStart.AddYears(1).AddTicks(-1));

        //        case "Custom":
        //            return (request.FromDate, request.ToDate);

        //        default:
        //            return (null, null);
        //    }
        //}

        //public (DateTime? from, DateTime? to) GetDateRange(GetInventoryDashboardRequest request)
        //{
        //    var today = DateTime.UtcNow.Date;

        //    switch (request.DateFilterType)
        //    {
        //        case "Today":
        //            return (today, today.AddDays(1).AddTicks(-1));

        //        case "Yesterday":
        //            var y = today.AddDays(-1);
        //            return (y, y.AddDays(1).AddTicks(-1));

        //        case "ThisWeek":
        //            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        //            return (startOfWeek, today.AddDays(1).AddTicks(-1));

        //        case "LastWeek":
        //            var lastWeekStart = today.AddDays(-(int)today.DayOfWeek - 6);
        //            var lastWeekEnd = lastWeekStart.AddDays(7).AddTicks(-1);
        //            return (lastWeekStart, lastWeekEnd);

        //        case "ThisMonth":
        //            var monthStart = new DateTime(today.Year, today.Month, 1);
        //            return (monthStart, today.AddDays(1).AddTicks(-1));

        //        case "LastMonth":
        //            var lastMonthStart = new DateTime(today.Year, today.Month, 1).AddMonths(-1);
        //            var lastMonthEnd = lastMonthStart.AddMonths(1).AddTicks(-1);
        //            return (lastMonthStart, lastMonthEnd);

        //        case "Last7Days":
        //            return (today.AddDays(-6), today.AddDays(1).AddTicks(-1));

        //        case "Last30Days":
        //            return (today.AddDays(-29), today.AddDays(1).AddTicks(-1));

        //        case "ThisQuarter":
        //            int currentQuarter = (today.Month - 1) / 3 + 1;
        //            var quarterStart = new DateTime(today.Year, (currentQuarter - 1) * 3 + 1, 1);
        //            return (quarterStart, today.AddDays(1).AddTicks(-1));

        //        case "LastQuarter":
        //            int lastQuarter = ((today.Month - 1) / 3);
        //            if (lastQuarter == 0)
        //            {
        //                var prevYearQ4 = new DateTime(today.Year - 1, 10, 1);
        //                return (prevYearQ4, prevYearQ4.AddMonths(3).AddTicks(-1));
        //            }
        //            var lastQStart = new DateTime(today.Year, (lastQuarter - 1) * 3 + 1, 1);
        //            return (lastQStart, lastQStart.AddMonths(3).AddTicks(-1));

        //        case "ThisYear":
        //            return (new DateTime(today.Year, 1, 1), today.AddDays(1).AddTicks(-1));

        //        case "LastYear":
        //            var lastYear = today.Year - 1;
        //            return (new DateTime(lastYear, 1, 1), new DateTime(lastYear, 12, 31, 23, 59, 59));

        //        case "ThisFinancialYear":
        //            var fyStart = today.Month >= 4
        //                ? new DateTime(today.Year, 4, 1)
        //                : new DateTime(today.Year - 1, 4, 1);
        //            return (fyStart, today.AddDays(1).AddTicks(-1));

        //        case "LastFinancialYear":
        //            var lastFyStart = today.Month >= 4
        //                ? new DateTime(today.Year - 1, 4, 1)
        //                : new DateTime(today.Year - 2, 4, 1);
        //            return (lastFyStart, lastFyStart.AddYears(1).AddTicks(-1));

        //        case "Custom":
        //            return (request.FromDate, request.ToDate);

        //        default:
        //            return (null, null);
        //    }
        //}



    }
}
