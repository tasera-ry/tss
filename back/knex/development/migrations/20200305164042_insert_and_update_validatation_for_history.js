// looks hacky
exports.up = function(knex) {
  return knex.schema
    .raw('\
create function propagate_insert_range_supervision_to_history() \
returns trigger as \
$BODY$ \
begin \
        insert into range_supervision_history( \
                scheduled_range_supervision_id \
                , updated_at \
                , range_supervisor \
                , notice) \
        values( \
                new.scheduled_range_supervision_id \
                , new.updated_at \
                , new.range_supervisor \
                , new.notice); \
        return new; \
end; \
$BODY$ \
language plpgsql')
    .raw('\
create trigger after_insert_propagate_to_history \
after insert on range_supervision \
for each row \
execute procedure propagate_insert_range_supervision_to_history()')
    .raw('\
create function propagate_insert_track_supervision_to_history() \
returns trigger as \
$BODY$ \
begin \
        insert into track_supervision_history( \
                scheduled_range_supervision_id \
                , track_id \
                , updated_at \
                , track_supervisor \
                , notice) \
        values( \
                new.scheduled_range_supervision_id \
                , new.track_id \
                , new.updated_at \
                , new.track_supervisor \
                , new.notice); \
        return new; \
end; \
$BODY$ \
language plpgsql')
    .raw('\
create trigger after_insert_propagate_to_history \
after insert on track_supervision \
for each row \
execute procedure propagate_insert_track_supervision_to_history()')
    .raw('\
create function propagate_update_range_supervision_to_history() \
returns trigger as \
$BODY$ \
begin \
        insert into range_supervision_history( \
                scheduled_range_supervision_id \
                , updated_at \
                , range_supervisor \
                , notice) \
        values( \
                new.scheduled_range_supervision_id \
                , new.updated_at \
                , new.range_supervisor \
                , new.notice); \
        return new; \
end; \
$BODY$ \
language plpgsql')
    .raw('\
create trigger after_update_propagate_to_history \
after update on range_supervision \
for each row \
execute procedure propagate_update_range_supervision_to_history()')
    .raw('\
create function propagate_update_track_supervision_to_history() \
returns trigger as \
$BODY$ \
begin \
        insert into track_supervision_history( \
                scheduled_range_supervision_id \
                , track_id \
                , updated_at \
                , track_supervisor \
                , notice) \
        values( \
                new.scheduled_range_supervision_id \
                , new.track_id \
                , new.updated_at \
                , new.track_supervisor \
                , new.notice); \
        return new; \
end; \
$BODY$ \
language plpgsql')
    .raw('\
create trigger after_update_propagate_to_history \
after update on track_supervision \
for each row \
execute procedure propagate_update_track_supervision_to_history()');
};

exports.down = function(knex) {
  return knex.schema
    .raw('drop trigger after_insert_propagate_to_history on range_supervision')
    .raw('drop function propagate_insert_range_supervision_to_history()')
    .raw('drop trigger after_insert_propagate_to_history on track_supervision')
    .raw('drop function propagate_insert_track_supervision_to_history()')
    .raw('drop trigger after_update_propagate_to_history on range_supervision')
    .raw('drop function propagate_update_range_supervision_to_history()')
    .raw('drop trigger after_update_propagate_to_history on track_supervision')
    .raw('drop function propagate_update_track_supervision_to_history()');
};
