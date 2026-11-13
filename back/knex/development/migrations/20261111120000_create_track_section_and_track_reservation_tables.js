// New tables for track section reservations (issue #456).
//
// - A track consists of 1..n sections. Tracks that aren't divided into many
//   sections are considered to have a single section, so track_section is
//   the uniform relation everything else refers to.
// - The reserver is an association user account. A null association_id
//   means no association is behind the reservation: reserved for the
//   military or other authorities (type 'official'), or closed without a
//   booking (type 'closed').
// - Reservations are day-scoped: a date column plus start_time/end_time
//   times of day, matching how the range_reservation and the track view
//   work.
// - Overlapping reservations on the same section must not reserve more
//   lanes combined than the section has, so a constraint trigger rejects
//   reservations that would overcommit a section. (The design says the
//   combined amount should stay under the section's total, but a section
//   booked to exactly its capacity is allowed here.)

exports.up = function(knex) {
  return knex.schema
    .raw('create type reservation_type as enum (\'private_event\', \'official\', \'closed\')')
    .createTable('track_section', trackSection => {
      trackSection.increments('id');
      trackSection.integer('track_id')
        .references('id')
        .inTable('track')
        .notNullable()
        .onDelete('CASCADE');
      // Display order of the sections within their track.
      trackSection.integer('position')
        .notNullable();
      trackSection.integer('lane_count')
        .notNullable();
      trackSection.string('name')
        .notNullable();
      trackSection.string('description')
        .notNullable();
      trackSection.index('track_id');
    })
    .createTable('track_reservation', trackReservation => {
      trackReservation.increments('id');
      // Nullable on purpose: null means no association is behind the
      // reservation (military/official use, or a plain closure).
      trackReservation.integer('association_id')
        .references('id')
        .inTable('user');
      trackReservation.enu('type', ['private_event', 'official', 'closed'], {
        useNative: true,
        existingType: true,
        enumName: 'reservation_type'
      }).notNullable();
      trackReservation.date('date')
        .notNullable();
      trackReservation.time('start_time')
        .notNullable();
      trackReservation.time('end_time')
        .notNullable();
      trackReservation.integer('lanes_used')
        .notNullable();
      trackReservation.integer('track_section_id')
        .references('id')
        .inTable('track_section')
        .notNullable()
        .onDelete('CASCADE');
      trackReservation.string('description');
      trackReservation.index('association_id');
      trackReservation.index('track_section_id');
      trackReservation.index('date');
    })
    .raw('alter table track_reservation add constraint reservation_time_order check (start_time < end_time)')
    .raw(`
      create or replace function enforce_section_lane_capacity()
      returns trigger as $$
      declare
        section_total integer;
        others_peak integer;
      begin
        select lane_count into section_total
        from track_section
        where id = new.track_section_id;

        if not found then
          raise exception 'Reservation % references non-existent section %', new.id, new.track_section_id;
        end if;

        -- The concurrent lane usage of the other reservations peaks either at
        -- the start of the new reservation or at the start of one of the
        -- reservations overlapping it, so checking those instants suffices.
        select coalesce(max(peak), 0) into others_peak
        from (
          select sum(track_reservation.lanes_used) as peak
          from (
                   select new.start_time as instant
            union select r2.start_time
                  from track_reservation r2
                  where r2.track_section_id = new.track_section_id
                    and r2.date = new.date
                    and r2.id is distinct from new.id
                    and r2.start_time > new.start_time
                    and r2.start_time < new.end_time
          ) as instants
          left join track_reservation
            on track_reservation.track_section_id = new.track_section_id
            and track_reservation.date = new.date
            and track_reservation.id is distinct from new.id
            and track_reservation.start_time <= instants.instant
            and track_reservation.end_time > instants.instant
          group by instants.instant
        ) as peaks;

        if others_peak + new.lanes_used > section_total then
          raise exception 'Reservation of % lane(s) on section % on % overlaps reservations already using % of the section''s % lane(s)',
            new.lanes_used, new.track_section_id, new.date, others_peak, section_total;
        end if;

        return null;
      end;
      $$ language plpgsql;
    `)
    .raw(`
      create constraint trigger track_reservation_lane_capacity
      after insert or update of lanes_used, start_time, end_time, date, track_section_id
      on track_reservation
      deferrable initially immediate
      for each row execute function enforce_section_lane_capacity();
    `);
};

exports.down = function(knex) {
  return knex.schema
    .raw('drop trigger if exists track_reservation_lane_capacity on track_reservation')
    .raw('drop function if exists enforce_section_lane_capacity')
    .dropTableIfExists('track_reservation')
    .dropTableIfExists('track_section')
    .raw('drop type if exists reservation_type');
};
