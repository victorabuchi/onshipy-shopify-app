exports.up = function(knex) {
  return knex.schema

    .createTableIfNotExists('shopify_sessions', function(table) {
      table.increments('id').primary();
      table.string('shop').notNullable().unique();
      table.string('access_token').notNullable();
      table.string('shop_name');
      table.string('email');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    .createTableIfNotExists('shopify_oauth_nonces', function(table) {
      table.increments('id').primary();
      table.string('nonce').notNullable().unique();
      table.string('shop').notNullable().unique();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('shopify_oauth_nonces')
    .dropTableIfExists('shopify_sessions');
};