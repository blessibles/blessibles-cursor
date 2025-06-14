export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'holiday' | 'saint';
  description: string;
}

export const holidays: Holiday[] = [
  {
    date: '2024-03-31',
    name: 'Easter Sunday',
    type: 'holiday',
    description: 'Celebrates the resurrection of Jesus Christ.'
  },
  {
    date: '2024-12-25',
    name: 'Christmas',
    type: 'holiday',
    description: 'Celebrates the birth of Jesus Christ.'
  },
  {
    date: '2024-05-19',
    name: 'Pentecost',
    type: 'holiday',
    description: 'Commemorates the descent of the Holy Spirit upon the Apostles.'
  },
  {
    date: '2024-04-14',
    name: 'Palm Sunday',
    type: 'holiday',
    description: 'Celebrates Jesus\' triumphal entry into Jerusalem.'
  },
  {
    date: '2024-02-14',
    name: 'Ash Wednesday',
    type: 'holiday',
    description: 'Marks the beginning of Lent.'
  },
  {
    date: '2024-03-17',
    name: 'St. Patrick\'s Day',
    type: 'saint',
    description: 'Celebrates St. Patrick, the patron saint of Ireland.'
  },
  {
    date: '2024-02-14',
    name: 'St. Valentine\'s Day',
    type: 'saint',
    description: 'Honors St. Valentine, associated with love and affection.'
  },
  {
    date: '2024-06-29',
    name: 'St. Peter and St. Paul',
    type: 'saint',
    description: 'Feast day for the apostles Peter and Paul.'
  },
  {
    date: '2024-11-01',
    name: 'All Saints\' Day',
    type: 'holiday',
    description: 'Honors all saints, known and unknown.'
  },
  // Add more as needed
]; 