import moment from "moment";
export default function () {
  const setDate = (date) => {
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - date);
    var previousDate = currentDate.getDate();
    var previousFullYear = currentDate.getFullYear();
    var previousMonth = currentDate.getMonth() + 1;
    previousMonth = previousMonth >= 10 ? previousMonth : "0" + previousMonth;
    previousDate = previousDate >= 10 ? previousDate : "0" + previousDate;
    return [`${previousFullYear}-${previousMonth}-${previousDate}`];
  };
  const datatoutc = (value) => {
    if (value) {
      return moment(value).utc().format();
    }
    return value;
  };
  return {
    setDate,
    datatoutc,
  };
}
