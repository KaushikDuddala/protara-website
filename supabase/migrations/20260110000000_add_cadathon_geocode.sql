-- Add lat/lng columns to cadathon_signups for pre-geocoded coordinates
alter table cadathon_signups add column if not exists lat double precision;
alter table cadathon_signups add column if not exists lng double precision;
