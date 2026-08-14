create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;

create type public.organization_role as enum ('member', 'admin', 'owner');
create type public.organization_join_request_status as enum ('pending', 'accepted', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 40),
  display_name text not null check (char_length(display_name) between 2 and 80),
  initials text not null check (char_length(initials) between 1 and 4),
  avatar_color text not null default '#FF6246' check (avatar_color ~ '^#[0-9A-Fa-f]{6}$'),
  bio text check (bio is null or char_length(bio) <= 240),
  affiliation text check (affiliation is null or char_length(affiliation) <= 100),
  campus text check (campus is null or char_length(campus) <= 100),
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 80),
  slug text not null unique check (char_length(slug) between 3 and 100),
  description text not null check (char_length(description) between 12 and 500),
  accent text not null default '#159A79' check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.organization_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.organization_join_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.organization_join_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  unique (organization_id, user_id)
);

create index organization_memberships_user_idx on public.organization_memberships(user_id);
create index organization_memberships_org_role_idx on public.organization_memberships(organization_id, role);
create index organization_join_requests_user_idx on public.organization_join_requests(user_id);
create index organization_join_requests_org_status_idx on public.organization_join_requests(organization_id, status);

create or replace function public.profile_initials(display_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select upper(left(coalesce((regexp_split_to_array(trim(display_name), '\s+'))[1], 'R'), 1) || left(coalesce((regexp_split_to_array(trim(display_name), '\s+'))[2], ''), 1));
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  new_display_name text;
  username_base text;
begin
  new_display_name := trim(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'Usuario Retorna'));
  username_base := lower(regexp_replace(split_part(coalesce(new.email, new.id::text), '@', 1), '[^a-zA-Z0-9._-]+', '-', 'g'));
  insert into public.profiles (id, username, display_name, initials)
  values (
    new.id,
    left(username_base, 30) || '-' || left(new.id::text, 6),
    new_display_name,
    public.profile_initials(new_display_name)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_organization_admin(target_organization_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = target_organization_id
      and user_id = target_user_id
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_organization_member(target_organization_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = target_organization_id and user_id = target_user_id
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_join_requests enable row level security;

create policy "authenticated users can read profiles"
  on public.profiles for select to authenticated using (true);
create policy "users can update their own profile"
  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "authenticated users can discover organizations"
  on public.organizations for select to authenticated using (true);
create policy "organization admins can update organizations"
  on public.organizations for update to authenticated
  using (public.is_organization_admin(id)) with check (public.is_organization_admin(id));

create policy "users can read their memberships and admins can read their organization"
  on public.organization_memberships for select to authenticated
  using (user_id = auth.uid() or public.is_organization_admin(organization_id));

create policy "users and organization admins can read join requests"
  on public.organization_join_requests for select to authenticated
  using (user_id = auth.uid() or public.is_organization_admin(organization_id));
create policy "users can request membership"
  on public.organization_join_requests for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and not public.is_organization_member(organization_id)
  );
create policy "users can retry a rejected request"
  on public.organization_join_requests for update to authenticated
  using (user_id = auth.uid() and status = 'rejected')
  with check (user_id = auth.uid() and status = 'pending' and resolved_at is null and resolved_by is null);

create or replace function public.create_organization(
  organization_name text,
  organization_description text,
  organization_accent text default '#159A79'
)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  created_organization_id uuid;
  normalized_slug text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if char_length(trim(organization_name)) < 3 or char_length(trim(organization_description)) < 12 then
    raise exception 'invalid organization data';
  end if;
  normalized_slug := trim(both '-' from lower(regexp_replace(extensions.unaccent(trim(organization_name)), '[^a-zA-Z0-9]+', '-', 'g')));
  insert into public.organizations (name, slug, description, accent, created_by)
  values (trim(organization_name), normalized_slug, trim(organization_description), organization_accent, auth.uid())
  returning id into created_organization_id;

  insert into public.organization_memberships (organization_id, user_id, role)
  values (created_organization_id, auth.uid(), 'owner');
  return created_organization_id;
end;
$$;

create or replace function public.review_organization_join_request(
  request_id uuid,
  decision public.organization_join_request_status
)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  target_request public.organization_join_requests;
begin
  if decision not in ('accepted', 'rejected') then raise exception 'invalid decision'; end if;
  select * into target_request from public.organization_join_requests where id = request_id for update;
  if target_request.id is null or target_request.status <> 'pending' then raise exception 'request unavailable'; end if;
  if not public.is_organization_admin(target_request.organization_id) then raise exception 'permission denied'; end if;

  update public.organization_join_requests
  set status = decision, resolved_at = now(), resolved_by = auth.uid()
  where id = request_id;

  if decision = 'accepted' then
    insert into public.organization_memberships (organization_id, user_id, role)
    values (target_request.organization_id, target_request.user_id, 'member')
    on conflict (organization_id, user_id) do nothing;
  end if;
end;
$$;

revoke all on function public.create_organization(text, text, text) from public;
revoke all on function public.review_organization_join_request(uuid, public.organization_join_request_status) from public;
grant execute on function public.create_organization(text, text, text) to authenticated;
grant execute on function public.review_organization_join_request(uuid, public.organization_join_request_status) to authenticated;
