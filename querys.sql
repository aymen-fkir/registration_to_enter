create database registration_db;
use registration_db;
create table registration_tb(
    id int primary key auto_increment
    ,email varchar(255)
    ,name varchar(255)
    ,lastname varchar(255)
    ,arival datetime
    ,path_to_image varchar(255)
);
