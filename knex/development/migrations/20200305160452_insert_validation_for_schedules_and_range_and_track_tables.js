exports.up = function(knex) {
  return knex.schema
    .raw("\
create function propagate_ins_scheduled_range_supervision_to_range_supervision() \
returns trigger as \
$BODY$ \
begin \
        insert into range_supervision(scheduled_range_supervision_id, range_supervisor) \
        values(new.id, 'absent'); \
        return new; \
end; \
$BODY$ \
language plpgsql")
    .raw("\
create trigger after_insert_prop_to_range_supervision \
after insert on scheduled_range_supervision \
for each row \
execute procedure propagate_ins_scheduled_range_supervision_to_range_supervision()")
    .raw("\
create function propagate_ins_scheduled_range_supervision_to_track_supervision() \
returns trigger as \
$BODY$ \
begin \
        insert into track_supervision(scheduled_range_supervision_id, track_supervisor) \
        values(new.id, 'absent'); \
        return new; \
end; \
$BODY$ \
language plpgsql")
    .raw("\
create trigger after_insert_prop_to_track_supervision \
after insert on scheduled_range_supervision \
for each row \
execute procedure propagate_ins_scheduled_range_supervision_to_track_supervision()")
}

exports.down = function(knex) {
  return knex.schema
    .raw("drop trigger after_insert_prop_to_range_supervision on scheduled_range_supervision")
    .raw("drop function propagate_ins_scheduled_range_supervision_to_range_supervision()")
    .raw("drop trigger after_insert_prop_to_track_supervision on scheduled_range_supervision")
    .raw("drop function propagate_ins_scheduled_range_supervision_to_track_supervision()")
}
