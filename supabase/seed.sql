-- Datos exclusivamente locales/de desarrollo.
-- Contraseña compartida por estas cuentas: Retorna123!

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'martina.rojas@uc.cl', extensions.crypt('Retorna123!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Martina Rojas"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'diego.araya@uc.cl', extensions.crypt('Retorna123!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Diego Araya"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'sofia.munoz@uc.cl', extensions.crypt('Retorna123!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Sofía Muñoz"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  ('martina.rojas@uc.cl', '10000000-0000-0000-0000-000000000001', '{"sub":"10000000-0000-0000-0000-000000000001","email":"martina.rojas@uc.cl"}', 'email', now(), now(), now()),
  ('diego.araya@uc.cl', '10000000-0000-0000-0000-000000000002', '{"sub":"10000000-0000-0000-0000-000000000002","email":"diego.araya@uc.cl"}', 'email', now(), now(), now()),
  ('sofia.munoz@uc.cl', '10000000-0000-0000-0000-000000000003', '{"sub":"10000000-0000-0000-0000-000000000003","email":"sofia.munoz@uc.cl"}', 'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

update public.profiles set affiliation = 'Ingeniería UC', campus = 'San Joaquín', bio = 'Ingeniería, movilidad y economía circular.' where id = '10000000-0000-0000-0000-000000000001';
update public.profiles set affiliation = 'Ingeniería UC', campus = 'San Joaquín' where id = '10000000-0000-0000-0000-000000000002';
update public.profiles set affiliation = 'Arquitectura UC', campus = 'Lo Contador' where id = '10000000-0000-0000-0000-000000000003';

insert into public.organizations (id, name, slug, description, accent, created_by)
values
  ('20000000-0000-0000-0000-000000000001', 'Ingeniería Circular', 'ingenieria-circular', 'Organización UC que impulsa proyectos y hábitos de economía circular.', '#F3B72E', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', 'Campus San Joaquín Sustentable', 'campus-san-joaquin-sustentable', 'Estudiantes y equipos del campus coordinando iniciativas sustentables.', '#159A79', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Diseño y Arquitectura Circular', 'diseno-arquitectura-circular', 'Red interdisciplinaria para diseñar espacios y materiales con menos residuos.', '#EF6F61', '10000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

insert into public.organization_memberships (organization_id, user_id, role)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'owner'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'admin'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'owner'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'owner')
on conflict (organization_id, user_id) do nothing;

insert into public.organization_join_requests (organization_id, user_id, status)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'pending')
on conflict (organization_id, user_id) do nothing;
