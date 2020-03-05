/*
 * Whenever a new user is added to the database the change has to be reflected
 * to the supervisor table as well. Previously there was no way to make sure
 * the supervisor table was in valid state with the user table. Add user
 * insertion trigger that updates the supervisor table, referencing the new
 * user's id. No need for update, truncate, delete triggers as those are
 * handled by the supervisor's foreign key constraint.
 */

exports.up = function(knex) {
  return knex.schema
  .raw("\
create function propagate_user_insert_to_supervisor() \
returns trigger as \
$BODY$ \
begin \
        insert into supervisor(user_id) \
        values(new.id); \
        return new; \
end; \
$BODY$ \
language plpgsql")
    .raw("\
create trigger after_insert \
after insert on \"user\" \
for each row \
execute procedure propagate_user_insert_to_supervisor()")
}

exports.down = function(knex) {
  return knex.schema
    .raw("drop trigger if exists after_insert on \"user\"")
    .raw("drop function if exists propagate_user_insert_to_supervisor()")
}
