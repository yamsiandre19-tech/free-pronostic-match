-- Profils (liés aux comptes Supabase Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  plan text not null default 'FREE' check (plan in ('FREE','PRO')),
  pro_until timestamptz,
  created_at timestamptz default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();

-- Football
create table if not exists teams (
  id bigint primary key, name text, crest text
);

create table if not exists matches (
  id bigint primary key,
  competition_code text, competition_name text,
  utc_date timestamptz, status text,
  home_id bigint, away_id bigint,
  home_name text, away_name text, home_crest text, away_crest text,
  home_goals int, away_goals int,
  updated_at timestamptz default now()
);
create index if not exists matches_date_idx on matches (utc_date);
create index if not exists matches_home_idx on matches (home_id);
create index if not exists matches_away_idx on matches (away_id);

create table if not exists predictions (
  match_id bigint primary key references matches(id) on delete cascade,
  p_home numeric, p_draw numeric, p_away numeric, pick_1n2 text,
  btts_yes numeric, pick_btts text,
  over25 numeric, pick_ou text,
  top_scores jsonb, confidence numeric,
  created_at timestamptz default now()
);

-- Paiements
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  method text not null check (method in ('manual','auto')),
  amount int not null,
  commission int not null default 0,
  phone text, reference text,
  order_id text unique, pay_token text, notif_token text unique,
  status text not null default 'pending' check (status in ('pending','verified','rejected','failed')),
  created_at timestamptz default now(),
  verified_at timestamptz
);
create unique index if not exists payments_reference_uniq on payments (reference) where reference is not null;

-- Sécurité : tout passe par nos routes serveur (clé service_role).
alter table profiles enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table payments enable row level security;

drop policy if exists "lire son profil" on profiles;
create policy "lire son profil" on profiles for select using (auth.uid() = id);
