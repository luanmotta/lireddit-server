import { Migration } from '@mikro-orm/migrations';

export class Migration20210227211009 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "person" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null);');
    this.addSql('alter table "person" add constraint "person_username_unique" unique ("username");');

    this.addSql('create table "post" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null);');
  }

}
