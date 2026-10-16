const asset = (index: number) => `${import.meta.env.BASE_URL}api/documentary/media/tfm-portrait-${String(index).padStart(2, '0')}.webp`;

export const producerPortrait = asset(26);
const cast = (name: string, index: number) => ({ name, portrait: asset(index) });

// Credits and labelled portraits supplied by the producer's official website.
// These describe its portfolio, never the casting of TOMI's future documentary.
export const producerFilms = [
  {
    title: 'The Misfits', year: '2021',
    source: 'https://www.thefilmmakers.com/the-misfits-2021',
    cast: [cast('Pierce Brosnan', 4), cast('Tim Roth', 6), cast('Hermione Corfield', 5), cast('Jamie Chung', 7), cast('Nick Cannon', 8), cast('Samer Al Masri', 9)],
  },
  {
    title: 'The Good Neighbor', year: '2022',
    source: 'https://www.thefilmmakers.com/',
    cast: [cast('Jonathan Rhys Meyers', 1), cast('Eloise Smyth', 2), cast('Luke Kleintank', 3)],
  },
  {
    title: 'Warhunt', year: '2022',
    source: 'https://www.thefilmmakers.com/war-hunt-2022',
    cast: [cast('Mickey Rourke', 10), cast('Robert Knepper', 11), cast('Jackson Rathbone', 12)],
  },
  {
    title: 'Beyond the Likes', year: '2024',
    source: 'https://www.thefilmmakers.com/btl',
    cast: [
      cast('Don Benjamin', 13), cast('Tosin Morohunfola', 14), cast('Matt Rife', 15),
      cast('DeStorm Power', 16), cast('Wesley Armstrong', 17), cast('Samer Al Masri', 9),
      cast('Jumana Murad', 18), cast('King Bach', 19), cast('George Lopez', 20),
      cast('Adam Waheed', 21), cast('Yancey Arias', 22), cast('Ahmed El Mawas', 23),
      cast('Terrence J', 24), cast('Stephanie Nur', 25),
    ],
  },
];
