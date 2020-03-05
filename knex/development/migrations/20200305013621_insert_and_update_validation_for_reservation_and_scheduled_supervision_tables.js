exports.up = function(knex) {
  return knex.schema
    .raw("\
create function propagate_ins_range_reservation_to_scheduled_range_supervision() \
returns trigger as \
$BODY$ \
begin \
        insert into scheduled_range_supervision(range_reservation_id) \
        values(new.id); \
        return new; \
end; \
$BODY$ \
language plpgsql")
    .raw("\
create trigger after_insert \
after insert on range_reservation \
for each row \
execute procedure propagate_ins_range_reservation_to_scheduled_range_supervision()")
    .raw("\
create function propagate_upd_range_reservation_to_scheduled_range_supervision() \
returns trigger as \
$BODY$ \
begin \
        if old.available = true and new.available = false \
        then \
                delete from scheduled_range_supervision \
                where new.id = scheduled_range_supervision.range_reservation_id; \
        elsif old.available = false and new.available = true \
        then \
                insert into scheduled_range_supervision(range_reservation_id) \
                values(new.id); \
        end if; \
        return new; \
end; \
$BODY$ \
language plpgsql")
    .raw("\
create trigger after_update \
after update on range_reservation \
for each row \
execute procedure propagate_upd_range_reservation_to_scheduled_range_supervision()")
}

exports.down = function(knex) {
  return knex.schema
    .raw("drop trigger after_insert on range_reservation")
    .raw("drop function propagate_ins_range_reservation_to_scheduled_range_supervision()")
    .raw("drop trigger after_update on range_reservation")
    .raw("drop function propagate_upd_range_reservation_to_scheduled_range_supervision()")
}
