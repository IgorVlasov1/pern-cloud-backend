const dateCompare = async (a) => {
  let date1 = new Date(a);
  let timeElapsed = Date.now();
  let today = new Date(timeElapsed);
  today = today.toISOString();
  let dateToday = new Date(today);
  console.log(dateToday);
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(
    dateToday.getFullYear(),
    dateToday.getMonth(),
    dateToday.getDate()
  );
  let compared = Math.floor((utc2 - utc1) / _MS_PER_DAY);
  return compared < 5;
};

module.exports = dateCompare;
