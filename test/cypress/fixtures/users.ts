export const users = {
  superuser: {
    name: 'DevSuperuser',
    role: 'superuser',
    password: '2Gordon62',
    email: 'DevSuperuser@email.com',
  },
  rangemaster: {
    name: 'Ruthie_Leuschke',
    role: 'rangemaster',
    password: '3Katelynn54',
    email: 'Pauline.Schulist@Kozey.name',
  },
  rangeofficer: {
    name: 'DevRangeOfficer1',
    role: 'rangeofficer',
    password: '4Jaron49',
    phone: '788-709-3147',
    email: 'DevRangeOfficer1@hotmail.com',
  },
  association: {
    name: 'DevAssociation',
    role: 'association',
    password: '5Effie38',
    phone: '905-680-0458',
    email: 'DevAssociation@yahoo.com',
  },
  tempUser: {
    name: 'CypressUser',
    role: '',
    password: '0Marilou36',
    email: 'CypressUser@email.com',
  },
};

export type Username = keyof typeof users;
