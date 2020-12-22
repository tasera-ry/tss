const monthArray = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
  {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
  {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
const month = (mm, day) => monthArray.map(() => ({
  available: true,
  close: '06:08:00',
  date: `2020-${mm}-${day}`,
  open: '03:11:00',
  rangeId: 1,
  rangeSupervision: 'absent',
  rangeSupervisionScheduled: true,
  rangeSupervisorId: 50,
  reservationId: 300,
  scheduleId: 251,
  tracks: [
    {
      description: 'Pistol 300m',
      id: 1,
      name: 'Shooting Track 0',
      notice: 'Quis recusandae doloremque. Sapiente dolore illo qui et. Blanditiis sequi perferendis qui. Sit delectus doloremque.',
      short_description: 's 0',
      trackSupervision: 'absent',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 1,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice: 'Quis recusandae doloremque. Sapiente dolore illo qui et. Blanditiis sequi perferendis qui. Sit delectus doloremque.',
        track_supervisor: 'absent',
      },
    },
    {
      description: 'Pistol 300m',
      id: 2,
      name: 'Shooting Track 1',
      notice: 'Eligendi rerum quam dolorem quae incidunt. Ipsum et inventore possimus consectetur reprehenderit magnam beatae aperiam. Dignissimos facere voluptas quia et consequatur.',
      short_description: 's 1',
      trackSupervision: 'closed',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 2,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice: 'Eligendi rerum quam dolorem quae incidunt. Ipsum et inventore possimus consectetur reprehenderit magnam beatae aperiam. Dignissimos facere voluptas quia et consequatur.',
        track_supervisor: 'closed',
      },
    },
    {
      description: 'Rifle 100m',
      id: 3,
      name: 'Shooting Track 2',
      notice: 'Earum cupiditate impedit quia. Est aut enim animi quod.',
      short_description: 's 0',
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
      description: 'Rifle 10m',
      id: 4,
      name: 'Shooting Track 3',
      notice: 'Accusantium enim delectus qui commodi et soluta sunt. Sequi voluptatibus quidem blanditiis amet ipsa delectus a aut quae. Repellendus ea perferendis.',
      short_description: 's 3',
      trackSupervision: 'present',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 4,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice: 'Accusantium enim delectus qui commodi et soluta sunt. Sequi voluptatibus quidem blanditiis amet ipsa delectus a aut quae. Repellendus ea perferendis.',
        track_supervisor: 'present',
      },
    },
    {
      description: 'Rifle 50m',
      id: 5,
      name: 'Shooting Track 4',
      notice: 'Voluptate provident est suscipit expedita dolore molestiae sed. Qui aspernatur beatae ab natus sit non sapiente doloribus perferendis. Veritatis eaque eveniet quo necessitatibus natus eum reprehenderit nobis. Molestiae dolor est.',
      short_description: 's 4',
      trackSupervision: 'closed',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 5,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice: 'Voluptate provident est suscipit expedita dolore molestiae sed. Qui aspernatur beatae ab natus sit non sapiente doloribus perferendis. Veritatis eaque eveniet quo necessitatibus natus eum reprehenderit nobis. Molestiae dolor est.',
        track_supervisor: 'closed',
      },
    },
    {
      description: 'rifle 25m',
      id: 6,
      name: 'Shooting Track 5',
      notice: 'Esse eum deleniti. Sint animi cum omnis voluptatem facere voluptas distinctio. Impedit officia cum expedita iusto voluptas.',
      short_description: 's 5',
      trackSupervision: 'present',
      scheduled: {
        scheduled_range_supervision_id: 251,
        track_id: 6,
        updated_at: '2020-10-21T17:53:56.254Z',
        notice: 'Esse eum deleniti. Sint animi cum omnis voluptatem facere voluptas distinctio. Impedit officia cum expedita iusto voluptas.',
        track_supervisor: 'present',
      },
    },
    {
      description: 'shotgun 100m',
      id: 7,
      name: 'Shooting Track 6',
      notice: 'Nemo nam est quia animi. Enim et aut.',
      short_description: 's 6',
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
}));

export default {
  month,
};