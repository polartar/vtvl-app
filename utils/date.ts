export const timestampToDateString = (milliseconds: number) => {
  console.log(new Date(milliseconds));
  const formattedDate = new Date(milliseconds).toLocaleDateString(undefined, {
    timeZone: 'UTC',
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });
  console.log(formattedDate);
  const sp = formattedDate.split(' ');
  return `${sp[1]} ${sp[0]}, ${sp[2]}`;
};

export const toUTCString = (date = new Date()): UTCString =>
  date.toISOString().replace('T', ' ').replace(/\..*$/, ' UTC') as UTCString;
