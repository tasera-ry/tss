const date = new Date('2020-10-21T11:30:57.000Z');
let week = [{}, {}, {}, {}, {}, {}, {}];
week = week.map(() => ({
  available: true,
  close: '06:08:00',
  date: '2020-10-21',
  open: '03:11:00',
  rangeId: 1,
  rangeSupervision: 'absent',
  rangeSupervisionScheduled: true,
  rangeSupervisorId: 50,
  reservationId: 300,
  scheduleId: 251,
}));
const schedule = {
  date: '2020-10-21',
  rangeId: 1,
  reservationId: 300,
  scheduleId: 251,
  open: '03:11:00',
  close: '06:08:00',
  available: true,
  rangeSupervisorId: 50,
  rangeSupervision: 'closed',
  rangeSupervisionScheduled: true,
  tracks: [
    {
      id: 1,
      name: 'Shooting Track 0',
      description: 'Pistol 300m',
      short_description: 's 0',
      notice:
        'Quis recusandae doloremque. Sapiente dolore illo qui et. Blanditiis sequi perferendis qui. Sit delectus doloremque.',
      trackSupervision: 'absent',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 1,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice:
          'Quis recusandae doloremque. Sapiente dolore illo qui et. Blanditiis sequi perferendis qui. Sit delectus doloremque.',
        track_supervisor: 'absent',
        visitors: 5,
      },
    },
    {
      id: 2,
      name: 'Shooting Track 1',
      description: 'Pistol 300m',
      short_description: 's 1',
      notice:
        'Eligendi rerum quam dolorem quae incidunt. Ipsum et inventore possimus consectetur reprehenderit magnam beatae aperiam. Dignissimos facere voluptas quia et consequatur.',
      trackSupervision: 'closed',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 2,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice:
          'Eligendi rerum quam dolorem quae incidunt. Ipsum et inventore possimus consectetur reprehenderit magnam beatae aperiam. Dignissimos facere voluptas quia et consequatur.',
        track_supervisor: 'closed',
      },
    },
    {
      id: 3,
      name: 'Shooting Track 2',
      description: 'Rifle 100m',
      short_description: 's 2',
      notice: 'Earum cupiditate impedit quia. Est aut enim animi quod.',
      trackSupervision: 'absent',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 3,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice: 'Earum cupiditate impedit quia. Est aut enim animi quod.',
        track_supervisor: 'absent',
      },
    },
    {
      id: 4,
      name: 'Shooting Track 3',
      description: 'Rifle 10m',
      short_description: 's 3',
      notice:
        'Accusantium enim delectus qui commodi et soluta sunt. Sequi voluptatibus quidem blanditiis amet ipsa delectus a aut quae. Repellendus ea perferendis.',
      trackSupervision: 'present',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 4,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice:
          'Accusantium enim delectus qui commodi et soluta sunt. Sequi voluptatibus quidem blanditiis amet ipsa delectus a aut quae. Repellendus ea perferendis.',
        track_supervisor: 'present',
      },
    },
    {
      id: 5,
      name: 'Shooting Track 4',
      description: 'Rifle 50m',
      short_description: 's 4',
      notice:
        'Voluptate provident est suscipit expedita dolore molestiae sed. Qui aspernatur beatae ab natus sit non sapiente doloribus perferendis. Veritatis eaque eveniet quo necessitatibus natus eum reprehenderit nobis. Molestiae dolor est.',
      trackSupervision: 'closed',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 5,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice:
          'Voluptate provident est suscipit expedita dolore molestiae sed. Qui aspernatur beatae ab natus sit non sapiente doloribus perferendis. Veritatis eaque eveniet quo necessitatibus natus eum reprehenderit nobis. Molestiae dolor est.',
        track_supervisor: 'closed',
      },
    },
    {
      id: 6,
      name: 'Shooting Track 5',
      description: 'Rifle 25m',
      short_description: 's 5',
      notice:
        'Esse eum deleniti. Sint animi cum omnis voluptatem facere voluptas distinctio. Impedit officia cum expedita iusto voluptas.',
      trackSupervision: 'present',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 6,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice:
          'Esse eum deleniti. Sint animi cum omnis voluptatem facere voluptas distinctio. Impedit officia cum expedita iusto voluptas.',
        track_supervisor: 'present',
      },
    },
    {
      id: 7,
      name: 'Shooting Track 6',
      description: 'Shotgun 100m',
      short_description: 's 6',
      notice: 'Nemo nam est quia animi. Enim et aut.',
      trackSupervision: 'absent',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 7,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice: 'Nemo nam est quia animi. Enim et aut.',
        track_supervisor: 'absent',
      },
    },
  ],
};

const reservation = [
  {
    id: 300,
    range_id: 1,
    date: '2020-04-08T00:00:00.000Z',
    available: true,
  },
];

const association = [
  {
    id: 50,
    name: 'test_user',
    digest: 'password_digest',
    role: 'association',
  },
];

const oneSchedule = [
  {
    id: 39,
    range_reservation_id: 300,
    association_id: 50,
    open: '16:00:00',
    close: '21:00:00',
  },
];

const users = [
  {
    id: 1,
    name: 'Ruthie_Leuschke',
    role: 'association',
    phone: '446-488-2743',
  },
  {
    id: 2,
    name: 'Kenyon.Howell',
    role: 'association',
    phone: '617-780-8378',
  },
];

export default {
  date,
  week,
  schedule,
  reservation,
  association,
  oneSchedule,
  users,
};
