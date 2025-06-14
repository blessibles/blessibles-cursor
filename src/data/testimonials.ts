export interface Testimonial {
  id: string;
  name: string;
  message: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah M.',
    message: 'Blessibles has brought so much inspiration to our home. The printables are beautiful and faith-filled!',
    date: '2024-06-01',
  },
  {
    id: 't2',
    name: 'John D.',
    message: 'We use the journals and wall art in our Sunday school. The kids love them!',
    date: '2024-06-03',
  },
  {
    id: 't3',
    name: 'Emily R.',
    message: 'I highly recommend Blessibles to anyone looking for Christian family resources.',
    date: '2024-06-05',
  },
];

export default testimonials; 